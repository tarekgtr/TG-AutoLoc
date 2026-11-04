package dz.tgautoloc.car;

import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Vehicle URLs have the form {@code <brand>-<model>-<id>}, e.g. {@code seat-ibiza-123}.
 * The trailing id is authoritative, so URLs keep resolving after a brand/model edit
 * (the frontend redirects to the canonical slug).
 */
public final class Slugs {

    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern TRAILING_ID = Pattern.compile("(?:^|-)(\\d{1,18})$");
    private static final int MAX_BASE_LENGTH = 120;

    private Slugs() {
    }

    public static String forCar(String brand, String model, long id) {
        String base = slugify(brand + " " + model);
        return base.isEmpty() ? "car-" + id : base + "-" + id;
    }

    static String slugify(String text) {
        String ascii = DIACRITICS.matcher(Normalizer.normalize(text, Normalizer.Form.NFD)).replaceAll("");
        String slug = NON_ALNUM.matcher(ascii.toLowerCase(Locale.ROOT)).replaceAll("-");
        slug = trimDashes(slug);
        if (slug.length() > MAX_BASE_LENGTH) {
            slug = trimDashes(slug.substring(0, MAX_BASE_LENGTH));
        }
        return slug;
    }

    public static Optional<Long> extractId(String slug) {
        if (slug == null) {
            return Optional.empty();
        }
        Matcher m = TRAILING_ID.matcher(slug);
        return m.find() ? Optional.of(Long.parseLong(m.group(1))) : Optional.empty();
    }

    private static String trimDashes(String s) {
        int start = 0;
        int end = s.length();
        while (start < end && s.charAt(start) == '-') {
            start++;
        }
        while (end > start && s.charAt(end - 1) == '-') {
            end--;
        }
        return s.substring(start, end);
    }
}
