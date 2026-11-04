# TG AutoLoc — Car rental website

Bilingual (French / Arabic) car rental website for **TG AutoLoc**, Oued Rhiou (Relizane, Algeria).
Visitors browse the available vehicles and contact the agency on WhatsApp with a prefilled message;
the administrator manages vehicles, photos and contact details from a secure dashboard.

| Part      | Stack |
|-----------|-------|
| Frontend  | Next.js 15 (App Router), TypeScript, Tailwind CSS, next-intl (FR LTR / AR RTL), lucide-react, next/image |
| Backend   | Java 21, Spring Boot 3.4 (Web, Data JPA, Security, Validation), Flyway, springdoc OpenAPI |
| Database  | PostgreSQL 16 |
| Ops       | Docker Compose with persistent volumes for the database and uploaded images |

```
backend/    Spring Boot API (src/main/java/dz/tgautoloc/…, Flyway migrations in src/main/resources/db)
frontend/   Next.js website + admin dashboard (src/app/[locale]/…, translations in messages/fr.json & ar.json)
docker-compose.yml, .env.example
```

## How it fits together

```
Browser ──► Next.js (:3000) ──/api/* proxy──► Spring Boot (:8080) ──► PostgreSQL
                 │ server-side rendering fetches            │
                 └──────────────────────────────────────────┘     uploads volume (/data/uploads)
```

- The browser only talks to the Next.js origin. `/api/*` is proxied to Spring Boot, so the session cookie
  (`TGSESSION`, HttpOnly, SameSite=Strict) and the CSRF cookie are first-party and no CORS is needed.
- Public pages are server-rendered on every request from live backend data (no stale inventory).
- URLs: French is the default (`/cars/seat-ibiza-12`), Arabic is prefixed (`/ar/cars/seat-ibiza-12`).
  The language choice is remembered in a cookie for one year.
- Vehicle URLs end with the vehicle id; renamed vehicles permanently redirect to their new canonical URL.

## Quick start (Docker, full stack)

Prerequisite: Docker Desktop.

```bash
cp .env.example .env
# edit .env: set DB_PASSWORD, and ADMIN_BOOTSTRAP_USERNAME / ADMIN_BOOTSTRAP_PASSWORD (12+ characters)
docker compose up -d --build
```

- Website: <http://localhost:3000> — Admin: <http://localhost:3000/admin>
- API docs (dev profile): <http://localhost:8080/api/docs/ui>

