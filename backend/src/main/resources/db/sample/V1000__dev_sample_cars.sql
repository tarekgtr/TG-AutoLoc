-- ============================================================================
-- DEVELOPMENT SAMPLE DATA ONLY
-- This migration lives in classpath:db/sample, which is ONLY added to the
-- Flyway locations by the "dev" profile (see application-dev.yml).
-- It is never applied in production. These vehicles are fictitious examples
-- with no images and no real prices; delete this file to stop seeding them.
-- ============================================================================

INSERT INTO cars (slug, brand, model, year, description_fr, description_ar, daily_price, transmission, fuel_type, seats, available, featured)
VALUES
    ('sample-1', 'Renault', 'Clio 5', 2023,
     '[Exemple] Citadine confortable et économique, idéale pour la ville comme pour la route.',
     '[مثال] سيارة مدينة مريحة واقتصادية، مثالية للمدينة والطريق.',
     5000, 'MANUAL', 'PETROL', 5, TRUE, TRUE),
    ('sample-2', 'Peugeot', '208', 2022,
     '[Exemple] Compacte moderne avec une conduite agréable.',
     '[مثال] سيارة مدمجة حديثة وقيادة مريحة.',
     5500, 'MANUAL', 'DIESEL', 5, TRUE, TRUE),
    ('sample-3', 'Geely', 'Coolray', 2024,
     '[Exemple] SUV compact bien équipé avec boîte automatique.',
     '[مثال] سيارة SUV مدمجة مجهزة جيدًا بعلبة سرعات أوتوماتيكية.',
     9000, 'AUTOMATIC', 'PETROL', 5, TRUE, TRUE),
    ('sample-4', 'Citroën', 'C3', 2021,
     '[Exemple] Citadine pratique et spacieuse.',
     '[مثال] سيارة مدينة عملية وواسعة.',
     NULL, 'MANUAL', 'PETROL', 5, TRUE, FALSE),
    ('sample-5', 'Seat', 'Ibiza', 2020,
     '[Exemple] Véhicule actuellement indisponible.',
     '[مثال] سيارة غير متوفرة حاليًا.',
     4800, 'MANUAL', 'DIESEL', 5, FALSE, FALSE);

-- Canonical slugs are "<brand>-<model>-<id>"
UPDATE cars
SET slug = trim(both '-' from regexp_replace(lower(translate(brand || '-' || model, 'ëéèêàâîïôûùç', 'eeeeaaiiouuc')), '[^a-z0-9]+', '-', 'g')) || '-' || id
WHERE slug LIKE 'sample-%';
