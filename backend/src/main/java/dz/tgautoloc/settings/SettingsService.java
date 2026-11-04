package dz.tgautoloc.settings;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;

import dz.tgautoloc.settings.SettingsDtos.SettingsDto;
import dz.tgautoloc.settings.SettingsDtos.SettingsRequest;
import dz.tgautoloc.web.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final BusinessSettingsRepository repository;

    public SettingsService(BusinessSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public SettingsDto get() {
        return SettingsDto.from(load());
    }

    @Transactional
    public SettingsDto update(SettingsRequest r) {
        Map<String, String> errors = new LinkedHashMap<>();
        BusinessSettings s = load();
        setPhone("whatsappNumber", r.whatsappNumber(), s::setWhatsappNumber, errors);
        setPhone("phoneNumber", r.phoneNumber(), s::setPhoneNumber, errors);
        setPhone("secondaryPhone", r.secondaryPhone(), s::setSecondaryPhone, errors);
        if (!errors.isEmpty()) {
            throw ApiException.invalidFields(errors);
        }
        s.setEmail(clean(r.email()));
        s.setLocationFr(clean(r.locationFr()));
        s.setLocationAr(clean(r.locationAr()));
        s.setOpeningHoursFr(clean(r.openingHoursFr()));
        s.setOpeningHoursAr(clean(r.openingHoursAr()));
        s.setMapsUrl(clean(r.mapsUrl()));
        s.setFacebookUrl(clean(r.facebookUrl()));
        repository.flush();
        return SettingsDto.from(s);
    }

    private BusinessSettings load() {
        return repository.findById(BusinessSettings.SINGLETON_ID)
                .orElseThrow(() -> new IllegalStateException("business_settings row missing; check migrations"));
    }

    private static void setPhone(String field, String raw, Consumer<String> setter, Map<String, String> errors) {
        try {
            setter.accept(PhoneNumbers.normalize(raw).orElse(null));
        } catch (IllegalArgumentException e) {
            errors.put(field, "invalid_phone");
        }
    }

    private static String clean(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
