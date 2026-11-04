package dz.tgautoloc.storage;

import java.io.InputStream;
import java.util.regex.Pattern;

import org.springframework.core.io.Resource;

/**
 * Persistent binary storage for uploaded images. Keys are always server-generated
 * ({@code <uuid>.<ext>}); implementations must reject any other key shape.
 */
public interface StorageService {

    Pattern KEY_PATTERN = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.(jpg|png|webp)$");

    void store(String key, InputStream content);

    /** @return the stored resource, or {@code null} if it does not exist. */
    Resource load(String key);

    void delete(String key);

    static boolean isValidKey(String key) {
        return key != null && KEY_PATTERN.matcher(key).matches();
    }
}
