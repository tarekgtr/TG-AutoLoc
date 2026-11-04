package dz.tgautoloc.car;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.SequenceInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import dz.tgautoloc.car.dto.CarDtos.CarDetailDto;
import dz.tgautoloc.config.StorageProperties;
import dz.tgautoloc.storage.ImageType;
import dz.tgautoloc.storage.StorageService;
import dz.tgautoloc.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CarImageService {

    private static final Logger log = LoggerFactory.getLogger(CarImageService.class);
    private static final int MAX_FILENAME_LENGTH = 255;

    private final CarService carService;
    private final CarImageRepository images;
    private final StorageService storage;
    private final StorageProperties properties;

    public CarImageService(CarService carService, CarImageRepository images, StorageService storage,
                           StorageProperties properties) {
        this.carService = carService;
        this.images = images;
        this.storage = storage;
        this.properties = properties;
    }

    public record StoredImage(Resource resource, String contentType) {
    }

    @Transactional
    public CarDetailDto upload(long carId, List<MultipartFile> files) {
        Car car = carService.load(carId);
        if (files == null || files.isEmpty() || files.stream().allMatch(MultipartFile::isEmpty)) {
            throw ApiException.badRequest("no_files", "No image files were provided");
        }
        if (car.getImages().size() + files.size() > properties.maxImagesPerCar()) {
            throw ApiException.badRequest("too_many_images",
                    "A vehicle can have at most " + properties.maxImagesPerCar() + " images");
        }

        List<String> storedKeys = new ArrayList<>();
        // If anything below fails, the DB transaction rolls back; remove the files written so far.
        AfterCommit.onRollback(() -> storedKeys.forEach(storage::delete));

        int nextPosition = car.getImages().stream().mapToInt(CarImage::getPosition).max().orElse(-1) + 1;
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            if (file.getSize() > properties.maxFileSizeBytes()) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "file_too_large",
                        "Each image must be at most " + properties.maxFileSizeBytes() / (1024 * 1024) + " MB");
            }
            Stored stored = storeValidated(file, storedKeys);
            CarImage image = new CarImage(car, stored.key(), sanitizeFilename(file.getOriginalFilename()),
                    stored.type().contentType(), file.getSize(), nextPosition++);
            car.getImages().add(image);
        }
        if (car.getImages().stream().noneMatch(CarImage::isMain)) {
            car.getImages().get(0).setMain(true);
        }
        car.touch();
        images.flush();
        log.info("Uploaded {} image(s) for car {}", storedKeys.size(), carId);
        return CarMapper.toDetail(car);
    }

    @Transactional
    public CarDetailDto setMain(long carId, long imageId) {
        Car car = carService.load(carId);
        CarImage target = images.findByIdAndCarId(imageId, carId).orElseThrow(() -> ApiException.notFound("Image"));
        // Two flushes keep the "one main image per car" unique index satisfied at every step.
        car.getImages().forEach(i -> i.setMain(false));
        images.flush();
        target.setMain(true);
        car.touch();
        images.flush();
        return CarMapper.toDetail(car);
    }

    @Transactional
    public CarDetailDto delete(long carId, long imageId) {
        Car car = carService.load(carId);
        CarImage image = images.findByIdAndCarId(imageId, carId).orElseThrow(() -> ApiException.notFound("Image"));
        boolean wasMain = image.isMain();
        String key = image.getStorageKey();
        car.getImages().remove(image);
        images.flush();
        if (wasMain && !car.getImages().isEmpty()) {
            car.getImages().get(0).setMain(true);
        }
        car.touch();
        images.flush();
        AfterCommit.run(() -> storage.delete(key));
        return CarMapper.toDetail(car);
    }

    /** Only files registered in the database are served, so stray files in the volume are never exposed. */
    @Transactional(readOnly = true)
    public Optional<StoredImage> loadPublic(String key) {
        if (!StorageService.isValidKey(key)) {
            return Optional.empty();
        }
        return images.findByStorageKey(key)
                .flatMap(img -> Optional.ofNullable(storage.load(key)).map(r -> new StoredImage(r, img.getContentType())));
    }

    private record Stored(String key, ImageType type) {
    }

    private Stored storeValidated(MultipartFile file, List<String> storedKeys) {
        try (InputStream in = file.getInputStream()) {
            byte[] header = in.readNBytes(ImageType.SIGNATURE_LENGTH);
            ImageType type = ImageType.detect(header).orElseThrow(() -> new ApiException(
                    HttpStatus.UNSUPPORTED_MEDIA_TYPE, "unsupported_image_type", "Only JPEG, PNG and WebP images are allowed"));
            String key = UUID.randomUUID() + "." + type.extension();
            storage.store(key, new SequenceInputStream(new ByteArrayInputStream(header), in));
            storedKeys.add(key);
            return new Stored(key, type);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "invalid_upload", "Could not read uploaded file");
        }
    }

    /** Original filenames are metadata only (never used for storage paths); strip paths and control characters. */
    static String sanitizeFilename(String name) {
        if (name == null) {
            return null;
        }
        String base = name.replace('\\', '/');
        base = base.substring(base.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").strip();
        if (base.isEmpty()) {
            return null;
        }
        return base.length() > MAX_FILENAME_LENGTH ? base.substring(0, MAX_FILENAME_LENGTH) : base;
    }
}
