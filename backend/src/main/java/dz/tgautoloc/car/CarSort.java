package dz.tgautoloc.car;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

/** Whitelisted sort options; arbitrary client-provided sort properties are never passed to JPA. */
public enum CarSort {
    NEWEST(Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))),
    OLDEST(Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("id"))),
    PRICE_ASC(null),
    PRICE_DESC(null),
    YEAR_DESC(Sort.by(Sort.Order.desc("year"), Sort.Order.desc("id"))),
    BRAND_ASC(Sort.by(Sort.Order.asc("brand"), Sort.Order.asc("model"), Sort.Order.desc("id"))),
    UPDATED(Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id")));

    private final Sort sort;

    CarSort(Sort sort) {
        this.sort = sort;
    }

    /** Pageable sort; unsorted for price orders, which are applied by {@link #ordering()}. */
    public Sort sort() {
        return sort == null ? Sort.unsorted() : sort;
    }

    /**
     * Price orders keep cars without a price ("price on request") last in both directions.
     * Criteria queries do not support NULLS LAST, so the ordering is expressed with a CASE.
     * Spring Data clears these orderings for the count query.
     */
    public Specification<Car> ordering() {
        if (sort != null) {
            return null;
        }
        boolean ascending = this == PRICE_ASC;
        return (root, query, cb) -> {
            var price = root.<BigDecimal>get("dailyPrice");
            query.orderBy(
                    cb.asc(cb.selectCase().when(cb.isNull(price), 1).otherwise(0)),
                    ascending ? cb.asc(price) : cb.desc(price),
                    cb.desc(root.get("id")));
            return null;
        };
    }

    public static CarSort parse(String value) {
        if (value == null || value.isBlank()) {
            return NEWEST;
        }
        try {
            return valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return NEWEST;
        }
    }
}
