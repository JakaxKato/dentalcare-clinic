# Smile Dental — Clinic Management System

Sistem manajemen klinik gigi full-stack untuk website publik, booking pasien, dashboard dokter, dan operasional admin klinik.

> **Status dokumentasi:** diperbarui berdasarkan branch `setup-main` dan commit terbaru yang dianalisis. Arsitektur production utama yang menjadi acuan adalah Tencent Cloud VPS + Nginx + PM2 + MongoDB Atlas. Ketersediaan runtime production tetap harus diverifikasi dari server dan DNS.

- **Repository:** [github.com/JakaxKato/dentalcare-clinic](https://github.com/JakaxKato/dentalcare-clinic)
- **Production domain:** [https://smiledental.my.id](https://smiledental.my.id)
- **Domain/DNS provider:** Sumopod, berdasarkan informasi project; record DNS aktual tidak diverifikasi dari repository
- **Branch kerja terbaru:** `setup-main`
- **License:** [Commercial Single-Clinic License](LICENSE)

## Arsitektur Production

```text
Pengunjung / staff
        │
        ▼
smiledental.my.id
        │ DNS → Elastic IP Tencent Cloud VPS
        ▼
┌──────────────────────────────┐
│ Nginx :80/:443               │
│ - serve client/dist          │
│ - proxy /api dan /uploads    │
└──────────────┬───────────────┘
               ▼
┌──────────────────────────────┐
│ Express API + PM2 cluster    │
│ 2 instance, localhost:5000   │
└──────────────┬───────────────┘
               ▼
       MongoDB Atlas
```

- Frontend production disajikan oleh Nginx dari `client/dist` di VPS.
- Backend berjalan di Tencent Cloud VPS menggunakan Node.js, Express, dan PM2.
- Nginx meneruskan `/api/` dan `/uploads/` ke `127.0.0.1:5000`.
- MongoDB production menggunakan MongoDB Atlas; port MongoDB tidak dibuka ke publik.
- HTTPS menggunakan Let's Encrypt/Certbot sesuai panduan VPS.
- `client/vercel.json` tetap tersedia sebagai opsi deployment frontend terpisah, tetapi Vercel bukan target production utama yang didokumentasikan di sini.

## Fitur Utama

- **Public website:** landing page, layanan, dokter, artikel, testimoni, kontak, FAQ, dan booking.
- **Pasien:** registrasi/login, appointment, riwayat perawatan, profil, rekam medis, odontogram read-only, resep, invoice, dan pembayaran DP.
- **Dokter gigi:** dashboard appointment, diagnosis, treatment notes, odontogram, resep, invoice, jadwal, dan cuti.
- **Admin klinik:** statistik, kelola pasien/dokter/layanan/appointment/artikel/testimoni, clinic settings, dan laporan CSV.
- **Clinical workflow:** validasi status appointment, pengecekan bentrok jadwal, rekam medis, odontogram FDI 32 gigi, resep multi-item, dan PDF invoice.
- **Integrasi:** MongoDB Atlas, Cloudinary, SMTP, Midtrans, dan pengingat WhatsApp melalui Fonnte.
- **Frontend:** responsive UI, dark mode, form validation, loading state, dan dukungan PWA/service worker.
- **Security controls:** JWT authentication, role-based authorization, Helmet, CORS allowlist, rate limiting, NoSQL sanitization, validasi environment, dan graceful shutdown.

Kontrol keamanan tersebut bukan pengganti security/privacy review sebelum aplikasi dipakai untuk data medis production.

## Tech Stack

| Area | Teknologi |
|---|---|
| Frontend | React 18, Vite 8, React Router, Tailwind CSS |
| Form/UI | React Hook Form, Zod, Lucide React, Swiper, FullCalendar |
| Backend | Node.js 20, Express 4, CommonJS |
| Database | MongoDB melalui Mongoose 8; production diarahkan ke MongoDB Atlas |
| Authentication | JWT, bcryptjs, cookie parser |
| Storage | Multer; Cloudinary untuk production |
| Email | Nodemailer/SMTP |
| Payment | Midtrans |
| PDF | PDFKit |
| Testing | Node.js built-in test runner (`node:test`) |
| Operations | Nginx, PM2, Docker Compose, GitHub Actions |

## Struktur Repository

```text
.
├── client/                 # React/Vite SPA
│   ├── public/
│   └── src/
├── server/                 # Express REST API dan Mongoose models
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── test/
│   └── server.js
├── deploy/                 # PM2, Nginx, dan deployment script
├── docs/                   # Panduan VPS, CI/CD, dan serah terima
├── scripts/                # Backup dan restore MongoDB
├── marketing/              # Materi sales dan landing page produk
├── docker-compose.yml
├── package.json
└── README.md
```

Entry point penting:

- Frontend: `client/src/main.jsx` dan `client/src/App.jsx`
- API: `server/server.js`
- Database: `server/config/db.js`
- Auth: `server/middleware/auth.js`
- PM2: `deploy/ecosystem.config.js`
- Nginx: `deploy/nginx-dentalcare.conf`
- Deployment: `deploy/deploy.sh`

## Prasyarat

- Node.js **20 LTS** atau kompatibel dengan versi yang dipakai CI/Docker.
- npm.
- MongoDB lokal atau MongoDB Atlas untuk development.
- Docker dan Docker Compose hanya jika memakai jalur Docker.
- Untuk production: domain, Tencent Cloud VPS/CVM, Elastic IP, Nginx, PM2, HTTPS, MongoDB Atlas, Cloudinary, dan SMTP.

## Quickstart Lokal

### 1. Clone dan install dependency

```bash
git clone https://github.com/JakaxKato/dentalcare-clinic.git
cd dentalcare-clinic
npm ci
npm ci --prefix server
npm ci --prefix client
```

`npm ci` pada root wajib dijalankan karena dependency `concurrently` berada di root. Jangan hanya menjalankan instalasi di `server` dan `client` jika ingin memakai `npm run dev`.

### 2. Buat file environment

PowerShell Windows:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

Linux/macOS:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Minimal nilai development pada `server/.env`:

```env
PORT=5000
NODE_ENV=development
APP_ENV=demo
ALLOW_DEMO_ACCOUNTS=true
SEED_MODE=demo
MONGO_URI=mongodb://127.0.0.1:27017/dentalcare_demo
JWT_SECRET=ganti_dengan_random_string_minimal_32_karakter
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Minimal nilai development pada `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_CLINIC_NAME=Smile Dental Studio
```

Jangan commit file `.env`. Gunakan database demo terpisah dari database production.

### 3. Jalankan MongoDB

Pastikan MongoDB lokal berjalan atau gunakan connection string MongoDB Atlas pada `MONGO_URI`. Untuk development, database yang dipakai harus aman untuk di-reset karena seed demo bersifat destructive.

### 4. Seed data demo

```bash
npm run seed:demo --prefix server
```

Seed menghapus data pada database target. Jalankan hanya terhadap database demo/local yang terpisah.

Akun demo yang dibuat oleh seed:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dentalcare.id` | `password123` |
| Dentist | `sarah@dentalcare.id` | `password123` |
| Dentist | `budi@dentalcare.id` | `password123` |
| Dentist | `maya@dentalcare.id` | `password123` |
| Patient | `patient@dentalcare.id` | `password123` |

Akun dan password tersebut hanya untuk demo. Jangan gunakan pada production.

### 5. Jalankan aplikasi

```bash
npm run dev
```

URL development:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Swagger UI: `http://localhost:5000/api/docs`

Alternatif menjalankan proses terpisah:

```bash
npm run dev:server
npm run dev:client
```

Swagger otomatis ditutup pada production kecuali sengaja diaktifkan melalui environment.

## Environment Variables

Template lengkap tersedia di `server/.env.example`, `server/.env.production.example`, `client/.env.example`, dan `client/.env.production.example`.

### Backend

| Variable | Wajib | Keterangan |
|---|---:|---|
| `MONGO_URI` | Ya | Connection string MongoDB lokal/demo atau Atlas |
| `JWT_SECRET` | Ya | Minimal 32 karakter; harus unik di production |
| `PORT` | Tidak | Default `5000` |
| `NODE_ENV` | Tidak | `development` atau `production` |
| `APP_ENV` | Tidak | `demo` atau `production` |
| `ALLOW_DEMO_ACCOUNTS` | Production | Wajib `false` di production |
| `SEED_MODE` | Production | Wajib `disabled` di production |
| `CLIENT_URL` | Production | Origin frontend, tanpa trailing slash; bisa comma-separated |
| `TRUST_PROXY` | Jika di balik proxy | Gunakan `1` untuk Nginx/Caddy tepercaya |
| `CLOUDINARY_*` | Production upload | Gunakan untuk storage gambar yang persistent |
| `SMTP_*` | Production reset password | Diperlukan agar email reset benar-benar terkirim |
| `FONNTE_TOKEN` | Opsional | Pengingat WhatsApp |
| `MIDTRANS_*` | Opsional | Pembayaran DP |
| `CLINIC_*` | Opsional | Nama, alamat, dan nomor klinik pada invoice/reminder |

### Frontend

| Variable | Keterangan |
|---|---|
| `VITE_API_URL` | Base URL API; lokal `http://localhost:5000/api`, deployment same-origin `/api` |
| `VITE_MIDTRANS_CLIENT_KEY` | Client key Midtrans jika pembayaran diaktifkan |
| `VITE_MIDTRANS_IS_PRODUCTION` | `true` untuk mode production |
| `VITE_CLINIC_NAME` | Nama klinik pada frontend |
| `VITE_WHATSAPP_NUMBER` | Nomor WhatsApp publik |

Nilai `VITE_*` tertanam saat proses build. Setelah mengubahnya, frontend harus di-build ulang.

## Scripts

### Root

| Command | Fungsi |
|---|---|
| `npm run dev` | Menjalankan client dan server bersamaan |
| `npm run dev:server` | Menjalankan backend dengan Nodemon |
| `npm run dev:client` | Menjalankan Vite frontend |
| `npm run build` | Build frontend |
| `npm run test` | Menjalankan test backend |
| `npm run check` | Test backend, lint client, lalu build client |
| `npm run seed` | Menjalankan seed server; gunakan hanya pada database non-production |

### Server dan client

```bash
npm test --prefix server
npm run seed:demo --prefix server
npm run lint --prefix client
npm run build --prefix client
```

### Backup dan restore MongoDB

Di Linux VPS, setelah `mongodump`/`mongorestore` terpasang:

```bash
bash scripts/backup-mongo.sh
bash scripts/restore-mongo.sh /path/to/dentalcare_YYYYMMDD_HHMMSS.archive.gz
```

Backup default disimpan di `/var/backups/dentalcare` dan mempertahankan archive selama 14 hari. Restore memakai `--drop` dan meminta konfirmasi; lakukan hanya setelah memastikan target database benar.

## Testing, Lint, dan Build

Validasi lokal lengkap:

```bash
npm run check
```

CI GitHub Actions saat ini menjalankan:

- test backend pada Node.js 20;
- lint dan build frontend;
- build image Docker;
- deployment SSH pada branch `main` dan `setup-main`.

Catatan penting: langkah lint CI memiliki `continue-on-error: true`, sehingga lint belum menjadi quality gate yang memblokir workflow. Status CI tidak otomatis membuktikan bahwa deployment production sedang aktif.

## API Overview

Semua endpoint memakai prefix `/api` dan response JSON dengan format umum `{ success, data, message? }`.

| Area | Prefix |
|---|---|
| Authentication | `/api/auth` |
| Users | `/api/users` |
| Dentists | `/api/dentists` |
| Services | `/api/services` |
| Appointments | `/api/appointments` |
| Prescriptions | `/api/prescriptions` |
| Invoices | `/api/invoices` |
| Payments | `/api/payments` |
| Articles | `/api/articles` |
| Testimonials | `/api/testimonials` |
| Upload | `/api/upload` |
| Clinic settings | `/api/clinic-settings` |
| Dentist leaves | `/api/dentist-leaves` |

Endpoint operasional:

- `GET /api/health` — status API dan koneksi database
- `GET /api/docs` — Swagger UI pada development
- `GET /api/docs.json` — OpenAPI JSON pada development

Spesifikasi lengkap tersedia di `server/docs/openapi.yaml`.

## Deployment Production ke Tencent Cloud VPS

Production utama menggunakan Nginx + PM2 di satu Tencent Cloud VPS dan MongoDB Atlas sebagai database managed.

### Konfigurasi production minimum

`server/.env`:

```env
NODE_ENV=production
APP_ENV=production
ALLOW_DEMO_ACCOUNTS=false
SEED_MODE=disabled
PORT=5000
TRUST_PROXY=1
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/dentalcare_production
JWT_SECRET=RANDOM_SECRET_MINIMAL_32_KARAKTER
JWT_EXPIRES_IN=7d
CLIENT_URL=https://smiledental.my.id
ENABLE_SWAGGER=false
```

`client/.env`:

```env
VITE_API_URL=/api
```

Aturan production:

- Atlas Network Access hanya mengizinkan Elastic IP VPS, bukan IP pribadi operator secara permanen.
- Port publik cukup `80/443`; port `5000` hanya listen/proxy lokal dan port `27017` tidak digunakan di VPS.
- Gunakan Cloudinary untuk upload karena local disk tidak persistent pada banyak environment.
- Konfigurasikan SMTP sebelum mengandalkan forgot-password.
- Buat admin production melalui proses non-destructive dengan password unik; jangan menjalankan seed.
- Simpan secret di environment/secret manager, bukan di Git.

### Deploy/update aplikasi

Script deployment berada di `deploy/deploy.sh`. Script tersebut menjalankan:

1. pull source;
2. install dependency backend production;
3. install dan build frontend;
4. copy `client/dist` ke `/var/www/dentalcare/client/dist`;
5. start/reload PM2 memakai `deploy/ecosystem.config.js`;
6. health check ke `http://127.0.0.1:5000/api/health`.

```bash
cd /opt/dentalcare
bash deploy/deploy.sh
```

`deploy/deploy.sh` saat ini melakukan `git pull origin main`, sedangkan branch kerja terbaru yang dianalisis adalah `setup-main`. Verifikasi branch target sebelum menjalankan script pada server agar production tidak mengambil source yang salah.

PM2 dikonfigurasi dengan:

- nama aplikasi `dentalcare-api`;
- 2 instance cluster;
- `NODE_ENV=production`;
- demo account disabled;
- seed disabled;
- auto-restart berbasis memory/restart policy.

Nginx memakai `deploy/nginx-dentalcare.conf` untuk:

- menyajikan SPA dari `/var/www/dentalcare/client/dist`;
- meneruskan `/api/` dan `/uploads/` ke Express;
- menyediakan SPA fallback;
- menambahkan header keamanan dan cache asset.

Panduan detail provisioning, Tailscale, Security Group, UFW, SSL, backup, dan monitoring:

- [`docs/vps-setup-guide.md`](docs/vps-setup-guide.md)
- [`docs/CLIENT_DEPLOYMENT_GUIDE.md`](docs/CLIENT_DEPLOYMENT_GUIDE.md)
- [`DEPLOYMENT.md`](DEPLOYMENT.md)

### GitHub Actions / CI-CD

Workflow `.github/workflows/ci.yml` aktif pada push dan pull request ke `main` serta `setup-main`. Job deploy memakai GitHub Secrets berikut:

- `SSH_HOST`
- `SSH_USER`
- `SSH_PRIVATE_KEY`

Kondisi workflow saat ini perlu dipahami dengan tepat: job deploy melakukan `git pull`, build, dan copy **frontend**, lalu reload Nginx. Job tersebut tidak menjalankan `npm ci` backend, reload PM2, atau health check API. Karena itu, perubahan backend belum dapat dianggap otomatis aktif hanya berdasarkan keberhasilan job deploy. Jalur backend yang lebih lengkap adalah `deploy/deploy.sh` atau perbaikan workflow terpisah.

## Deployment Alternatif

### Docker single-host

```bash
cp server/.env.production.example server/.env
cp client/.env.production.example client/.env
# Isi secret dan konfigurasi production
# Untuk same-origin Nginx, gunakan VITE_API_URL=/api
docker compose up -d --build
```

Compose menyediakan service `mongo`, `server`, dan `client`. Binding host backend adalah `127.0.0.1:5000`, sehingga port `5000` bukan endpoint publik yang boleh diasumsikan dapat diakses melalui IP VPS.

### Vercel untuk frontend terpisah

`client/vercel.json` sudah menyediakan SPA rewrite dan cache headers. Konfigurasi umum:

- Root directory: `client`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- `VITE_API_URL`: URL API production lengkap, misalnya `https://smiledental.my.id/api` atau API subdomain yang benar-benar dikonfigurasi

Repository tidak menyimpan bukti URL Vercel live. Jangan mencantumkan URL `*.vercel.app` sebelum diverifikasi dari dashboard Vercel.

## Production Checklist

### Wajib sebelum go-live

- [ ] Domain `smiledental.my.id` mengarah ke Elastic IP VPS yang benar.
- [ ] HTTPS aktif dan renewal Let's Encrypt berhasil.
- [ ] `CLIENT_URL` sama persis dengan origin frontend production.
- [ ] `VITE_API_URL` sudah benar saat build terakhir.
- [ ] `JWT_SECRET` production unik dan minimal 32 karakter.
- [ ] `ALLOW_DEMO_ACCOUNTS=false` dan `SEED_MODE=disabled`.
- [ ] Tidak ada akun/password demo pada database production.
- [ ] MongoDB Atlas hanya mengizinkan IP VPS dan memakai user database khusus.
- [ ] Port `5000` dan `27017` tidak terbuka ke publik.
- [ ] Cloudinary aktif untuk upload production.
- [ ] SMTP diuji untuk forgot-password.
- [ ] PM2 online dan auto-start setelah reboot.
- [ ] Backup MongoDB berjalan dan pernah diuji restore-nya.
- [ ] Monitoring uptime mengarah ke `/api/health`.
- [ ] Secret tidak berada di repository atau README.

### Security dan data

Aplikasi menangani data pasien dan rekam medis. Sebelum dipakai operasional, lakukan security review, batasi akses admin, gunakan password unik, siapkan prosedur backup/restore, dan pastikan kebijakan privasi serta kewajiban hukum yang berlaku telah ditangani.

## Troubleshooting Singkat

| Gejala | Pemeriksaan |
|---|---|
| `/api/health` `degraded` | Cek `MONGO_URI`, Atlas Network Access, dan log PM2 |
| CORS error | Pastikan `CLIENT_URL` cocok persis dengan origin browser |
| 502 Bad Gateway | Cek `pm2 list`, `pm2 logs dentalcare-api`, dan Nginx |
| Frontend memanggil API yang salah | Cek `VITE_API_URL` saat build; variable Vite tidak berubah runtime |
| Upload hilang setelah restart | Cloudinary belum dikonfigurasi; local disk bukan storage production yang persisten |
| Forgot-password tidak terkirim | Cek `SMTP_*`; tanpa SMTP, email hanya dicetak ke log development |
| Login terkena 429 | Auth rate limit aktif; tunggu window limit atau periksa konfigurasi rate limiter |
| Backup gagal | Pastikan `mongodump` terpasang dan `MONGO_URI` dapat diakses dari host |

## Dokumentasi Terkait

- [`DEPLOYMENT.md`](DEPLOYMENT.md) — pilihan deployment dan checklist operasional
- [`docs/vps-setup-guide.md`](docs/vps-setup-guide.md) — setup Tencent Cloud VPS
- [`docs/CLIENT_DEPLOYMENT_GUIDE.md`](docs/CLIENT_DEPLOYMENT_GUIDE.md) — serah terima dan maintenance klien
- [`marketing/`](marketing/) — sales playbook, pricing, demo script, dan landing page
- [`LICENSE`](LICENSE) — ketentuan lisensi

## License

Commercial Single-Clinic License. Baca [LICENSE](LICENSE) untuk ketentuan penggunaan. Untuk multi-clinic, SaaS, atau enterprise, hubungi `licensing@dentalcare.id`.
