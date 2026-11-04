package dz.tgautoloc.settings;

import java.util.Optional;

/**
 * Normalises phone numbers to international digits without "+" (the format wa.me requires).
 * Algerian national numbers ("0552 12 34 56") are converted using country code 213.
 */
public final class PhoneNumbers {

    static final String ALGERIA_COUNTRY_CODE = "213";

    private PhoneNumbers() {
    }

    /**
     * @return normalised digits, empty when the input is blank
     * @throws IllegalArgumentException if the input is not a plausible phone number
     */
    public static Optional<String> normalize(String raw) {
        if (raw == null || raw.isBlank()) {
            return Optional.empty();
        }
        if (!raw.matches("[0-9+()\\s.\\-]+")) {
            throw new IllegalArgumentException("invalid_phone");
        }
        String digits = raw.replaceAll("\\D", "");
        if (raw.strip().startsWith("+")) {
            // already international
        } else if (digits.startsWith("00")) {
            digits = digits.substring(2);
        } else if (digits.startsWith("0") && digits.length() == 10) {
            digits = ALGERIA_COUNTRY_CODE + digits.substring(1);
        }
        if (digits.length() < 8 || digits.length() > 15 || digits.startsWith("0")) {
            throw new IllegalArgumentException("invalid_phone");
        }
        return Optional.of(digits);
    }
}
