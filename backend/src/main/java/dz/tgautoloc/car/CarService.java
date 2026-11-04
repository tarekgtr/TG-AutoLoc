package dz.tgautoloc.car;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import dz.tgautoloc.car.dto.CarDtos.AdminStatsDto;
import dz.tgautoloc.car.dto.CarDtos.CarDetailDto;
import dz.tgautoloc.car.dto.CarDtos.CarRequest;
import dz.tgautoloc.car.dto.CarDtos.CarSummaryDto;
import dz.tgautoloc.car.dto.CarSitemapEntry;
import dz.tgautoloc.storage.StorageService;
import dz.tgautoloc.web.ApiException;
import dz.tgautoloc.web.PageResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarService {

    private static final Logger log = LoggerFactory.getLogger(CarService.class);
    public static final int MAX_PAGE_SIZE = 48;

    private final CarRepository cars;
    private final StorageService storage;

    public CarService(CarRepository cars, StorageService storage) {
        this.cars = cars;
        this.storage = storage;
    }

    public record CarFilter(String q, String brand, Transmission transmission, FuelType fuelType,
                            BigDecimal minPrice, BigDecimal maxPrice, Boolean available) {
    }

    @Transactional(readOnly = true)
    public PageResponse<CarSummaryDto> search(CarFilter f, CarSort sort, int page, int size) {
        Specification<Car> spec = Specification.where(CarSpecifications.available(f.available()))
                .and(CarSpecifications.search(f.q()))
                .and(CarSpecifications.brand(f.brand()))
                .and(CarSpecifications.transmission(f.transmission()))
                .and(CarSpecifications.fuelType(f.fuelType()))
                .and(CarSpecifications.minPrice(f.minPrice()))
                .and(CarSpecifications.maxPrice(f.maxPrice()))
                .and(sort.ordering());
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), sort.sort());
        return PageResponse.of(cars.findAll(spec, pageable), CarMapper::toSummary);
    }

    /** Featured available cars, topped up with the newest available ones when fewer are featured. */
    @Transactional(readOnly = true)
    public List<CarSummaryDto> featured(int limit) {
        int n = Math.clamp(limit, 1, 12);
        List<Car> result = new ArrayList<>(cars.findByAvailableTrueAndFeaturedTrueOrderByUpdatedAtDesc(PageRequest.of(0, n)));
        if (result.size() < n) {
            cars.findByAvailableTrueOrderByCreatedAtDesc(PageRequest.of(0, n * 2)).stream()
                    .filter(c -> result.stream().noneMatch(r -> r.getId().equals(c.getId())))
                    .limit(n - result.size())
                    .forEach(result::add);
        }
        return result.stream().map(CarMapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public List<String> availableBrands() {
        return cars.findAvailableBrands();
    }

    @Transactional(readOnly = true)
    public List<CarSitemapEntry> sitemapEntries() {
        return cars.findSitemapEntries();
    }

    /** Resolves a public slug via its trailing id; the returned slug is canonical. */
    @Transactional(readOnly = true)
    public CarDetailDto getBySlug(String slug) {
        Long id = Slugs.extractId(slug).orElseThrow(() -> ApiException.notFound("Car"));
        return CarMapper.toDetail(load(id));
    }

    @Transactional(readOnly = true)
    public CarDetailDto get(long id) {
        return CarMapper.toDetail(load(id));
    }

    @Transactional
    public CarDetailDto create(CarRequest request) {
        Car car = new Car();
        apply(car, request);
        car.setSlug("tmp-" + UUID.randomUUID());
        cars.saveAndFlush(car);
        car.setSlug(Slugs.forCar(car.getBrand(), car.getModel(), car.getId()));
        log.info("Created car {} ({} {})", car.getId(), car.getBrand(), car.getModel());
        return CarMapper.toDetail(car);
    }

    @Transactional
    public CarDetailDto update(long id, CarRequest request) {
        Car car = load(id);
        apply(car, request);
        car.setSlug(Slugs.forCar(car.getBrand(), car.getModel(), car.getId()));
        cars.flush();
        return CarMapper.toDetail(car);
    }

    @Transactional
    public CarDetailDto setAvailability(long id, boolean available) {
        Car car = load(id);
        car.setAvailable(available);
        cars.flush();
        return CarMapper.toDetail(car);
    }

    @Transactional
    public void delete(long id) {
        Car car = load(id);
        List<String> keys = car.getImages().stream().map(CarImage::getStorageKey).toList();
        cars.delete(car);
        cars.flush();
        AfterCommit.run(() -> keys.forEach(storage::delete));
        log.info("Deleted car {} and {} image(s)", id, keys.size());
    }

    @Transactional(readOnly = true)
    public AdminStatsDto stats() {
        long total = cars.count();
        long available = cars.countByAvailable(true);
        long recent = cars.countByCreatedAtAfter(Instant.now().minus(Duration.ofDays(30)));
        List<CarSummaryDto> latest = cars.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5)).stream()
                .map(CarMapper::toSummary).toList();
        return new AdminStatsDto(total, available, total - available, recent, latest);
    }

    Car load(long id) {
        return cars.findById(id).orElseThrow(() -> ApiException.notFound("Car"));
    }

    private static void apply(Car car, CarRequest r) {
        int maxYear = Year.now().getValue() + 1;
        if (r.year() > maxYear) {
            throw ApiException.badRequest("year_range", "Year cannot be later than " + maxYear);
        }
        car.setBrand(r.brand().trim());
        car.setModel(r.model().trim());
        car.setYear(r.year());
        car.setDescriptionFr(blankToNull(r.descriptionFr()));
        car.setDescriptionAr(blankToNull(r.descriptionAr()));
        car.setDailyPrice(r.dailyPrice());
        car.setTransmission(r.transmission());
        car.setFuelType(r.fuelType());
        car.setSeats(r.seats());
        car.setAvailable(r.available());
        car.setFeatured(Boolean.TRUE.equals(r.featured()));
    }

    private static String blankToNull(String s) {
        return s == null || s.isBlank() ? null : s.strip();
    }
}
