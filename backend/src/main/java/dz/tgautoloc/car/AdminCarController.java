package dz.tgautoloc.car;

import java.util.List;

import dz.tgautoloc.car.CarService.CarFilter;
import dz.tgautoloc.car.dto.CarDtos.AdminStatsDto;
import dz.tgautoloc.car.dto.CarDtos.AvailabilityRequest;
import dz.tgautoloc.car.dto.CarDtos.CarDetailDto;
import dz.tgautoloc.car.dto.CarDtos.CarRequest;
import dz.tgautoloc.car.dto.CarDtos.CarSummaryDto;
import dz.tgautoloc.web.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin - vehicles")
public class AdminCarController {

    private final CarService cars;
    private final CarImageService images;

    public AdminCarController(CarService cars, CarImageService images) {
        this.cars = cars;
        this.images = images;
    }

    @GetMapping("/stats")
    @Operation(summary = "Dashboard statistics")
    public AdminStatsDto stats() {
        return cars.stats();
    }

    @GetMapping("/cars")
    @Operation(summary = "Search all cars", description = "sort: NEWEST, OLDEST, PRICE_ASC, PRICE_DESC, YEAR_DESC, BRAND_ASC, UPDATED")
    public PageResponse<CarSummaryDto> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return cars.search(new CarFilter(q, null, null, null, null, null, available), CarSort.parse(sort), page, size);
    }

    @GetMapping("/cars/{id}")
    public CarDetailDto get(@PathVariable long id) {
        return cars.get(id);
    }

    @PostMapping("/cars")
    @ResponseStatus(HttpStatus.CREATED)
    public CarDetailDto create(@Valid @RequestBody CarRequest request) {
        return cars.create(request);
    }

    @PutMapping("/cars/{id}")
    public CarDetailDto update(@PathVariable long id, @Valid @RequestBody CarRequest request) {
        return cars.update(id, request);
    }

    @PatchMapping("/cars/{id}/availability")
    public CarDetailDto setAvailability(@PathVariable long id, @Valid @RequestBody AvailabilityRequest request) {
        return cars.setAvailability(id, request.available());
    }

    @DeleteMapping("/cars/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long id) {
        cars.delete(id);
    }

    @PostMapping(path = "/cars/{id}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload one or more images (JPEG, PNG, WebP)")
    public CarDetailDto uploadImages(@PathVariable long id, @RequestPart("files") List<MultipartFile> files) {
        return images.upload(id, files);
    }

    @PutMapping("/cars/{id}/images/{imageId}/main")
    @Operation(summary = "Select the main image")
    public CarDetailDto setMainImage(@PathVariable long id, @PathVariable long imageId) {
        return images.setMain(id, imageId);
    }

    @DeleteMapping("/cars/{id}/images/{imageId}")
    public CarDetailDto deleteImage(@PathVariable long id, @PathVariable long imageId) {
        return images.delete(id, imageId);
    }
}
