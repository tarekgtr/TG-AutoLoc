package dz.tgautoloc.car;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    Optional<CarImage> findByStorageKey(String storageKey);

    Optional<CarImage> findByIdAndCarId(Long id, Long carId);
}