The `dev` profile (default in `.env.example`) loads **five fictitious sample vehicles** (marked `[Exemple]`,
no photos) so the site is not empty. See [Sample data](#sample-data).

If ports 5432/8080/3000 are already used on your machine, change `DB_PORT`, `BACKEND_PORT`, `FRONTEND_PORT` in `.env`.

## Local development (without containerising the apps)

Prerequisites: Java 21, Maven 3.9+, Node.js 20+, Docker (for PostgreSQL).

```bash
# 1. Database
docker compose up -d db

# 2. Backend (http://localhost:8080) — reads DB_PASSWORD etc. from the environment
cd backend
export DB_PASSWORD=...            # same value as in .env
export DB_URL=jdbc:postgresql://localhost:5432/tgautoloc   # adjust the port to DB_PORT
export ADMIN_BOOTSTRAP_USERNAME=admin ADMIN_BOOTSTRAP_PASSWORD='a-long-password'
mvn spring-boot:run

# 3. Frontend (http://localhost:3000)
cd frontend
cp .env.example .env.local        # BACKEND_INTERNAL_URL=http://localhost:8080
npm install
npm run dev
```

> `backend/.mvn/settings.xml` makes this project resolve dependencies from Maven Central,
> overriding any global mirror in `~/.m2/settings.xml`. Delete `backend/.mvn/maven.config` to use your own settings.

## Configuration

### Root `.env` (Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_NAME`, `DB_USERNAME` | `tgautoloc` | Database name and user |
| `DB_PASSWORD` | — (required) | Database password |
| `DB_PORT`, `BACKEND_PORT`, `FRONTEND_PORT` | 5432, 8080, 3000 | Host ports |
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` = sample data + Swagger; `prod` = no sample data, Swagger off, Secure cookies |
| `COOKIE_SECURE` | `false` | Must be `true` when served over HTTPS (production) |
| `API_DOCS_ENABLED` | `true` | Swagger UI / OpenAPI JSON |
| `ADMIN_BOOTSTRAP_USERNAME`, `ADMIN_BOOTSTRAP_PASSWORD` | empty | Initial administrator (see below) |
| `SITE_URL` | `http://localhost:3000` | Public URL (canonical links, Open Graph, sitemap) — baked into the frontend image |

### Backend environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/tgautoloc` | JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `tgautoloc` / — | Credentials |
| `PORT` | `8080` | HTTP port |
| `STORAGE_TYPE` | `local` | `local` (directory below) or `s3` (S3-compatible bucket: Cloudflare R2, AWS S3, Backblaze B2…) |
| `STORAGE_LOCAL_PATH` | `./data/uploads` (`/data/uploads` in Docker) | Directory for uploaded images — must be persistent |
| `STORAGE_S3_ENDPOINT` | — | S3 endpoint, e.g. `https://<account-id>.r2.cloudflarestorage.com`; empty for AWS S3 |
| `STORAGE_S3_REGION` / `STORAGE_S3_BUCKET` | `auto` / — | Region (`auto` for R2) and private bucket name |
| `STORAGE_S3_ACCESS_KEY` / `STORAGE_S3_SECRET_KEY` | — | API token with read/write access to that bucket only |
| `STORAGE_MAX_FILE_SIZE_BYTES` | `8388608` (8 MB) | Max size per image |
| `STORAGE_MAX_IMAGES_PER_CAR` | `20` | Max images per vehicle |
| `SESSION_TIMEOUT` | `2h` | Admin session inactivity timeout |
| `COOKIE_SECURE` | `false` (`true` in prod) | Secure flag on session/CSRF cookies |
| `LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCK_DURATION` | `5` / `15m` | Login throttling per username (IP limit is 4×) |
| `FORWARD_HEADERS_STRATEGY` | `none` (`native` in prod/compose) | Trust `X-Forwarded-*` from private-network proxies (client IP for throttling) |
| `API_DOCS_ENABLED` | `true` (`false` in prod) | Swagger UI at `/api/docs/ui` |

### Frontend environment variables

| Variable | Description |
|----------|-------------|
| `BACKEND_INTERNAL_URL` | URL the Next.js server uses to reach Spring Boot. Used at **build time** for the `/api` proxy and at runtime for server rendering. |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (build time). |

## Initial administrator

There is no public sign-up. On startup, **if no administrator exists**, the backend creates one from
`ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD` (≥ 12 characters, stored as a BCrypt hash).
Once the account exists, remove both variables from the environment; they are ignored afterwards.

To reset a forgotten password, generate a BCrypt hash and update the row:

```bash
docker compose exec db psql -U tgautoloc -d tgautoloc \
  -c "UPDATE admin_users SET password_hash = '<bcrypt hash>' WHERE username = 'admin';"
```

(or delete the row, set the bootstrap variables again and restart the backend).

## Contact details and WhatsApp number

No phone number is hardcoded. In **Admin → Paramètres** set:

- **WhatsApp number** — national (`05XX XX XX XX`) or international (`+213 …`) format; it is stored as
  international digits (`213XXXXXXXXX`), which is what `https://wa.me/<number>?text=…` requires.
  While it is empty, WhatsApp buttons are shown disabled with an explanation, and the floating button is hidden.
- Phone numbers, e-mail, address (FR/AR), opening hours (FR/AR), Google Maps link, Facebook page.

The database is seeded only with facts supplied by the owner: city-level location and the Facebook page.
Your banner image shows two phone numbers; enter them here if they are the official contacts.

WhatsApp messages are generated in the visitor's language and name the selected vehicle, e.g.
*« Bonjour TG AutoLoc, je souhaite louer cette voiture : Seat Ibiza (2020). … »* /
*« السلام عليكم TG AutoLoc، أريد كراء هذه السيارة: Seat Ibiza (2020). … »*.
For unavailable vehicles the button asks about the next availability instead.

## Managing vehicles

Admin → **Véhicules**:

1. **Ajouter un véhicule** — brand, model, year, daily price in DA (leave empty for "Prix sur demande"),
   transmission, fuel, seats, descriptions in French and Arabic, availability, "à la une" (homepage).
2. After creation you land on the edit page: drag-and-drop or browse to **upload photos** (JPEG/PNG/WebP, 8 MB max).
   The first photo becomes the main photo; use ★ to choose another, 🗑 to remove one.
3. In the list: search, filter by availability, sort, toggle availability, preview the public page, delete (with confirmation).

Only **available** vehicles appear in the public catalogue; unavailable vehicles keep their detail page,
clearly marked, without a rental button.

## Image storage

- Files are validated by content (magic bytes), never by the client's filename or Content-Type.
- Stored under server-generated names (`<uuid>.<ext>`); the original filename is kept only as metadata.
- Served only if registered in the `car_images` table; keys are validated (no path traversal).
- Docker stores them in the named volume `uploads` (mounted at `/data/uploads`), so they survive container
  restarts and redeployments. Back up this volume together with the database.
- Two strategies behind the `StorageService` interface (`backend/src/main/java/dz/tgautoloc/storage`),
  selected with `STORAGE_TYPE`: `local` (`LocalStorageService`, a persistent directory/volume) and `s3`
  (`S3StorageService`, any S3-compatible bucket). Use `s3` on hosts without persistent disks (e.g. Render free).
  The bucket stays private: images are still served by the backend, only for keys registered in the database.

## Sample data

`backend/src/main/resources/db/sample/V1000__dev_sample_cars.sql` inserts five fictitious vehicles
(descriptions prefixed with `[Exemple]`). It is only on the Flyway path in the `dev` profile and is never
applied with `prod`. To remove sample vehicles from a dev database, delete them in the admin.

## Tests

```bash
cd backend && mvn test          # 29 tests: unit + API integration tests on real PostgreSQL, S3 storage on S3Mock (Testcontainers, needs Docker)
cd frontend && npm test         # 22 tests: WhatsApp links (FR/AR), formatting, form validation, pagination, components
cd frontend && npm run typecheck && npm run lint
```

The backend integration tests cover authentication, CSRF, login throttling, vehicle CRUD, image upload
validation/main image/deletion (including files on disk), availability rules, price sorting and settings.

## API

OpenAPI docs: `/api/docs/ui` (Swagger UI), `/api/docs` (JSON). Main endpoints:

| Method & path | Access |
|---------------|--------|
| `GET /api/public/cars` (`q, brand, transmission, fuelType, minPrice, maxPrice, sort, page, size`) | public, available cars only |
| `GET /api/public/cars/featured`, `/brands`, `/sitemap`, `/{slug}` | public |
| `GET /api/public/images/{key}`, `GET /api/public/settings` | public |
| `GET /api/auth/csrf`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` | auth |
| `/api/admin/**` (stats, cars CRUD, availability, images, settings) | administrator session + CSRF header |

## Production deployment

1. Serve the site over **HTTPS** behind a reverse proxy (Caddy, Nginx, Traefik…) forwarding to the frontend (port 3000).
   Do not expose the backend or the database publicly (compose binds them to `127.0.0.1`).
2. In `.env`: `SPRING_PROFILES_ACTIVE=prod`, `COOKIE_SECURE=true`, `API_DOCS_ENABLED=false`,
   a strong `DB_PASSWORD`, and `SITE_URL=https://your-domain`. Then `docker compose up -d --build`.
3. Create the administrator with the bootstrap variables, then remove them.
4. Fill in the contact settings and add the vehicles and photos.
5. Back up the `db-data` and `uploads` volumes regularly.

For Render (free tier: Neon PostgreSQL + Cloudflare R2 photos), use the `render.yaml` blueprint — see
`deploy/render/README.md`. For a small Azure VM with a managed Azure PostgreSQL database, use `deploy/azure/` (compose file with Caddy HTTPS,
memory limits sized for 1 GB RAM, and `.env.example`).

Notes:
- Admin sessions and login-throttling counters are kept in memory: a backend restart logs the admin out.
  For several backend instances, add a shared session store (e.g. Spring Session JDBC/Redis).
- `SITE_URL` and the backend URL are compiled into the frontend image; rebuild it after changing them.
- Fonts (Inter, Montserrat, Cairo — SIL OFL) are self-hosted in `frontend/src/fonts`; builds need no Google Fonts access.

## Branding assets

- `frontend/public/images/logo.png` — official logo, copied unmodified from *TG AutoLoc Circular Car Rental Badge.png*.
- `frontend/public/images/hero.jpg` — cropped from the owner's banner *TG AutoLoc: Your Mobility Partner* (cars and skyline
  only, without the text and phone numbers). Replace it with any photo of the same name to change the homepage visual.
- The About page and other texts live in `frontend/messages/fr.json` and `frontend/messages/ar.json`.
