package dz.tgautoloc.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

class ImageTypeTest {

    @Test
    void detectsSupportedFormatsFromMagicBytes() {
        assertThat(ImageType.detect(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x00})).contains(ImageType.JPEG);
        assertThat(ImageType.detect(new byte[] {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A})).contains(ImageType.PNG);
        assertThat(ImageType.detect("RIFF\0\0\0\0WEBP".getBytes(StandardCharsets.ISO_8859_1))).contains(ImageType.WEBP);
    }

    @Test
    void rejectsOtherContent() {
        assertThat(ImageType.detect("<svg xmlns=".getBytes(StandardCharsets.UTF_8))).isEmpty();
        assertThat(ImageType.detect("GIF89a".getBytes(StandardCharsets.UTF_8))).isEmpty();
        assertThat(ImageType.detect("RIFF\0\0\0\0WAVE".getBytes(StandardCharsets.ISO_8859_1))).isEmpty();
        assertThat(ImageType.detect(new byte[0])).isEmpty();
        assertThat(ImageType.detect(null)).isEmpty();
    }

    @Test
    void storageKeysMustBeServerGenerated() {
        assertThat(StorageService.isValidKey("3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f.jpg")).isTrue();
        assertThat(StorageService.isValidKey("../../etc/passwd")).isFalse();
        assertThat(StorageService.isValidKey("3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f.jsp")).isFalse();
        assertThat(StorageService.isValidKey("..%2F3f2b8c1e-1a2b-4c3d-8e9f-0a1b2c3d4e5f.jpg")).isFalse();
    }
}
