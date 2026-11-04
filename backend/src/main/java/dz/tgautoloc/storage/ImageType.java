package dz.tgautoloc.storage;

import java.util.Arrays;
import java.util.Optional;

/**
 * Allowed image formats, detected from file content (magic bytes) rather than the
 * client-supplied filename or Content-Type, which are both untrusted.
 */
public enum ImageType {
    JPEG("image/jpeg", "jpg"),
    PNG("image/png", "png"),
    WEBP("image/webp", "webp");

    /** Number of leading bytes needed to recognise every supported format. */
    public static final int SIGNATURE_LENGTH = 12;

    private final String contentType;
    private final String extension;

    ImageType(String contentType, String extension) {
        this.contentType = contentType;
        this.extension = extension;
    }

    public String contentType() {
        return contentType;
    }

    public String extension() {
        return extension;
    }

    public static Optional<ImageType> detect(byte[] h) {
        if (h == null) {
            return Optional.empty();
        }
        if (h.length >= 3 && (h[0] & 0xFF) == 0xFF && (h[1] & 0xFF) == 0xD8 && (h[2] & 0xFF) == 0xFF) {
            return Optional.of(JPEG);
        }
        if (h.length >= 8 && startsWith(h, 0, new int[] {0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A})) {
            return Optional.of(PNG);
        }
        if (h.length >= 12 && startsWith(h, 0, new int[] {'R', 'I', 'F', 'F'}) && startsWith(h, 8, new int[] {'W', 'E', 'B', 'P'})) {
            return Optional.of(WEBP);
        }
        return Optional.empty();
    }

    public static Optional<ImageType> fromContentType(String contentType) {
        return Arrays.stream(values()).filter(t -> t.contentType.equals(contentType)).findFirst();
    }

    private static boolean startsWith(byte[] data, int offset, int[] signature) {
        for (int i = 0; i < signature.length; i++) {
            if ((data[offset + i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }
}
