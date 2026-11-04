package dz.tgautoloc.car;

import java.time.Instant;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {

    long countByAvailable(boolean available);

    long countByCreatedAtAfter(Instant since);

    List<Car> findByAvailableTrueAndFeaturedTrueOrderByUpdatedAtDesc(Pageable pageable);

    List<Car> findByAvailableTrueOrderByCreatedAtDesc(Pageable pageable);

    List<Car> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("select distinct c.brand from Car c where c.available = true order by c.brand")
    List<String> findAvailableBrands();

    @Query("select new dz.tgautoloc.car.dto.CarSitemapEntry(c.slug, c.updatedAt) from Car c order by c.id")
    List<dz.tgautoloc.car.dto.CarSitemapEntry> findSitemapEntries();
}
