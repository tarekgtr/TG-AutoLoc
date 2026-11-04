package dz.tgautoloc.car;

import java.util.List;

import dz.tgautoloc.car.dto.CarDtos.CarDetailDto;
import dz.tgautoloc.car.dto.CarDtos.CarSummaryDto;
import dz.tgautoloc.car.dto.CarDtos.ImageDto;

final class CarMapper {

    /** Public path of an image; the frontend proxies /api to the backend. */
    static final String IMAGE_URL_PREFIX = "/api/public/images/";

    private CarMapper() {
    }

    static ImageDto toImage(CarImage image) {
        return new ImageDto(image.getId(), IMAGE_URL_PREFIX + image.getStorageKey(), image.isMain(), image.getPosition());
    }

    static CarSummaryDto toSummary(Car car) {
        return new CarSummaryDto(car.getId(), car.getSlug(), car.getBrand(), car.getModel(), car.getYear(),
                car.getDailyPrice(), car.getTransmission(), car.getFuelType(), car.getSeats(), car.isAvailable(),
                car.isFeatured(), car.mainImage().map(CarMapper::toImage).orElse(null), car.getImages().size(),
                car.getCreatedAt(), car.getUpdatedAt());
    }

    static CarDetailDto toDetail(Car car) {
        List<ImageDto> images = car.getImages().stream().map(CarMapper::toImage).toList();
        return new CarDetailDto(car.getId(), car.getSlug(), car.getBrand(), car.getModel(), car.getYear(),
                car.getDescriptionFr(), car.getDescriptionAr(), car.getDailyPrice(), car.getTransmission(),
                car.getFuelType(), car.getSeats(), car.isAvailable(), car.isFeatured(),
                car.mainImage().map(CarMapper::toImage).orElse(null), images, car.getCreatedAt(), car.getUpdatedAt());
    }
}
