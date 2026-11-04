package dz.tgautoloc.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Image storage settings. {@code type} selects the strategy: {@code local} (a directory, e.g. a Docker volume)
 * or {@code s3} (any S3-compatible object storage such as Cloudflare R2, AWS S3 or MinIO).
 */
@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(String type, String localPath, long maxFileSizeBytes, int maxImagesPerCar, S3 s3) {

    public record S3(String endpoint, String region, String bucket, String accessKey, String secretKey) {
    }
}
