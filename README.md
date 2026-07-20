# 🦷 DentalCare Clinic Management System

Sistem manajemen klinik dokter gigi full-stack berbasis **MERN** (MongoDB, Express, React, Node.js) — modern, responsif, aman, dan **siap dijual sebagai produk**.

![Tech](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-Commercial-orange) ![PWA](https://img.shields.io/badge/PWA-installable-blueviolet) ![Docker](https://img.shields.io/badge/Docker-ready-blue)

📦 **Production-ready**: Docker + CI/CD + Swagger docs + backup script
💼 **Sales-ready**: lihat [`marketing/`](marketing/) untuk pricing, sales playbook, dan landing page produk
🚀 **Deploy guide**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
📖 **API docs**: jalankan server lalu buka `http://localhost:5000/api/docs`

---

## Fitur Utama

### 👥 Multi-Role
- **Guest / Visitor** — Landing page, layanan, profil dokter, blog, kontak, booking sederhana
- **Pasien** — Register, login, booking, riwayat appointment, treatment notes, profil
- **Dokter Gigi** — Dashboard praktik, daftar appointment, catatan diagnosis & tindakan
- **Admin Klinik** — Dashboard statistik, kelola dokter/layanan/appointment/pasien/artikel/testimoni

### ✨ Highlight
- 🔐 JWT auth dengan role-based access control
- 🛡️ **Security hardening**: Helmet, rate limiting (login 10/15min), NoSQL injection sanitizer, CORS allowlist
- 🔑 **Forgot/reset password** via email (SMTP) — fallback console log untuk dev
- ☁️ **Cloudinary upload** dengan fallback ke local disk untuk dev
- 🦷 **Odontogram interaktif** (notasi FDI dewasa 32 gigi) — editable oleh dokter, read-only di profil pasien
- 📋 **Rekam medis pasien**: golongan darah, alergi, kondisi sistemik, obat saat ini, catatan
- ℞ **Resep obat**: multi-item dengan dosis, frekuensi, durasi, instruksi + halaman print
- 🧾 **Invoice + PDF download** (auto-numbering, diskon, pajak, multi-payment status)
- 🔁 Status appointment dengan validasi alur (pending → confirmed → completed)
- 📅 Cek bentrok jadwal dokter otomatis
- 🌐 Tampilan publik responsif dengan WhatsApp floating, Google Maps, FAQ, testimoni
- 📊 Dashboard statistik admin: top services, top dentists, pasien baru, status breakdown
- 📥 Export laporan appointment ke CSV
- 🎨 White-label settings untuk nama, logo, warna, kontak, jam operasional, dan peta
- 🌙 Dark mode dengan preferensi tersimpan
- 📱 PWA installable dengan offline app shell
- ⚡ Loading skeleton untuk dashboard dan katalog utama
- ✅ Validasi form terstruktur menggunakan React Hook Form + Zod
- 🌱 Seed data: admin + 3 dokter + 1 pasien demo + 6 layanan + 3 artikel + 4 testimoni

---

## 📁 Struktur Proyek

```
dentalcare-clinic/
├── server/              # Backend (Node + Express + Mongoose)
│   ├── config/          # Database connection
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth, error handler, upload
│   ├── models/          # Mongoose schemas (User, DentistProfile, Service, Appointment, Article, Testimonial)
│   ├── routes/          # Express routers
│   ├── validators/      # Input validation
│   ├── seed/            # Seed script
│   ├── utils/           # Helpers (token, error)
│   ├── uploads/         # Multer storage (local)
│   └── server.js        # Entry point
│
├── client/              # Frontend (React + Vite + Tailwind)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/      # Button, Input, Modal, Loader, Badge, EmptyState
│       │   ├── layout/      # Navbar, Footer, Sidebar layouts
│       │   ├── cards/       # ServiceCard, DentistCard, ArticleCard
│       │   ├── forms/
│       │   └── dashboard/   # StatCard
│       ├── pages/
│       │   ├── public/      # 11 halaman publik
│       │   ├── auth/        # Login, Register
│       │   ├── patient/     # Dashboard, Appointments, Profile
│       │   ├── dentist/     # Dashboard, Appointments
│       │   └── admin/       # 7 halaman admin
│       ├── routes/          # ProtectedRoute
│       ├── context/         # AuthContext, ToastContext
│       ├── services/        # Axios instance + API services
│       ├── utils/           # Formatters
│       └── hooks/
│
├── package.json         # Workspace scripts
└── README.md
```

---

## 🚀 Quickstart Lokal

### Prasyarat
- Node.js **18+**
- MongoDB lokal (`mongod`) atau **MongoDB Atlas**

### 1) Clone & install
```bash
git clone <repo-url> dentalcare-clinic
cd dentalcare-clinic
npm run install:all
```

### 2) Konfigurasi environment

**`server/.env`** (copy dari `server/.env.example`)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dentalcare
JWT_SECRET=ganti_dengan_random_string_panjang_minimal_32_karakter
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**`client/.env`** (copy dari `client/.env.example`)
```
VITE_API_URL=http://localhost:5000/api
VITE_WHATSAPP_NUMBER=6281234567890
VITE_CLINIC_NAME=DentalCare Clinic
```

### 3) Seed data dummy
```bash
npm run seed
```

Akan membuat akun demo:

| Role     | Email                       | Password    |
|----------|-----------------------------|-------------|
| Admin    | `admin@dentalcare.id`       | `password123` |
| Dentist  | `sarah@dentalcare.id`       | `password123` |
| Dentist  | `budi@dentalcare.id`        | `password123` |
| Dentist  | `maya@dentalcare.id`        | `password123` |
| Patient  | `patient@dentalcare.id`     | `password123` |

### 4) Jalankan dev server
Cara cepat (concurrent backend + frontend):
```bash
npm run dev
```

Atau di terminal terpisah:
```bash
# Terminal 1
npm run dev:server   # http://localhost:5000

# Terminal 2
npm run dev:client   # http://localhost:5173
```

---

## 🐳 Production Deploy (Docker)

```bash
cp server/.env.production.example server/.env
cp client/.env.production.example client/.env
# isi env dengan kredensial real
docker compose up -d --build
```

Akses client di `http://localhost`, API di `http://localhost:5000`, Swagger di `http://localhost:5000/api/docs`.

Detail lengkap (VPS, Vercel+Railway, reverse proxy, backup): **[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## 💼 Sales & Pricing

Folder [`marketing/`](marketing/) berisi:
- **[SALES.md](marketing/SALES.md)** — positioning, diferensiasi, handling objection
- **[PRICING.md](marketing/PRICING.md)** — paket Basic (Rp 4,9jt) / Pro (Rp 9,9jt) / Enterprise (Rp 24,9jt+)
- **[DEMO_SCRIPT.md](marketing/DEMO_SCRIPT.md)** — script demo 15 menit ke prospek
- **[landing/index.html](marketing/landing/index.html)** — landing page produk standalone, deploy ke Vercel / GitHub Pages

---

## 🧱 Model Database

Lihat `server/models/` untuk schema lengkap.

| Model | Deskripsi |
|-------|-----------|
| `User` | name, email, password (hashed), phone, role (`patient`/`dentist`/`admin`), avatar, isActive, dateOfBirth, gender, address, **medicalHistory** (bloodType, allergies, conditions, currentMedications, notes), resetPasswordTokenHash |
| `DentistProfile` | userId, specialization, experienceYears, education, bio, availableDays, workingHours, consultationFee |
| `Service` | title, slug (auto), description, priceRange, duration, image, isActive |
| `Appointment` | patientId, dentistId, serviceId, date, time, status, complaint, diagnosis, treatmentNotes, recommendation, **odontogram[]** (FDI tooth chart) |
| `Prescription` | appointmentId, patientId, dentistId, **items[]** (drugName, dosage, frequency, duration, instructions), generalNotes |
| `Invoice` | invoiceNumber (auto INV-YYYYMM-XXXX), appointmentId, patientId, dentistId, items[], subtotal, discount, taxRate, tax, total, amountPaid, paymentStatus, paymentMethod, paidAt |
| `Article` | title, slug, content, excerpt, coverImage, authorId, tags, published |
| `Testimonial` | patientName, rating, message, isApproved |

---

## 🔌 API Endpoints

Semua endpoint berada di prefix `/api`. JSON request, respons format `{ success, data, message? }`.

### Auth
| Method | Path                                | Akses     |
|--------|-------------------------------------|-----------|
| POST   | `/auth/register`                    | Public    |
| POST   | `/auth/login`                       | Public    |
| GET    | `/auth/me`                          | Auth      |
| POST   | `/auth/forgot-password`             | Public    |
| POST   | `/auth/reset-password/:token`       | Public    |

### Users
| Method | Path                              | Akses             |
|--------|-----------------------------------|-------------------|
| GET    | `/users`                          | Admin             |
| GET    | `/users/:id`                      | Admin / Self      |
| PUT    | `/users/:id`                      | Admin / Self      |
| PUT    | `/users/:id/medical-history`      | Admin / Dentist / Self |
| DELETE | `/users/:id`                      | Admin             |

### Dentists
| Method | Path             | Akses |
|--------|------------------|-------|
| GET    | `/dentists`      | Public |
| GET    | `/dentists/:id`  | Public |
| POST   | `/dentists`      | Admin |
| PUT    | `/dentists/:id`  | Admin |
| DELETE | `/dentists/:id`  | Admin |

### Services
| Method | Path                | Akses  |
|--------|---------------------|--------|
| GET    | `/services`         | Public |
| GET    | `/services/:slug`   | Public |
| POST   | `/services`         | Admin  |
| PUT    | `/services/:id`     | Admin  |
| DELETE | `/services/:id`     | Admin  |

### Appointments
| Method | Path                                              | Akses |
|--------|---------------------------------------------------|-------|
| POST   | `/appointments`                                   | Patient/Admin |
| GET    | `/appointments/availability`                      | Public |
| GET    | `/appointments`                                   | Admin/Dentist |
| GET    | `/appointments/stats`                             | Admin |
| GET    | `/appointments/my-appointments`                   | Patient |
| GET    | `/appointments/patient/:patientId/odontogram`     | Self / Staff |
| GET    | `/appointments/:id`                               | Admin / Owner / Assigned dentist |
| PUT    | `/appointments/:id/status`                        | Admin / Dentist / Patient (cancel only) |
| PUT    | `/appointments/:id/reschedule`                    | Admin / Assigned dentist |
| PUT    | `/appointments/:id/odontogram`                    | Admin / Assigned dentist |
| DELETE | `/appointments/:id`                               | Admin |

### Payments
| Method | Path                                      | Akses |
|--------|-------------------------------------------|-------|
| GET    | `/payments/appointment/:id/dp`            | Owner / Assigned staff |
| POST   | `/payments/appointment/:id/dp`            | Patient owner |
| POST   | `/payments/appointment/:id/dp/confirm`    | Patient/Admin (development only) |
| POST   | `/payments/notification`                  | Midtrans webhook |

### Prescriptions
| Method | Path                  | Akses |
|--------|-----------------------|-------|
| POST   | `/prescriptions`      | Admin / Dentist |
| GET    | `/prescriptions`      | Auth (filtered by role) |
| GET    | `/prescriptions/:id`  | Auth (self / staff) |
| PUT    | `/prescriptions/:id`  | Admin / Issuing dentist |
| DELETE | `/prescriptions/:id`  | Admin |

### Invoices
| Method | Path                          | Akses |
|--------|-------------------------------|-------|
| POST   | `/invoices`                   | Admin / Dentist |
| GET    | `/invoices`                   | Auth (filtered by role) |
| GET    | `/invoices/:id`               | Auth (self / staff) |
| GET    | `/invoices/:id/pdf`           | Auth (self / staff) — returns PDF |
| PUT    | `/invoices/:id`               | Admin |
| PUT    | `/invoices/:id/payment`       | Admin |
| DELETE | `/invoices/:id`               | Admin |

### Articles
| Method | Path                | Akses |
|--------|---------------------|-------|
| GET    | `/articles`         | Public (terbit saja) / Staff (semua) |
| GET    | `/articles/:slug`   | Public (terbit saja) / Staff (semua) |
| POST   | `/articles`         | Admin / Dentist |
| PUT    | `/articles/:id`     | Admin / Author |
| DELETE | `/articles/:id`     | Admin / Author |

### Testimonials
| Method | Path                              | Akses |
|--------|-----------------------------------|-------|
| GET    | `/testimonials`                   | Public (approved saja) / Admin (semua) |
| POST   | `/testimonials`                   | Public |
| PUT    | `/testimonials/:id/approve`       | Admin |
| DELETE | `/testimonials/:id`               | Admin |

### Upload
| Method | Path       | Akses |
|--------|------------|-------|
| POST   | `/upload`  | Admin / Dentist (multipart, field `image`) |

### Clinic Settings
| Method | Path                | Akses |
|--------|---------------------|-------|
| GET    | `/clinic-settings`  | Public |
| PUT    | `/clinic-settings`  | Admin |

---

## 🔐 Business Logic & Security

### Auth & Access
- Password di-hash menggunakan **bcrypt** (10 rounds)
- JWT token dikirim sebagai `Authorization: Bearer <token>` (interceptor Axios mengurus otomatis)
- Field `password` selalu di-exclude dari respons (`select: false` + `toJSON` override)
- Forgot-password: token random 32 byte, simpan SHA-256 hash di DB, TTL 30 menit, response generik (tidak bocor email terdaftar)
- **Pasien** hanya bisa melihat appointment miliknya
- **Dokter** hanya bisa melihat appointment yang ditugaskan kepadanya
- **Admin** bisa melihat & mengubah semua data

### Hardening (Sprint 1)
- **Helmet** memasang security headers default
- **Rate limit** global: 300 req / 15 menit / IP
- **Rate limit** auth (login/register/forgot/reset): 10 req / 15 menit / IP, skip successful
- **express-mongo-sanitize** mencegah NoSQL injection lewat operator `$`/`.`
- **CORS allowlist** dari env `CLIENT_URL` (comma-separated); request tanpa Origin tetap dilewatkan
- **Env validation** saat startup: `MONGO_URI`, `JWT_SECRET` (≥32 char) wajib; `CLIENT_URL` wajib di production
- **Trust proxy** aktif untuk deteksi IP asli di balik reverse proxy (Render/Vercel/Nginx)
- **Tanggal lampau** ditolak saat membuat appointment
- **Bentrok jadwal** dicek (dentistId + tanggal + jam yang masih `pending`/`confirmed`)
- **Alur status**:
  - `pending → confirmed` (admin/dokter)
  - `pending → cancelled` (admin/dokter/pasien)
  - `confirmed → completed` (admin/dokter)
  - `confirmed → cancelled` (admin/dokter)
- **Artikel** hanya tampil di publik jika `published = true`
- **Testimoni** hanya tampil di publik jika `isApproved = true`

---

## 🌐 Deployment

### Database — MongoDB Atlas
1. Buat cluster gratis di [MongoDB Atlas](https://cloud.mongodb.com)
2. Atur Network Access → IP whitelist (0.0.0.0/0 untuk demo)
3. Create user → copy connection string
4. Set sebagai `MONGO_URI` di environment backend

### Backend — Render / Railway
1. Push repo ke GitHub
2. Render → New Web Service → connect repo → set Root Directory ke `server`
3. Build Command: `npm install` · Start Command: `npm start`
4. Environment variables:
   ```
   MONGO_URI=...      # Atlas
   JWT_SECRET=...
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   CLIENT_URL=https://<frontend-domain>
   ```
5. (Opsional) Jalankan `npm run seed` lewat shell sekali untuk inisialisasi data
6. Catat URL backend, mis. `https://dentalcare-api.onrender.com`

### Frontend — Vercel
1. Vercel → Import Project → Root Directory: `client`
2. Framework: **Vite**
3. Build Command: `npm run build` · Output Directory: `dist`
4. Environment variables:
   ```
   VITE_API_URL=https://dentalcare-api.onrender.com/api
   VITE_WHATSAPP_NUMBER=6281234567890
   ```
5. Deploy. Pastikan `CLIENT_URL` di backend di-update dengan domain Vercel (CORS).

---

## 🛠️ Tips Pengembangan
- Tambah specialization/working hours via halaman **Admin → Dokter**
- Untuk login dokter: gunakan akun yang dibuat oleh admin (ada field password)
- Token disimpan di `localStorage` (`dc_token`). Untuk produksi tinggi-keamanan, ganti ke httpOnly cookie + CSRF token.
- **Image upload**: secara default ke local disk. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` agar otomatis pindah ke Cloudinary (folder bisa diset via `CLOUDINARY_FOLDER`, default `dentalcare`).
- **Email reset password**: tanpa konfigurasi SMTP, isi email akan di-log ke console (mudah untuk dev). Untuk produksi set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`. Mailtrap atau Resend bagus untuk testing.

---

## 📝 License

Commercial Single-Clinic License — lihat file [LICENSE](LICENSE) untuk ketentuan lengkap.
Untuk multi-clinic, SaaS, atau enterprise: [licensing@dentalcare.id](mailto:licensing@dentalcare.id)
