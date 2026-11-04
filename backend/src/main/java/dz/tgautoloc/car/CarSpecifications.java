package dz.tgautoloc.car;

import java.math.BigDecimal;
import java.util.Locale;

import org.springframework.data.jpa.domain.Specification;

final class CarSpecifications {

    private CarSpecifications() {
    }

    static Specification<Car> available(Boolean available) {
        return (root, q, cb) -> available == null ? null : cb.equal(root.get("available"), available);
    }

    /** Case-insensitive match on brand, model or "brand model". */
    static Specification<Car> search(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String like = "%" + escapeLike(text.trim().toLowerCase(Locale.ROOT)) + "%";
        return (root, q, cb) -> cb.or(
                cb.like(cb.lower(root.get("brand")), like, '\\'),
                cb.like(cb.lower(root.get("model")), like, '\\'),
                cb.like(cb.lower(cb.concat(cb.concat(root.get("brand"), " "), root.get("model"))), like, '\\'));
    }

    static Specification<Car> brand(String brand) {
        if (brand == null || brand.isBlank()) {
            return null;
        }
        return (root, q, cb) -> cb.equal(cb.lower(root.get("brand")), brand.trim().toLowerCase(Locale.ROOT));
    }

    static Specification<Car> transmission(Transmission transmission) {
        return (root, q, cb) -> transmission == null ? null : cb.equal(root.get("transmission"), transmission);
    }

    static Specification<Car> fuelType(FuelType fuelType) {
        return (root, q, cb) -> fuelType == null ? null : cb.equal(root.get("fuelType"), fuelType);
    }

    static Specification<Car> minPrice(BigDecimal min) {
        return (root, q, cb) -> min == null ? null : cb.greaterThanOrEqualTo(root.get("dailyPrice"), min);
    }

    static Specification<Car> maxPrice(BigDecimal max) {
        return (root, q, cb) -> max == null ? null : cb.lessThanOrEqualTo(root.get("dailyPrice"), max);
    }

    private static String escapeLike(String s) {
        return s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
