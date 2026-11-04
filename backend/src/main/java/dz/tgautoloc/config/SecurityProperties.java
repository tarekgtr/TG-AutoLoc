package dz.tgautoloc.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public record SecurityProperties(Login login, BootstrapAdmin bootstrapAdmin) {

    public record Login(int maxAttempts, Duration lockDuration) {
    }

    public record BootstrapAdmin(String username, String password) {
    }
}
