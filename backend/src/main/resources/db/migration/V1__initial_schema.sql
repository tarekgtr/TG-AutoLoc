-- TG AutoLoc initial schema

CREATE TABLE admin_users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_admin_users_username UNIQUE (username),
    CONSTRAINT ck_admin_users_username_not_blank CHECK (length(trim(username)) > 0)
);

CREATE TABLE cars (
    id              BIGSERIAL PRIMARY KEY,
    slug            VARCHAR(160) NOT NULL,
    brand           VARCHAR(60)  NOT NULL,
    model           VARCHAR(80)  NOT NULL,
    year            SMALLINT     NOT NULL,
    description_fr  TEXT,
    description_ar  TEXT,
    daily_price     NUMERIC(10, 2),
    transmission    VARCHAR(20)  NOT NULL,
    fuel_type       VARCHAR(20)  NOT NULL,
    seats           SMALLINT     NOT NULL DEFAULT 5,
    available       BOOLEAN      NOT NULL DEFAULT TRUE,
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_cars_slug UNIQUE (slug),
    CONSTRAINT ck_cars_year CHECK (year BETWEEN 1990 AND 2100),
    CONSTRAINT ck_cars_price CHECK (daily_price IS NULL OR daily_price >= 0),
    CONSTRAINT ck_cars_seats CHECK (seats BETWEEN 1 AND 9),
    CONSTRAINT ck_cars_transmission CHECK (transmission IN ('MANUAL', 'AUTOMATIC')),
    CONSTRAINT ck_cars_fuel CHECK (fuel_type IN ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG'))
);

CREATE INDEX ix_cars_available_created ON cars (available, created_at DESC);
CREATE INDEX ix_cars_brand_lower ON cars (lower(brand));
CREATE INDEX ix_cars_model_lower ON cars (lower(model));
CREATE INDEX ix_cars_daily_price ON cars (daily_price);

CREATE TABLE car_images (
    id                  BIGSERIAL PRIMARY KEY,
    car_id              BIGINT       NOT NULL REFERENCES cars (id) ON DELETE CASCADE,
    storage_key         VARCHAR(100) NOT NULL,
    original_filename   VARCHAR(255),
    content_type        VARCHAR(50)  NOT NULL,
    size_bytes          BIGINT       NOT NULL,
    position            INTEGER      NOT NULL DEFAULT 0,
    is_main             BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT uk_car_images_storage_key UNIQUE (storage_key),
    CONSTRAINT ck_car_images_size CHECK (size_bytes > 0),
    CONSTRAINT ck_car_images_content_type CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

CREATE INDEX ix_car_images_car ON car_images (car_id, position);
-- At most one main image per car
CREATE UNIQUE INDEX ux_car_images_one_main ON car_images (car_id) WHERE is_main;

-- Single-row table holding public business contact settings
CREATE TABLE business_settings (
    id                  SMALLINT PRIMARY KEY DEFAULT 1,
    whatsapp_number     VARCHAR(20),
    phone_number        VARCHAR(20),
    secondary_phone     VARCHAR(20),
    email               VARCHAR(120),
    location_fr         VARCHAR(255),
    location_ar         VARCHAR(255),
    opening_hours_fr    VARCHAR(255),
    opening_hours_ar    VARCHAR(255),
    maps_url            VARCHAR(500),
    facebook_url        VARCHAR(500),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_business_settings_singleton CHECK (id = 1)
);

-- Only the facts supplied by the owner: location (city level) and the official Facebook page.
-- Phone, WhatsApp and opening hours stay empty until an administrator sets them.
INSERT INTO business_settings (id, location_fr, location_ar, facebook_url)
VALUES (1, 'Oued Rhiou, Relizane, Algérie', 'وادي رهيو، غليزان، الجزائر',
        'https://www.facebook.com/profile.php?id=61595717682597');
