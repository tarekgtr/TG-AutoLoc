package dz.tgautoloc.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.util.UUID;

import dz.tgautoloc.config.StorageProperties;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/** Runs the S3 storage against a real S3-compatible server (Adobe S3Mock). */
@Testcontainers
class S3StorageServiceTest {

    private static final String BUCKET = "tgautoloc-test";

    private static final String ACCESS_KEY = "test-access-key";
    private static final String SECRET_KEY = "test-secret-key";

    @Container
    static final GenericContainer<?> s3mock = new GenericContainer<>("adobe/s3mock:4.7.0")
            .withExposedPorts(9090)
            .waitingFor(Wait.forHttp("/").forPort(9090).forStatusCodeMatching(code -> code < 500));

    static S3StorageService storage;

    @BeforeAll
    static void setUp() {
        String endpoint = "http://" + s3mock.getHost() + ":" + s3mock.getMappedPort(9090);
        try (S3Client admin = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.US_EAST_1)
                .forcePathStyle(true)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(ACCESS_KEY, SECRET_KEY)))
                .build()) {
            admin.createBucket(b -> b.bucket(BUCKET));
        }
        var s3 = new StorageProperties.S3(endpoint, "us-east-1", BUCKET, ACCESS_KEY, SECRET_KEY);
        storage = new S3StorageService(new StorageProperties("s3", null, 8_388_608, 20, s3));
    }

    @AfterAll
    static void tearDown() {
        storage.close();
    }

    @Test
    void storesLoadsAndDeletesImages() throws Exception {
        String key = UUID.randomUUID() + ".png";
        byte[] content = {(byte) 0x89, 'P', 'N', 'G', 1, 2, 3};

        storage.store(key, new ByteArrayInputStream(content));
        assertThat(storage.load(key).getContentAsByteArray()).isEqualTo(content);

        storage.delete(key);
        assertThat(storage.load(key)).isNull();
    }

    @Test
    void missingImageIsNull() {
        assertThat(storage.load(UUID.randomUUID() + ".jpg")).isNull();
    }

    @Test
    void rejectsKeysThatAreNotServerGenerated() {
        assertThatThrownBy(() -> storage.store("../secret.png", new ByteArrayInputStream(new byte[1])))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> storage.load("other/key.jpg")).isInstanceOf(IllegalArgumentException.class);
    }
}
