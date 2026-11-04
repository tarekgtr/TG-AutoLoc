# Deploying TG AutoLoc on Render (free plan)

| Part | Service | Free tier |
|------|---------|-----------|
| Website (Next.js) | Render web service `tg-autoloc` | 512 MB, sleeps after 15 min idle |
| API (Spring Boot) | Render web service `tg-autoloc-api` | 512 MB, sleeps after 15 min idle |
| Database | Neon PostgreSQL | 0.5 GB, no expiry |
| Vehicle photos | Cloudflare R2 bucket (`STORAGE_TYPE=s3`) | 10 GB |

Render free services have no persistent disk, so photos are stored in R2, not in the container.
Render's own free PostgreSQL expires after 30 days, so the database is on Neon.

## 1. Put the code on GitHub

Render deploys from a Git repository. Create a **private** repository on GitHub, then from the project folder:

```bash
git init -b main
git add .
git status            # check: no .env, no frontend/.env.local, no backend/data
git commit -m "TG AutoLoc"
git remote add origin https://github.com/<you>/tg-autoloc.git
git push -u origin main
```

## 2. Database: Neon

1. Sign up at https://neon.tech and create a project, region **AWS Europe Central (Frankfurt)**, PostgreSQL 16.
2. **Connect** → copy the connection details (host, database, user, password). Turn off connection pooling (direct connection).
3. Build the JDBC URL: `jdbc:postgresql://<host>/<database>?sslmode=require`
   (e.g. `jdbc:postgresql://ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require`).

The tables are created automatically by Flyway on the first start.

## 3. Photos: Cloudflare R2

1. Sign up at https://dash.cloudflare.com → **R2 Object Storage** → enable R2 (Cloudflare asks for a payment
   method; the first 10 GB are free).
2. **Create bucket** `tg-autoloc-photos` (location: Europe). Keep it **private** (no public access needed).
3. **Manage R2 API tokens → Create API token**: permission **Object Read & Write**, limited to that bucket.
   Copy the **Access Key ID**, **Secret Access Key** and the endpoint `https://<account-id>.r2.cloudflarestorage.com`.

Without a card: Backblaze B2 (10 GB free) also works — use its S3 endpoint (e.g. `https://s3.eu-central-003.backblazeb2.com`),
its region (e.g. `eu-central-003`, set `STORAGE_S3_REGION`) and an application key.

## 4. Render

1. Sign up at https://render.com with GitHub.
2. **New → Blueprint** → choose the repository. Render reads `render.yaml` and proposes two services.
3. Fill in the requested values:

   | Service | Variable | Value |
   |---------|----------|-------|
   | tg-autoloc-api | `DB_URL` | JDBC URL from step 2 |
   | tg-autoloc-api | `DB_USERNAME` / `DB_PASSWORD` | Neon user / password |
   | tg-autoloc-api | `STORAGE_S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
   | tg-autoloc-api | `STORAGE_S3_BUCKET` | `tg-autoloc-photos` |
   | tg-autoloc-api | `STORAGE_S3_ACCESS_KEY` / `STORAGE_S3_SECRET_KEY` | R2 token |
   | tg-autoloc | `BACKEND_INTERNAL_URL` | `https://tg-autoloc-api.onrender.com` |
   | tg-autoloc | `NEXT_PUBLIC_SITE_URL` | `https://tg-autoloc.onrender.com` |

   If a name is already taken, Render adds a suffix (e.g. `tg-autoloc-api-x1y2.onrender.com`): after creation,
   copy the real URLs from each service page into the two frontend variables and click **Manual Deploy**
   (they are compiled into the website).
4. **Apply**. The first build takes ~10 minutes. Wait until `tg-autoloc-api` shows **Live**.

## 5. First login

1. `tg-autoloc-api` → **Environment**: the generated `ADMIN_BOOTSTRAP_PASSWORD` is shown there (username `admin`).
2. Open `https://tg-autoloc.onrender.com/admin` and log in.
3. Back in **Environment**, delete `ADMIN_BOOTSTRAP_USERNAME` and `ADMIN_BOOTSTRAP_PASSWORD` and save.
4. **Admin → Paramètres**: WhatsApp number, phones, hours. Then add the vehicles and photos.

## Own domain (optional)

`tg-autoloc` → **Settings → Custom Domains** → add `www.your-domain.dz`, create the DNS record Render shows.
Then set `NEXT_PUBLIC_SITE_URL=https://www.your-domain.dz` and redeploy. HTTPS is automatic.

## Updates

Every `git push` to `main` redeploys automatically. Data (Neon) and photos (R2) are not affected.

## Limits of the free plan

- **Cold start**: after 15 minutes without visitors both services sleep; the next visitor waits about
  1–3 minutes (Spring Boot starts slowly on 0.1 CPU) and may see the "service unavailable" page once — refresh.
- **750 free instance hours per month** for the whole account: two services running all month would need ~1,460,
  so do not keep both awake with an uptime pinger. For a fast, always-on site, upgrade `tg-autoloc-api` to
  **Starter** ($7/month) — that removes most of the waiting.
- A backend restart (sleep, deploy) logs the administrator out (sessions are in memory).
- Backups: Neon keeps a short restore history on the free plan; export important data regularly
  (`pg_dump` with the Neon connection string).
