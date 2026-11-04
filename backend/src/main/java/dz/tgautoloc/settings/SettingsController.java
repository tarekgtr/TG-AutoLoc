package dz.tgautoloc.settings;

import dz.tgautoloc.settings.SettingsDtos.SettingsDto;
import dz.tgautoloc.settings.SettingsDtos.SettingsRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "Business settings")
public class SettingsController {

    private final SettingsService settings;

    public SettingsController(SettingsService settings) {
        this.settings = settings;
    }

    @GetMapping("/api/public/settings")
    @Operation(summary = "Public contact details (WhatsApp, phone, location, opening hours)")
    public SettingsDto publicSettings() {
        return settings.get();
    }

    @GetMapping("/api/admin/settings")
    public SettingsDto adminSettings() {
        return settings.get();
    }

    @PutMapping("/api/admin/settings")
    @Operation(summary = "Update contact details", description = "Phone numbers are normalised to international digits, "
            + "e.g. '0552 12 34 56' becomes '213552123456'.")
    public SettingsDto update(@Valid @RequestBody SettingsRequest request) {
        return settings.update(request);
    }
}
