package dz.tgautoloc.car.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import dz.tgautoloc.car.FuelType;
import dz.tgautoloc.car.Transmission;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * API contracts for vehicles. Validation messages are stable codes translated by the frontend.
 */
public final class CarDtos {

    private CarDtos() {
    }

    public record ImageDto(Long id, String url, boolean main, int position) {
    }

    public record CarSummaryDto(
            Long id,
            String slug,
            String brand,
            String model,
            int year,
            BigDecimal dailyPrice,
            Transmission transmission,
            FuelType fuelType,
            int seats,
            boolean available,
            boolean featured,
            ImageDto mainImage,
            int imageCount,
            Instant createdAt,
            Instant updatedAt) {
    }

    public record CarDetailDto(
            Long id,
            String slug,
            String brand,
            String model,
            int year,
            String descriptionFr,
            String descriptionAr,
            BigDecimal dailyPrice,
            Transmission transmission,
            FuelType fuelType,
            int seats,
            boolean available,
            boolean featured,
            ImageDto mainImage,
            List<ImageDto> images,
            Instant createdAt,
            Instant updatedAt) {
    }

    public record CarRequest(
            @NotBlank(message = "required") @Size(max = 60, message = "too_long") String brand,
            @NotBlank(message = "required") @Size(max = 80, message = "too_long") String model,
            @NotNull(message = "required") @Min(value = 1990, message = "year_range") @Max(value = 2100, message = "year_range") Integer year,
            @Size(max = 5000, message = "too_long") String descriptionFr,
            @Size(max = 5000, message = "too_long") String descriptionAr,
            @DecimalMin(value = "0", message = "price_range") @DecimalMax(value = "10000000", message = "price_range")
            @Digits(integer = 8, fraction = 2, message = "price_format") BigDecimal dailyPrice,
            @NotNull(message = "required") Transmission transmission,
            @NotNull(message = "required") FuelType fuelType,
            @NotNull(message = "required") @Min(value = 1, message = "seats_range") @Max(value = 9, message = "seats_range") Integer seats,
            @NotNull(message = "required") Boolean available,
            Boolean featured) {
    }

    public record AvailabilityRequest(@NotNull(message = "required") Boolean available) {
    }

    public record AdminStatsDto(long totalCars, long availableCars, long unavailableCars, long addedLast30Days,
                                List<CarSummaryDto> recentCars) {
    }
}
