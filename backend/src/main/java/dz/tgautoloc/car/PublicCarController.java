package dz.tgautoloc.car;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

import dz.tgautoloc.car.CarService.CarFilter;
import dz.tgautoloc.car.dto.CarDtos.CarDetailDto;
import dz.tgautoloc.car.dto.CarDtos.CarSummaryDto;
import dz.tgautoloc.car.dto.CarSitemapEntry;
import dz.tgautoloc.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public catalogue")
public class PublicCarController {

    private final CarService cars;
    private final CarImageService images;

    public PublicCarController(CarService cars, CarImageService images) {
        this.cars = cars;
        this.images = images;
    }

    @GetMapping("/cars")
    @Operation(summary = "Search available cars", description = "Only vehicles marked as available are returned. "
            + "sort: NEWEST, PRICE_ASC, PRICE_DESC, YEAR_DESC, BRAND_ASC")
    public PageResponse<CarSummaryDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Transmission transmission,
            @RequestParam(required = false) FuelType fuelType,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        CarFilter filter = new CarFilter(q, brand, transmission, fuelType, minPrice, maxPrice, true);
        return cars.search(filter, CarSort.parse(sort), page, size);
    }

    @GetMapping("/cars/featured")
    @Operation(summary = "Featured available cars for the homepage")
    public List<CarSummaryDto> featured(@RequestParam(defaultValue = "6") int limit) {
        return cars.featured(limit);
    }

    @GetMapping("/cars/brands")
    @Operation(summary = "Distinct brands of available cars (filter options)")
    public List<String> brands() {
        return cars.availableBrands();
    }

    @GetMapping("/cars/sitemap")
    @Operation(summary = "Slugs and modification dates of all cars, for the sitemap")
    public List<CarSitemapEntry> sitemap() {
        return cars.sitemapEntries();
    }

    @GetMapping("/cars/{slug}")
    @Operation(summary = "Car details by slug", description = "Unavailable cars are returned too, flagged as available=false. "
            + "The trailing number of the slug is the car id; the response contains the canonical slug.")
    public CarDetailDto get(@PathVariable String slug) {
        return cars.getBySlug(slug);
    }

    @GetMapping("/images/{key}")
    @Operation(summary = "Serve an uploaded vehicle image")
    public ResponseEntity<?> image(@PathVariable String key) {
        return images.loadPublic(key)
                .<ResponseEntity<?>>map(img -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(img.contentType()))
                        // Keys are immutable (a new upload gets a new key), so images can be cached forever.
                        .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                        .body(img.resource()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
