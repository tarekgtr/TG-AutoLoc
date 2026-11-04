package dz.tgautoloc.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI tgAutoLocOpenApi() {
        return new OpenAPI().info(new Info()
                .title("TG AutoLoc API")
                .version("1.0.0")
                .description("Public vehicle catalogue and administrator API for TG AutoLoc. "
                        + "Admin endpoints (/api/admin/**) require a session obtained via POST /api/auth/login, "
                        + "and state-changing requests need an X-XSRF-TOKEN header matching the XSRF-TOKEN cookie."));
    }
}
