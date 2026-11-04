package dz.tgautoloc.web;

import java.time.Instant;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Uniform error body. {@code code} is a stable machine-readable identifier that the frontend translates;
 * {@code message} is an English diagnostic for logs and API consumers.
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiError(Instant timestamp, int status, String code, String message, Map<String, String> fieldErrors) {

    public static ApiError of(int status, String code, String message) {
        return new ApiError(Instant.now(), status, code, message, Map.of());
    }
}
