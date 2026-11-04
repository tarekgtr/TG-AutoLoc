package dz.tgautoloc.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import dz.tgautoloc.config.StorageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

/**
 * Stores images on a local directory. In Docker this directory is a named volume
 * so images survive container restarts and redeployments.
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path root;

    public LocalStorageService(StorageProperties properties) {
        this.root = Path.of(properties.localPath()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot create image storage directory " + root, e);
        }
        if (!Files.isWritable(root)) {
            throw new IllegalStateException("Image storage directory is not writable: " + root);
        }
        log.info("Image storage directory: {}", root);
    }

    @Override
    public void store(String key, InputStream content) {
        Path target = resolve(key);
        Path tmp = target.resolveSibling(key + ".part");
        try {
            Files.copy(content, tmp, StandardCopyOption.REPLACE_EXISTING);
            Files.move(tmp, target, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException e) {
            try {
                Files.deleteIfExists(tmp);
            } catch (IOException ignored) {
                // best effort cleanup
            }
            throw new UncheckedIOException("Failed to store image " + key, e);
        }
    }

    @Override
    public Resource load(String key) {
        Path file = resolve(key);
        return Files.isRegularFile(file) ? new FileSystemResource(file) : null;
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(resolve(key));
        } catch (IOException e) {
            log.warn("Could not delete stored image {}: {}", key, e.getMessage());
        }
    }

    private Path resolve(String key) {
        if (!StorageService.isValidKey(key)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        Path file = root.resolve(key).normalize();
        if (!file.getParent().equals(root)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
        return file;
    }
}
