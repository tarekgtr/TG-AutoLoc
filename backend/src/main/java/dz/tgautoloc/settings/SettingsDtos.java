package dz.tgautoloc.settings;

import java.time.Instant;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class SettingsDtos {

    private static final String HTTPS_URL = "^$|^https://[^\\s<>\"]+$";

    private SettingsDtos() {
    }

    /** Public contact details. Contains no private data by design: everything here is shown on the website. */
    public record SettingsDto(
            String whatsappNumber,
            String phoneNumber,
            String secondaryPhone,
            String email,
            String locationFr,
            String locationAr,
            String openingHoursFr,
            String openingHoursAr,
            String mapsUrl,
            String facebookUrl,
            Instant updatedAt) {

        static SettingsDto from(BusinessSettings s) {
            return new SettingsDto(s.getWhatsappNumber(), s.getPhoneNumber(), s.getSecondaryPhone(), s.getEmail(),
                    s.getLocationFr(), s.getLocationAr(), s.getOpeningHoursFr(), s.getOpeningHoursAr(),
                    s.getMapsUrl(), s.getFacebookUrl(), s.getUpdatedAt());
        }
    }

    public record SettingsRequest(
            @Size(max = 30, message = "too_long") String whatsappNumber,
            @Size(max = 30, message = "too_long") String phoneNumber,
            @Size(max = 30, message = "too_long") String secondaryPhone,
            @Email(message = "invalid_email") @Size(max = 120, message = "too_long") String email,
            @Size(max = 255, message = "too_long") String locationFr,
            @Size(max = 255, message = "too_long") String locationAr,
            @Size(max = 255, message = "too_long") String openingHoursFr,
            @Size(max = 255, message = "too_long") String openingHoursAr,
            @Pattern(regexp = HTTPS_URL, message = "invalid_url") @Size(max = 500, message = "too_long") String mapsUrl,
            @Pattern(regexp = HTTPS_URL, message = "invalid_url") @Size(max = 500, message = "too_long") String facebookUrl) {
    }
}
