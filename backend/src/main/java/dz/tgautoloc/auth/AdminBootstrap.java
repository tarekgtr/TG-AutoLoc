package dz.tgautoloc.auth;

import dz.tgautoloc.config.SecurityProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the first administrator from ADMIN_BOOTSTRAP_USERNAME / ADMIN_BOOTSTRAP_PASSWORD,
 * only when no administrator exists yet. There is no public sign-up endpoint.
 * Remove the variables from the environment once the account exists.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    static final int MIN_PASSWORD_LENGTH = 12;
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final SecurityProperties properties;

    public AdminBootstrap(AdminUserRepository admins, PasswordEncoder passwordEncoder, SecurityProperties properties) {
        this.admins = admins;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (admins.count() > 0) {
            return;
        }
        SecurityProperties.BootstrapAdmin bootstrap = properties.bootstrapAdmin();
        String username = bootstrap == null ? null : bootstrap.username();
        String password = bootstrap == null ? null : bootstrap.password();
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            log.warn("No administrator account exists. Set ADMIN_BOOTSTRAP_USERNAME and ADMIN_BOOTSTRAP_PASSWORD "
                    + "and restart to create one (see README).");
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException("ADMIN_BOOTSTRAP_PASSWORD must be at least " + MIN_PASSWORD_LENGTH + " characters");
        }
        if (!username.matches("[A-Za-z0-9._@-]{3,50}")) {
            throw new IllegalStateException("ADMIN_BOOTSTRAP_USERNAME must be 3-50 characters of letters, digits or . _ @ -");
        }
        admins.save(new AdminUser(username.trim(), passwordEncoder.encode(password)));
        log.info("Created initial administrator '{}'. You can now remove ADMIN_BOOTSTRAP_* from the environment.", username);
    }
}
