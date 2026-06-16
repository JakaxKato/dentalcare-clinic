# DentalCare — Production Deployment Guide

Tiga jalur deployment yang sudah didukung. Pilih sesuai budget & skill ops klien.

| Jalur | Cocok untuk | Biaya bulanan (rough) | Effort |
|---|---|---|---|
| **A. Docker single-host** | Klinik 1 cabang, ada admin IT | $10–25 (VPS 2GB) | Sedang |
| **B. Vercel (client) + Railway/Render (server) + MongoDB Atlas** | Klinik kecil, tanpa tim ops | $0–25 (semua punya free tier) | Rendah |
| **C. Bare-metal Node + nginx + PM2** | Klinik yang sudah punya server sendiri | tergantung server | Tinggi |

---

## Pra-syarat (semua jalur)

1. **Domain**: minimal 2 subdomain (`app.klinik.com` untuk client, `api.klinik.com` untuk server).
2. **MongoDB**: Atlas free tier (M0) cukup untuk <500 pasien. Upgrade ke M10 ($60/bln) untuk produksi serius.
3. **SMTP**: Gmail App Password, Mailgun, atau SendGrid (untuk forgot password).
4. **Cloudinary**: free tier 25GB sudah cukup untuk klinik (avatar dokter, foto layanan).
5. **Fonnte** (opsional, untuk WhatsApp reminder H-1): aktivasi device + token, ~Rp 25rb/bln.
6. **Midtrans** (opsional, untuk DP online): akun production, fee 2.9% + Rp 2.500/tx.
7. **JWT_SECRET**: generate dengan `openssl rand -base64 48` — minimal 32 karakter.

---

## Jalur A — Docker single-host (Recommended)

### 1. Provision VPS
Recommend: DigitalOcean / Vultr / Hetzner / Biznet Gio. Min spec: **2 vCPU, 2GB RAM, 40GB SSD, Ubuntu 22.04+**.

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# logout-login ulang supaya group efek
```

### 3. Clone repo + env files
```bash
git clone <repo-url> /opt/dentalcare
cd /opt/dentalcare
cp server/.env.production.example server/.env
cp client/.env.production.example client/.env
nano server/.env  # isi MONGO_URI, JWT_SECRET, Cloudinary, SMTP, dst.
nano client/.env  # isi VITE_API_URL
```

### 4. Bangun & jalankan
```bash
docker compose up -d --build
docker compose logs -f server  # cek log
```
Akses:
- Client: http://<vps-ip>
- API: http://<vps-ip>:5000/api/health
- Swagger: http://<vps-ip>:5000/api/docs

### 5. Pasang reverse proxy + HTTPS (Caddy — termudah)
`/etc/caddy/Caddyfile`:
```caddy
app.klinik.com {
    reverse_proxy localhost:80
}
api.klinik.com {
    reverse_proxy localhost:5000
}
```
```bash
sudo systemctl reload caddy   # Caddy auto-issue Let's Encrypt
```

### 6. Seed data awal (sekali saja)
```bash
docker compose exec server npm run seed
```
Login admin default: `admin@dentalcare.id` / `admin123` → **WAJIB ganti password segera**.

### 7. Backup berkala
Lihat `scripts/backup-mongo.sh`. Tambahkan cron:
```bash
0 2 * * * /opt/dentalcare/scripts/backup-mongo.sh
```

---

## Jalur B — Vercel + Railway + MongoDB Atlas

### Client (Vercel)
1. Import repo ke Vercel, **root directory** = `client`.
2. Environment variables:
   - `VITE_API_URL` = `https://api.klinik.com`
   - `VITE_MIDTRANS_CLIENT_KEY` (opsional)
3. Build command: `npm run build`, output: `dist`.
4. `client/vercel.json` sudah ada (SPA rewrite).

### Server (Railway / Render)
1. New service from repo, root = `server`.
2. Start command: `npm start`.
3. Set environment variables sesuai `server/.env.production.example`.
4. Pasang custom domain `api.klinik.com`.
5. Health check path: `/api/health`.

### Database (MongoDB Atlas)
1. Create cluster M0 (free) di region terdekat (Singapore untuk Indonesia).
2. Network Access → allow `0.0.0.0/0` (atau IP Railway).
3. Database User → user terpisah, password kuat → masukkan ke `MONGO_URI`.

---

## Jalur C — Bare-metal Node + PM2

```bash
# Server
cd server && npm ci --omit=dev
npm install -g pm2
pm2 start server.js --name dentalcare-api
pm2 save
pm2 startup     # auto-start saat boot

# Client (build static, serve via nginx)
cd ../client && npm ci && npm run build
# Copy dist/ ke /var/www/dentalcare, atur nginx pakai client/nginx.conf
```

---

## Post-deploy Checklist

- [ ] HTTPS aktif untuk app & API (cek di https://www.ssllabs.com — target grade A).
- [ ] Password admin seed sudah diganti.
- [ ] `JWT_SECRET` di production **berbeda** dari dev.
- [ ] CORS allowlist (`CLIENT_URL`) hanya berisi domain produksi.
- [ ] `MONGO_URI` user produksi punya akses read-write **hanya** ke DB `dentalcare`.
- [ ] Email forgot-password sampai ke inbox (test pakai akun gmail).
- [ ] Cloudinary upload berfungsi (cek dari halaman upload avatar).
- [ ] Fonnte: test broadcast preview log; WhatsApp benar-benar terkirim.
- [ ] Midtrans: webhook URL `https://api.klinik.com/api/payments/notification` terkonfigurasi & status verifikasi `Active`.
- [ ] Cron backup MongoDB harian aktif.
- [ ] Monitoring uptime (UptimeRobot free) ke `/api/health`.
- [ ] Setting klinik (logo, warna, jam) sudah diisi via admin → /admin/settings.

---

## Update / Rolling deploy

```bash
cd /opt/dentalcare
git pull
docker compose up -d --build
docker compose exec server npm run seed --if-needed   # jika ada migrasi
```

Downtime <30 detik untuk single host. Untuk zero-downtime butuh load balancer (di luar scope template).

---

## Troubleshooting

| Gejala | Cek |
|---|---|
| `/api/health` returns `degraded` | MongoDB connection. Cek `MONGO_URI`, network access list. |
| CORS error di browser | Pastikan origin client masuk `CLIENT_URL` allowlist. |
| Email reset tidak datang | Cek SMTP credentials, lihat log `nodemailer`. Coba Mailtrap dulu untuk debug. |
| Midtrans status invoice tidak update | Webhook URL salah / signature mismatch. Cek di Midtrans dashboard → Settings → Notification URL. |
| WhatsApp reminder tidak terkirim | Token Fonnte salah / device WA disconnect. `DISABLE_REMINDER=true` untuk stop sementara. |
| Upload gambar gagal di production | `CLOUDINARY_*` belum diisi → server fallback ke local disk yang tidak persistent di banyak PaaS. |
