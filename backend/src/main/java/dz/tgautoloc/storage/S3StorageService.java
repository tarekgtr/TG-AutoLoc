package dz.tgautoloc.storage;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.net.URI;

import dz.tgautoloc.config.StorageProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.checksums.RequestChecksumCalculation;
import software.amazon.awssdk.core.checksums.ResponseChecksumValidation;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

/**
 * Stores images in an S3-compatible bucket (Cloudflare R2, AWS S3, MinIO...). The bucket stays private:
 * images are still served by the backend, and only for keys registered in the database.
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "s3")
public class S3StorageService implements StorageService, AutoCloseable {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    private final S3Client client;
    private final String bucket;

    public S3StorageService(StorageProperties properties) {
        StorageProperties.S3 s3 = properties.s3();
        if (s3 == null || !StringUtils.hasText(s3.bucket()) || !StringUtils.hasText(s3.accessKey())
                || !StringUtils.hasText(s3.secretKey())) {
            throw new IllegalStateException("S3 storage requires STORAGE_S3_BUCKET, STORAGE_S3_ACCESS_KEY and STORAGE_S3_SECRET_KEY");
        }
        var builder = S3Client.builder()
                .httpClient(UrlConnectionHttpClient.create())
                .region(Region.of(StringUtils.hasText(s3.region()) ? s3.region() : "auto"))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(s3.accessKey(), s3.secretKey())))
                // Only send/verify checksums when the API requires them (needed by R2 and most S3-compatible stores).
                .requestChecksumCalculation(RequestChecksumCalculation.WHEN_REQUIRED)
                .responseChecksumValidation(ResponseChecksumValidation.WHEN_REQUIRED);
        if (StringUtils.hasText(s3.endpoint())) {
            builder.endpointOverride(URI.create(s3.endpoint())).forcePathStyle(true);
        }
        this.client = builder.build();
        this.bucket = s3.bucket();
        log.info("Image storage: S3 bucket '{}'{}", bucket, StringUtils.hasText(s3.endpoint()) ? " at " + s3.endpoint() : "");
    }

    @Override
    public void store(String key, InputStream content) {
        checkKey(key);
        try {
            // Uploads are already size-limited (app.storage.max-file-size-bytes), so buffering is bounded.
            byte[] bytes = content.readAllBytes();
            client.putObject(b -> b.bucket(bucket).key(key), RequestBody.fromBytes(bytes));
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store image " + key, e);
        }
    }

    @Override
    public Resource load(String key) {
        checkKey(key);
        try {
            return new ByteArrayResource(client.getObjectAsBytes(b -> b.bucket(bucket).key(key)).asByteArray());
        } catch (NoSuchKeyException e) {
            return null;
        }
    }

    @Override
    public void delete(String key) {
        checkKey(key);
        try {
            client.deleteObject(b -> b.bucket(bucket).key(key));
        } catch (RuntimeException e) {
            log.warn("Could not delete stored image {}: {}", key, e.getMessage());
        }
    }

    @Override
    public void close() {
        client.close();
    }

    private static void checkKey(String key) {
        if (!StorageService.isValidKey(key)) {
            throw new IllegalArgumentException("Invalid storage key");
        }
    }
}
