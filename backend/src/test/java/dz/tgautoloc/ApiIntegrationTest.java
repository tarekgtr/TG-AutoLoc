package dz.tgautoloc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * End-to-end API tests against a real PostgreSQL (Testcontainers) with Flyway migrations,
 * real Spring Security (session + CSRF) and the local image storage.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Testcontainers
class ApiIntegrationTest {

    private static final String ADMIN = "admin";
    private static final String PASSWORD = "integration-test-password";
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 'I', 'H', 'D', 'R'};

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static Path storageDir;

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) throws IOException {
        storageDir = Files.createTempDirectory("tgautoloc-test-images");
        registry.add("app.storage.local-path", storageDir::toString);
        registry.add("app.security.bootstrap-admin.username", () -> ADMIN);
        registry.add("app.security.bootstrap-admin.password", () -> PASSWORD);
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    JdbcTemplate jdbc;

    private Cookie csrfCookie;

    @BeforeEach
    void cleanDatabase() throws Exception {
        jdbc.update("DELETE FROM cars");
        csrfCookie = mvc.perform(get("/api/auth/csrf")).andExpect(status().isNoContent())
                .andReturn().getResponse().getCookie("XSRF-TOKEN");
        assertThat(csrfCookie).isNotNull();
    }

    // ---------------------------------------------------------------- security

    @Test
    void adminEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/admin/cars")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("unauthorized"));
        mvc.perform(get("/api/admin/stats")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/settings")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(withCsrf(post("/api/admin/cars")).contentType(MediaType.APPLICATION_JSON).content(carJson("X", "Y", true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void stateChangingRequestsRequireCsrfToken() throws Exception {
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", ADMIN, "password", PASSWORD))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("csrf_invalid"));

        MockHttpSession session = login();
        mvc.perform(post("/api/admin/cars").session(session).contentType(MediaType.APPLICATION_JSON)
                        .content(carJson("Renault", "Clio", true)))
                .andExpect(status().isForbidden());
    }

    @Test
    void wrongPasswordIsRejectedAndRepeatedFailuresAreThrottled() throws Exception {
        String body = json.writeValueAsString(Map.of("username", "throttled-user", "password", "wrong-password"));
        for (int i = 0; i < 5; i++) {
            mvc.perform(withCsrf(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value("invalid_credentials"));
        }
        mvc.perform(withCsrf(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.code").value("too_many_attempts"));
    }

    @Test
    void loginSessionAndLogout() throws Exception {
        MockHttpSession session = login();
        mvc.perform(get("/api/auth/me").session(session)).andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(ADMIN));
        mvc.perform(withCsrf(post("/api/auth/logout")).session(session)).andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
    }

    // ---------------------------------------------------------------- vehicles

    @Test
    void fullVehicleLifecycle() throws Exception {
        MockHttpSession session = login();

        // validation
        mvc.perform(withCsrf(post("/api/admin/cars")).session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"brand\":\"\",\"model\":\"Ibiza\",\"year\":1980,\"seats\":12,\"dailyPrice\":-5,"
                                + "\"transmission\":\"MANUAL\",\"fuelType\":\"DIESEL\",\"available\":true}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("validation_failed"))
                .andExpect(jsonPath("$.fieldErrors.brand").value("required"))
                .andExpect(jsonPath("$.fieldErrors.year").value("year_range"))
                .andExpect(jsonPath("$.fieldErrors.seats").value("seats_range"))
                .andExpect(jsonPath("$.fieldErrors.dailyPrice").value("price_range"));

        // create
        JsonNode created = readJson(mvc.perform(withCsrf(post("/api/admin/cars")).session(session)
                        .contentType(MediaType.APPLICATION_JSON).content(carJson("Seat", "Ibiza", true)))
                .andExpect(status().isCreated()).andReturn());
        long id = created.get("id").asLong();
        String slug = created.get("slug").asText();
        assertThat(slug).isEqualTo("seat-ibiza-" + id);

        // public listing + details
        mvc.perform(get("/api/public/cars")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value(slug));
        mvc.perform(get("/api/public/cars").param("q", "ibiza").param("transmission", "MANUAL"))
                .andExpect(jsonPath("$.totalElements").value(1));
        mvc.perform(get("/api/public/cars").param("transmission", "AUTOMATIC"))
                .andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/public/cars/" + slug)).andExpect(status().isOk())
                .andExpect(jsonPath("$.brand").value("Seat"));
        // old/renamed slugs still resolve through the trailing id
        mvc.perform(get("/api/public/cars/old-name-" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(slug));
        mvc.perform(get("/api/public/cars/brands")).andExpect(jsonPath("$[0]").value("Seat"));

        // images: reject non-images, accept PNG, first image becomes main
        mvc.perform(withCsrf(multipart("/api/admin/cars/{id}/images", id)
                                .file(new MockMultipartFile("files", "evil.png", "image/png", "<script>".getBytes())))
                        .session(session))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("unsupported_image_type"));

        JsonNode withImages = readJson(mvc.perform(withCsrf(multipart("/api/admin/cars/{id}/images", id)
                                .file(new MockMultipartFile("files", "../../front.png", "image/png", PNG))
                                .file(new MockMultipartFile("files", "side.png", "image/png", PNG)))
                        .session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images", hasSize(2)))
                .andExpect(jsonPath("$.images[0].main").value(true))
                .andExpect(jsonPath("$.mainImage.url", startsWith("/api/public/images/")))
                .andReturn());
        long firstImage = withImages.at("/images/0/id").asLong();
        long secondImage = withImages.at("/images/1/id").asLong();
        String imageUrl = withImages.at("/images/0/url").asText();
        String storageKey = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        assertThat(storageDir.resolve(storageKey)).exists();
        assertThat(jdbc.queryForObject("SELECT original_filename FROM car_images WHERE id = ?", String.class, firstImage))
                .isEqualTo("front.png");

        mvc.perform(get(imageUrl)).andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "image/png"))
                .andExpect(header().string("Cache-Control", startsWith("max-age=")));
        mvc.perform(get("/api/public/images/..%2F..%2Fetc%2Fpasswd")).andExpect(status().is4xxClientError());

        // select main image
        mvc.perform(withCsrf(put("/api/admin/cars/{id}/images/{img}/main", id, secondImage)).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mainImage.id").value(secondImage));

        // delete the main image: the remaining one becomes main, file is removed
        mvc.perform(withCsrf(delete("/api/admin/cars/{id}/images/{img}", id, secondImage)).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.images", hasSize(1)))
                .andExpect(jsonPath("$.mainImage.id").value(firstImage));

        // availability: unavailable cars leave the public listing but keep their detail page
        mvc.perform(withCsrf(patch("/api/admin/cars/{id}/availability", id)).session(session)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"available\":false}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.available").value(false));
        mvc.perform(get("/api/public/cars")).andExpect(jsonPath("$.totalElements").value(0));
        mvc.perform(get("/api/public/cars/" + slug)).andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
        mvc.perform(get("/api/admin/cars").param("available", "false").session(session))
                .andExpect(jsonPath("$.totalElements").value(1));

        // update regenerates the slug
        mvc.perform(withCsrf(put("/api/admin/cars/{id}", id)).session(session)
                        .contentType(MediaType.APPLICATION_JSON).content(carJson("Seat", "Leon", true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("seat-leon-" + id));

        // stats
        mvc.perform(get("/api/admin/stats").session(session))
                .andExpect(jsonPath("$.totalCars").value(1))
                .andExpect(jsonPath("$.availableCars").value(1))
                .andExpect(jsonPath("$.recentCars", hasSize(1)));

        // delete car: rows and files are removed
        mvc.perform(withCsrf(delete("/api/admin/cars/{id}", id)).session(session)).andExpect(status().isNoContent());
        mvc.perform(get("/api/public/cars/" + slug)).andExpect(status().isNotFound());
        assertThat(storageDir.resolve(storageKey)).doesNotExist();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM car_images", Integer.class)).isZero();
    }

    @Test
    void priceSortingKeepsPriceOnRequestLast() throws Exception {
        MockHttpSession session = login();
        for (Object price : new Object[] {3000, null, 8000}) {
            Map<String, Object> body = new HashMap<>(json.readValue(carJson("Kia", "Picanto", true), Map.class));
            body.put("dailyPrice", price);
            mvc.perform(withCsrf(post("/api/admin/cars")).session(session).contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(body))).andExpect(status().isCreated());
        }
        mvc.perform(get("/api/public/cars").param("sort", "PRICE_ASC"))
                .andExpect(jsonPath("$.totalElements").value(3))
                .andExpect(jsonPath("$.content[0].dailyPrice").value(3000.0))
                .andExpect(jsonPath("$.content[1].dailyPrice").value(8000.0))
                .andExpect(jsonPath("$.content[2].dailyPrice").doesNotExist());
        mvc.perform(get("/api/public/cars").param("sort", "PRICE_DESC"))
                .andExpect(jsonPath("$.content[0].dailyPrice").value(8000.0))
                .andExpect(jsonPath("$.content[1].dailyPrice").value(3000.0))
                .andExpect(jsonPath("$.content[2].dailyPrice").doesNotExist());
        mvc.perform(get("/api/public/cars").param("minPrice", "5000"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    // ---------------------------------------------------------------- settings

    @Test
    void settingsAreEditableByAdminAndPublic() throws Exception {
        mvc.perform(get("/api/public/settings")).andExpect(status().isOk())
                .andExpect(jsonPath("$.locationFr").value("Oued Rhiou, Relizane, Algérie"));

        MockHttpSession session = login();
        mvc.perform(withCsrf(put("/api/admin/settings")).session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"whatsappNumber\":\"not a number\",\"mapsUrl\":\"javascript:alert(1)\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.mapsUrl").value("invalid_url"));
        mvc.perform(withCsrf(put("/api/admin/settings")).session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"whatsappNumber\":\"abc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.whatsappNumber").value("invalid_phone"));

        mvc.perform(withCsrf(put("/api/admin/settings")).session(session).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"whatsappNumber\":\"0555 00 00 00\",\"locationFr\":\"Oued Rhiou, Relizane, Algérie\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.whatsappNumber").value("213555000000"));
        mvc.perform(get("/api/public/settings")).andExpect(jsonPath("$.whatsappNumber").value("213555000000"));
    }

    // ---------------------------------------------------------------- helpers

    private MockHttpSession login() throws Exception {
        MvcResult result = mvc.perform(withCsrf(post("/api/auth/login")).contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("username", ADMIN, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(ADMIN))
                .andReturn();
        return (MockHttpSession) result.getRequest().getSession(false);
    }

    private MockHttpServletRequestBuilder withCsrf(MockHttpServletRequestBuilder builder) {
        return builder.cookie(csrfCookie).header("X-XSRF-TOKEN", csrfCookie.getValue());
    }

    private JsonNode readJson(MvcResult result) throws Exception {
        return json.readTree(result.getResponse().getContentAsString());
    }

    private String carJson(String brand, String model, boolean available) throws Exception {
        return json.writeValueAsString(Map.of("brand", brand, "model", model, "year", 2022, "dailyPrice", 4500,
                "transmission", "MANUAL", "fuelType", "DIESEL", "seats", 5, "available", available,
                "descriptionFr", "Description", "descriptionAr", "وصف"));
    }
}
