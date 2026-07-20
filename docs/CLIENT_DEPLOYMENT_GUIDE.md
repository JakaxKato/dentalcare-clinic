# DentalCare — Panduan Deployment & Serah Terima Klien

> Panduan end-to-end: dari persiapan teknis, deploy ke Tencent Cloud CVM, demo ke klien, sampai strategi pasca-maintenance.
> **Untuk:** Kamu (reseller/developer) — bukan untuk end-user klinik.

---

## Daftar Isi

- [1. Gambaran Teknologi (Versi Jelaskan ke Klien)](#1-gambaran-teknologi-versi-jelaskan-ke-klien)
- [2. Persiapan Sebelum Deploy](#2-persiapan-sebelum-deploy)
- [3. Deploy Step-by-Step ke Tencent Cloud CVM](#3-deploy-step-by-step-ke-tencent-cloud-cvm)
- [4. Demo ke Klien (Script 15 Menit)](#4-demo-ke-klien-script-15-menit)
- [5. Serah Terima & Maintenance](#5-serah-terima--maintenance)
- [6. Troubleshooting Cepat](#6-troubleshooting-cepat)

---

## 1. Gambaran Teknologi (Versi Jelaskan ke Klien)

### Analogi Sederhana

> "Ini seperti klinik Anda punya WhatsApp sendiri — pasien bisa booking sendiri lewat HP, dokter tinggal buka dan isi rekam medis, resep langsung jadi PDF, semua rapi dalam satu sistem."

### Komponen (Jelaskan Tanpa Jargon)

| Komponen | Fungsi | Analogi |
|----------|--------|---------|
| **Website Klinik** | Halaman yang dilihat pasien — booking, lihat dokter, artikel | Etalase toko |
| **Aplikasi Internal** | Dashboard dokter & admin — rekam medis, resep, invoice | Meja kerja |
| **Server (VPS Tencent Cloud)** | Komputer yang menjalankan aplikasi 24 jam | "Kantor pusat" digital |
| **Database (MongoDB Atlas)** | Tempat menyimpan SEMUA data (gratis, aman) | Lemari arsip digital |
| **Cloudinary** | Tempat menyimpan foto/gambar (gratis, 25GB) | Album foto online |
| **Domain** | Alamat website (contoh: klinikgigiAnda.com) | Papan nama toko |
| **SSL** | Gembok hijau di browser — koneksi aman | Keamanan toko |

### Arsitektur Sederhana

```
Pasien buka HP
      │
      ▼
┌─────────────────┐
│  klinikgigi.com │  ← Domain (papan nama)
└────────┬────────┘
         │
    ┌────▼─────┐
    │  Server  │  ← Tencent Cloud VPS (kantor pusat)
    │  di SG   │
    └─┬───┬───┬┘
      │   │   │
 ┌────▼┐ ┌▼──┐ ┌▼───────┐
 │Data │ │Foto│ │Payment │
 │(MDB)│ │(CD)│ │(Midtr)│
 └─────┘ └───┘ └────────┘
```

> **Intinya:** Satu server di Singapore, data aman, klinik tinggal pakai. Tidak ada biaya bulanan vendor SaaS.

---

## 2. Persiapan Sebelum Deploy

### Checklist Pra-Deploy

Sebelum mulai deploy, pastikan semua ini sudah siap:

- [ ] **Domain** sudah dibeli & DNS dikelola (rekomendasi: Cloudflare — gratis, cepat, ada proteksi DDoS)
- [ ] **Akun Tencent Cloud** aktif, sudah verifikasi identitas
- [ ] **Akun MongoDB Atlas** — [cloud.mongodb.com](https://cloud.mongodb.com) — daftar gratis
- [ ] **Akun Cloudinary** — [cloudinary.com](https://cloudinary.com) — daftar gratis
- [ ] **SSH key pair** sudah dibuat di laptop kamu
- [ ] **Akun Midtrans** (opsional, untuk demo payment) — [midtrans.com](https://midtrans.com)
- [ ] **Akun Fonnte** (opsional, untuk demo WhatsApp) — [fonnte.com](https://fonnte.com)
- [ ] **Password manager** siap — semua credential akan disimpan di sini

### Domain & DNS Setup (Cloudflare)

```
Di Cloudflare dashboard → DNS → Records:

| Type | Name | Content         | Proxy | TTL  |
|------|------|-----------------|-------|------|
| A    | @    | <Elastic IP VPS> | ✅    | Auto |
| A    | www  | <Elastic IP VPS> | ✅    | Auto |
```

> **Note:** Jangan setting DNS dulu sebelum deploy selesai & nginx siap. Setting nanti di Section 3.10.

### Generate SSH Key

```bash
# Di laptop kamu:
ssh-keygen -t ed25519 -C "dentalcare-cvm" -f ~/.ssh/dentalcare_cvm

# Tampilkan public key (nanti dipaste ke Tencent Cloud):
cat ~/.ssh/dentalcare_cvm.pub
```

### Kumpulkan Semua Credential

Buat file catatan (jangan commit ke Git!) dengan format:

```
=== DENTALCARE CLIENT: [Nama Klinik] ===

Domain: klinikgigi.com
VPS IP: xxx.xxx.xxx.xxx (Elastic IP Tencent Cloud)

MongoDB Atlas:
  Username: dentalcare
  Password: [generate 16+ karakter]
  URI: mongodb+srv://dentalcare:[PASSWORD]@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority

Cloudinary:
  Cloud Name: xxxxx
  API Key: xxxxxxxxxxxxxxx
  API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxx

JWT Secret: [output dari: openssl rand -base64 48]

SMTP: (skip dulu, bisa pakai Gmail App Password nanti)

Midtrans (sandbox):
  Server Key: SB-Mid-xxxxx
  Client Key: SB-Mid-xxxxx

Admin Login (default — HARUS DIGANTI):
  Email: admin@dentalcare.id
  Password: admin123
```

---

## 3. Deploy Step-by-Step ke Tencent Cloud CVM

Ikuti langkah berurutan. Jangan loncat.

---

### 3.1 Buat CVM Instance di Tencent Cloud

1. **Login** ke [console.tencentcloud.com](https://console.tencentcloud.com)
2. **Cloud Virtual Machine (CVM)** → **Instances** → **Create**
3. **Basic Configuration:**
   - Billing: **Pay-as-you-go** (atau Monthly)
   - Region: **Singapore** (paling dekat ke Indonesia, latency rendah)
   - **Custom Configuration** (jangan pakai preset)
4. **Image:** Ubuntu Server 22.04 LTS 64-bit
5. **Instance Type:** 2 vCPU, 2GB Memory (General — tipe S5 atau S6)
   - Kalau tidak ada, pilih yang paling mendekati — minimal 1 vCPU / 2GB
6. **System Disk:** 30GB SSD Cloud Disk
   - Traffic: 1TB/bulan (lebih dari cukup)
7. **Next: Network & Security**
8. **VPC:** Default VPC & subnet (biarkan default)
9. **Public IP:** Centang **Assign Public IP**
   - Pilih **Billed by Traffic** (lebih murah untuk traffic rendah)
   - Bandwidth cap: 100 Mbps
10. **Security Group:** Buat baru — **INI PENTING**

### ⚠️ Security Group Rules (Tencent Cloud Firewall)

```
Ingat: Ini firewall di level hypervisor. Nanti di dalam VPS ada UFW juga.
DUA-DUANYA harus allow port yang sama.

INBOUND RULES:
┌───────────┬──────────┬──────┬─────────────────────┬──────────────────────────┐
│ Direction │ Protocol │ Port │ Source              │ Keterangan               │
├───────────┼──────────┼──────┼─────────────────────┼──────────────────────────┤
│ Inbound   │ TCP      │ 22   │ <IP publik kamu>/32 │ SSH — HANYA dari IP kamu │
│ Inbound   │ TCP      │ 80   │ 0.0.0.0/0           │ HTTP                     │
│ Inbound   │ TCP      │ 443  │ 0.0.0.0/0           │ HTTPS                    │
├───────────┼──────────┼──────┼─────────────────────┼──────────────────────────┤
│ Outbound  │ ALL      │ ALL  │ 0.0.0.0/0           │ Untuk Atlas, npm, dll    │
└───────────┴──────────┴──────┴─────────────────────┴──────────────────────────┘
```

> **Kenapa port 22 jangan 0.0.0.0/0?**
> Membuka SSH ke seluruh internet berisiko brute-force attack. Kamu sudah pakai SSH key (aman),
> tapi sebagai best practice tetap batasi ke IP sendiri. Kalau IP kamu dinamis (sering berubah),
> update source di Security Group tiap kali berubah — atau pertimbangkan pakai VPN.

11. **SSH Key:** Pilih **Import existing key** → paste public key dari `~/.ssh/dentalcare_cvm.pub`
    - Jangan pilih "Set password" — SSH key lebih aman
12. **Next: Advanced Settings**
    - Instance Name: `dentalcare-klienX`
    - Security Enhancement: Centang semua (default)
    - Monitoring: Boleh di-enable (gratis)
13. **Confirm & Create**

### 3.2 Elastic IP (Wajib!)

Setelah instance dibuat:

1. **Elastic IP** → **Apply** (atau **Create** di menu kiri)
2. Region: Singapore
3. **Bind** ke instance yang baru dibuat

> **Kenapa perlu Elastic IP?** IP publik bawaan CVM bisa berubah saat restart. Elastic IP mencegah ini — jadi DNS kamu tidak perlu diupdate tiap kali restart.

---

### 3.3 Login Pertama

```bash
# Pastikan private key sudah ada:
ls ~/.ssh/dentalcare_cvm

# Login:
ssh -i ~/.ssh/dentalcare_cvm ubuntu@<ELASTIC_IP>
```/model

> Kalau koneksi ditolak (Connection refused / timeout):
> - Cek Security Group — port 22 source harus IP publik kamu, BUKAN 172.19.x.x (IP lokal laptop)
> - Cek IP kamu di [whatismyip.com](https://whatismyip.com)
> - Cek instance status: musti "Running"

---

### 3.4 Hardening Server

Jalankan sebagai user `ubuntu`:

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Buat user deploy (jangan pakai ubuntu terus)
sudo adduser deploy
# Isi password kuat, sisanya Enter aja
sudo usermod -aG sudo deploy

# 3. Copy SSH key ke user deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp /home/ubuntu/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys

# 4. Test login sebagai deploy (buka terminal baru, jangan tutup yang sekarang)
ssh -i ~/.ssh/dentalcare_cvm deploy@<ELASTIC_IP>
# Kalau berhasil → lanjut. Kalau gagal → jangan lanjut, debug dulu.

# 5. Hardening SSH (dari user deploy)
sudo nano /etc/ssh/sshd_config
```

Pastikan baris ini ada dan tidak dikomentari (`#`):
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd

# ⚠️ TEST: buka terminal BARU, login lagi sebagai deploy. Pastikan masih bisa.
# Jangan tutup terminal yang sekarang sebelum yakin!
```

```bash
# 6. UFW Firewall (inner ring — setelah Security Group Tencent Cloud)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
# Harusnya: 22/tcp ALLOW, 80/tcp ALLOW, 443/tcp ALLOW
```

```bash
# 7. Fail2ban + Auto-updates
sudo apt install fail2ban unattended-upgrades -y
sudo systemctl enable --now fail2ban
sudo dpkg-reconfigure --priority=low unattended-upgrades
# Pilih "Yes" saat ditanya
```

```bash
# 8. Timezone ke WIB
sudo timedatectl set-timezone Asia/Jakarta
timedatectl
# Harusnya: Time zone: Asia/Jakarta (WIB, +0700)
```

---

### 3.5 Install Dependencies

Semua dijalankan sebagai user `deploy`:

```bash
# === Node.js 20 LTS ===
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node -v   # v20.x.x
npm -v    # 10.x.x

# === Nginx ===
sudo apt install nginx -y
sudo systemctl enable --now nginx
# Test: buka http://<ELASTIC_IP> di browser → "Welcome to nginx"

# === PM2 ===
sudo npm install -g pm2
pm2 -v

# === MongoDB Database Tools (untuk backup) ===
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install mongodb-database-tools mongodb-mongosh -y
mongodump --version
mongosh --version

# === Certbot (untuk SSL) ===
sudo apt install certbot python3-certbot-nginx -y

# === Build tools (untuk bcrypt native compile) ===
sudo apt install build-essential git -y
```

---

### 3.6 Setup MongoDB Atlas

1. Buka [cloud.mongodb.com](https://cloud.mongodb.com) → login
2. **Create** → **M0 FREE** (shared cluster)
3. Provider: pilih AWS/GCP/Azure — yang penting region **Singapore** (`ap-southeast-1`)
4. Cluster Name: `dentalcare-klienX`
5. Tunggu cluster dibuat (±3 menit)

#### Database User

1. **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `dentalcare`
4. Password: **generate minimal 16 karakter** (campur huruf besar/kecil/angka/symbol)
5. Built-in Role: **Read and write to any database**
6. **SIMPAN PASSWORD DI PASSWORD MANAGER!**

#### Network Access

1. **Network Access** → **Add IP Address**
2. Masukkan **Elastic IP VPS** kamu (dengan akhiran `/32`)
   - Contoh: `159.xxx.xxx.xxx/32`
3. Keterangan: `VPS Tencent Cloud`
4. **Add Entry**

#### Connection String

1. **Database** → **Connect** → **Drivers**
2. Pilih driver: Node.js, version: latest
3. Copy connection string:

```
mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority
```

4. Ganti `<PASSWORD>` dengan password user
5. **Simpan di password manager**

#### Test Koneksi dari VPS

```bash
mongosh "mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority"
# Harusnya masuk ke MongoDB shell. Exit: ketik "exit"
```

> Kalau timeout: cek Network Access di Atlas — pastikan Elastic IP VPS sudah di-allow.

---

### 3.7 Setup Cloudinary

1. Buka [cloudinary.com](https://cloudinary.com) → login/register
2. Dashboard → **Account Details**
3. Catat:
   - **Cloud Name** — contoh: `dcklinikxyz`
   - **API Key** — contoh: `123456789012345`
   - **API Secret** — contoh: `aBcDeFgHiJkLmNoPqRsTuVwXyZ1234`
4. Simpan di password manager.

---

### 3.8 Clone & Konfigurasi Aplikasi

```bash
# Masih sebagai user deploy

cd /opt
sudo git clone <REPO_URL> dentalcare
sudo chown -R deploy:deploy /opt/dentalcare
cd /opt/dentalcare
```

> **REPO_URL:** URL repo GitHub/GitLab kamu. Kalau private repo, generate deploy key atau personal access token.

#### Konfigurasi Server

```bash
# Buat .env dari template
cp server/.env.production.example server/.env
nano server/.env
```

Isi dengan nilai asli (sesuaikan dengan credential yang sudah dikumpulkan):

```env
NODE_ENV=production
PORT=5000
TRUST_PROXY=1

# ---- Database ----
MONGO_URI=mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority

# ---- Auth ----
# Generate dengan: openssl rand -base64 48
JWT_SECRET=<HASIL_OPENSSL_RAND>
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# ---- CORS ----
# PAKAI http:// DULU (sebelum SSL aktif). Ganti ke https:// setelah certbot.
CLIENT_URL=http://<DOMAIN_KAMU>

# ---- Cloudinary ----
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
CLOUDINARY_FOLDER=dentalcare

# ---- SMTP (skip dulu — reset password muncul di log PM2) ----
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# ---- Clinic info ----
CLINIC_NAME=Nama Klinik Gigi
CLINIC_ADDRESS=Jl. Alamat Lengkap, Kota
CLINIC_PHONE_DISPLAY=0812-xxxx-xxxx

# ---- WhatsApp (skip dulu) ----
FONNTE_TOKEN=
REMINDER_CRON=0 9 * * *
DISABLE_REMINDER=true

# ---- Midtrans (skip dulu — aktifkan nanti untuk demo payment) ----
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
DP_PERCENT=30
DP_MIN_AMOUNT=25000
```

```bash
# Generate JWT_SECRET:
openssl rand -base64 48
# Copy output, paste ke JWT_SECRET= di server/.env
```

#### Konfigurasi Client

```bash
cp client/.env.production.example client/.env
nano client/.env
```

```env
VITE_API_URL=http://<DOMAIN_KAMU>/api
VITE_MIDTRANS_CLIENT_KEY=
VITE_MIDTRANS_IS_PRODUCTION=false
```

> **PENTING:** `VITE_API_URL` di sini dipakai saat BUILD. Jadi pakai URL yang akan diakses pasien. Kalau belum punya DNS, bisa pakai `http://<ELASTIC_IP>/api` dulu untuk testing.

---

### 3.9 Jalankan Deploy

```bash
# Buat direktori yang diperlukan
sudo mkdir -p /var/www/dentalcare/client
sudo mkdir -p /var/log/dentalcare
sudo chown deploy:deploy /var/log/dentalcare

# Jalankan deploy script
cd /opt/dentalcare
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
```

Script ini otomatis:
1. `git pull` latest code
2. Install server dependencies (production only)
3. Install & build client (dengan env VITE_ dari `client/.env`)
4. Copy `client/dist/` ke `/var/www/dentalcare/client/dist/`
5. Start/reload PM2 dengan 2 instance
6. Health check ke `http://127.0.0.1:5000/api/health`

**Kalau deploy script gagal:** cek error di output, lalu lihat Section 6 Troubleshooting.

```bash
# PM2 auto-start saat reboot
pm2 save
pm2 startup systemd
# Copy & jalankan command yang muncul dari output di atas

# Verifikasi
pm2 list
# Harusnya: dentalcare-api | 2 instances | online | mode: cluster

curl http://127.0.0.1:5000/api/health
# Harusnya: {"success":true,"status":"ok","uptime":...,"database":"connected"}

# Seed data awal
cd /opt/dentalcare/server
node seed/seed.js
# Output: "Database seeded successfully!"
```

**Login admin default:** `admin@dentalcare.id` / `admin123`
> ⚠️ **WAJIB GANTI PASSWORD** setelah login pertama!

---

### 3.10 Nginx & SSL

```bash
# Setup Nginx config
sudo cp /opt/dentalcare/deploy/nginx-dentalcare.conf /etc/nginx/sites-available/dentalcare
sudo ln -s /etc/nginx/sites-available/dentalcare /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Edit nama domain di nginx config
sudo nano /etc/nginx/sites-available/dentalcare
# Cari baris: server_name _;
# Ganti jadi: server_name klinikgigi.com www.klinikgigi.com;
# (atau biarkan _ untuk testing IP-only)

# Test config
sudo nginx -t
# Harusnya: syntax is ok, test is successful

sudo systemctl reload nginx
```

#### DNS Setup

Sekarang saatnya pointing domain ke VPS. Di DNS provider (Cloudflare):

```
| Type | Name | Content         | Proxy | TTL  |
|------|------|-----------------|-------|------|
| A    | @    | <Elastic IP>    | ✅    | Auto |
| A    | www  | <Elastic IP>    | ✅    | Auto |
```

Tunggu propagasi (±5-30 menit). Cek:

```bash
nslookup klinikgigi.com
# Harusnya resolve ke Elastic IP VPS
```

#### Test HTTP

Buka `http://klinikgigi.com` di browser → harusnya halaman login DentalCare tampil.

#### SSL dengan Certbot

```bash
# Pastikan DNS sudah pointing (nslookup resolve ke VPS)
sudo certbot --nginx -d klinikgigi.com -d www.klinikgigi.com
# Ikuti prompt:
# - Enter email: email_kamu@gmail.com
# - Agree to terms: Y
# - Share email: N

# Certbot otomatis:
# - Issue certificate Let's Encrypt
# - Update nginx config (listen 443, redirect HTTP→HTTPS)
# - Setup auto-renewal
```

#### Aktifkan HSTS

```bash
sudo nano /etc/nginx/sites-available/dentalcare
# Cari dan UNCOMMENT baris:
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

sudo nginx -t && sudo systemctl reload nginx
```

#### Update CLIENT_URL

Setelah SSL aktif, wajib update:

```bash
nano /opt/dentalcare/server/.env
# Ganti: CLIENT_URL=http://klinikgigi.com
# Jadi:   CLIENT_URL=https://klinikgigi.com

# Update juga client .env dan rebuild
nano /opt/dentalcare/client/.env
# Ganti: VITE_API_URL=http://klinikgigi.com/api
# Jadi:   VITE_API_URL=https://klinikgigi.com/api

# Rebuild client
cd /opt/dentalcare/client
npm run build
sudo rm -rf /var/www/dentalcare/client/dist
sudo cp -r dist /var/www/dentalcare/client/dist
sudo chown -R www-data:www-data /var/www/dentalcare/client

# Reload PM2
pm2 reload deploy/ecosystem.config.js
```

#### Verifikasi SSL

```bash
# Buka di browser:
https://klinikgigi.com         → halaman login + gembok hijau
https://klinikgigi.com/api/health → {"status":"ok"} + HTTPS

# Cek SSL grade:
# Buka https://www.ssllabs.com/ssltest/analyze.html?d=klinikgigi.com
# Target: Grade A
```

---

### 3.11 Backup & Monitoring

#### MongoDB Backup Harian

```bash
# Buat direktori backup
sudo mkdir -p /var/backups/dentalcare
sudo chown deploy:deploy /var/backups/dentalcare

# Test manual dulu
cd /opt/dentalcare
bash scripts/backup-mongo.sh
# Harusnya membuat file .gz di /var/backups/dentalcare/

# Setup cron harian (jam 2 pagi)
crontab -e
# Tambah:
0 2 * * * /opt/dentalcare/scripts/backup-mongo.sh >> /var/log/dentalcare-backup.log 2>&1
```

#### PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

#### Uptime Monitoring

1. Daftar [UptimeRobot](https://uptimerobot.com) (gratis)
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://klinikgigi.com/api/health`
   - Monitoring interval: 5 menit
   - Alert: Email ke kamu

---

### 3.12 Post-Deploy Checklist

Centang satu-satu sebelum menyatakan "selesai":

- [ ] `https://klinikgigi.com` — halaman login tampil, gembok hijau
- [ ] `https://klinikgigi.com/api/health` — `{"status":"ok"}`
- [ ] Login admin → **ganti password** via Settings
- [ ] Upload gambar dokter → test Cloudinary (Admin → Dentists → Tambah → Upload foto)
- [ ] Buat appointment → muncul di kalender dokter
- [ ] Isi odontogram → klik gigi, bisa diisi
- [ ] Buat resep → PDF ter-generate
- [ ] Buat invoice → PDF ter-generate
- [ ] Ganti warna/logo klinik → Admin → Settings → refresh halaman publik
- [ ] `pm2 list` — 2 instance, uptime stabil
- [ ] Restart VPS → `pm2 list` auto-start setelah reboot (tunggu 2 menit)
- [ ] `bash scripts/backup-mongo.sh` → backup sukses
- [ ] `sudo certbot renew --dry-run` → auto-renewal SSL siap
- [ ] UptimeRobot aktif → test alert

---

## 4. Demo ke Klien (Script 15 Menit)

### Persiapan Sebelum Demo

- [ ] Semua data seed sudah ada (admin, 3 dokter, services, artikel)
- [ ] Logo & nama klinik sudah diganti di Admin → Settings (supaya klien lihat branding mereka)
- [ ] Beberapa appointment dummy sudah dibuat (supaya kalender tidak kosong)
- [ ] Browser dalam incognito mode (bersih, tidak ada cache/session)
- [ ] HP untuk demo PWA install
- [ ] Midtrans sandbox live (kalau fitur payment di-demo)

### Alur Demo (15 Menit)

#### Menit 0-2: Landing Page
> "Ini website klinik Anda. Lihat — nama klinik, logo, warna bisa diganti semua. Pasien bisa lihat layanan, dokter, dan booking langsung dari HP."

- Buka landing page
- Scroll: services, doctors, testimonials
- Tunjukkan mobile responsive (resize browser atau buka di HP)

#### Menit 2-5: Booking Online (Sudut Pandang Pasien)
> "Sekarang saya jadi pasien baru. Saya mau booking ke dokter gigi."

- Klik "Booking"
- Register sebagai pasien baru
- Pilih dokter → pilih layanan → pilih tanggal & jam
- Submit → "Appointment berhasil dibuat!"

#### Menit 5-10: Dashboard Dokter
> "Sekarang saya login sebagai dokter. Lihat appointment barusan sudah muncul di dashboard."

- Login sebagai dokter (`dentist1@dentalcare.id` / `password123`)
- Dashboard → lihat appointment hari ini
- Buka appointment tadi → isi odontogram (klik gigi, pilih kondisi)
- Tulis resep → preview PDF
- Buat invoice → preview PDF

#### Menit 10-13: Dashboard Admin
> "Ini tampilan admin. Anda bisa lihat semua — laporan, kelola dokter, artikel, ubah setting klinik."

- Login sebagai admin (`admin@dentalcare.id`)
- Dashboard: statistik (appointments, revenue, no-show rate)
- Settings → ganti warna primer → tunjukkan langsung berubah di website publik
- Kelola dokter → tambah/edit
- Articles → tunjukkan fitur blog/artikel

#### Menit 13-15: PWA & Penutup
> "Dan ini yang paling keren — website ini bisa di-install seperti aplikasi di HP. Pasien bisa buka tanpa internet sekalipun."

- Buka `https://klinikgigi.com` di HP
- Chrome menu → "Add to Home Screen" → Install
- Buka dari home screen → terlihat seperti app native

> **Penutup:** "Semua yang saya tunjukkan tadi — booking, odontogram, resep digital, invoice, WhatsApp reminder — semua dalam satu sistem. Tidak ada biaya bulanan vendor SaaS. Data di server Anda sendiri. Saya setup semuanya, Anda tinggal pakai."

### Handling Objection (Quick Reference)

| Objection | Jawaban |
|-----------|---------|
| "Mahal." | Sekali bayar. Bandingkan dengan SaaS subscription bulanan yang setelah 1-2 tahun jauh lebih mahal. ROI: 1 no-show pasien dicegah = potensi Rp 500rb terselamatkan. |
| "Klinik kami kecil, belum butuh." | Justru sistem ini bikin klinik kecil terlihat profesional seperti klinik besar. Booking online = kesan pertama yang lebih baik. |
| "Staff kami gaptek." | Interface dibuat sesimpel mungkin. Saya training 2 sesi sampai lancar. Juga ada video tutorial. |
| "Data pasien sensitif." | Database di server klinik sendiri. Bukan multi-tenant. Sesuai UU PDP. Bisa diaudit kapan saja. |
| "Bagaimana kalau ada bug?" | Garansi 30 hari. Setelah itu ada opsi maintenance bulanan (Rp 750rb/bln) atau support on-demand. |
| "Nanti kalau butuh fitur baru?" | Kode terbuka. Bisa custom development per fitur (Rp 1.5jt/man-day). Tidak ada vendor lock-in. |

---

## 5. Serah Terima & Maintenance

### 5.1 Timeline Maintenance (3 Bulan Standar)

```
┌──────────────────────────────────────────────────────────────┐
│ BULAN 1: STABILISASI                                         │
├──────────────────────────────────────────────────────────────┤
│ Minggu 1-2:                                                  │
│  • Monitoring harian — UptimeRobot + cek log PM2             │
│  • Pastikan backup MongoDB berjalan setiap malam             │
│  • Fix bug yang muncul di production                         │
│  • Training admin klinik (sesi 1 — basic)                    │
│                                                              │
│ Minggu 3-4:                                                  │
│  • Cek usage pattern — ada yang lambat? error?               │
│  • Training admin klinik (sesi 2 — advanced)                 │
│  • Isi data master: services, dentist profiles, articles     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ BULAN 2: OPTIMASI                                            │
├──────────────────────────────────────────────────────────────┤
│  • Fine-tuning berdasarkan feedback klinik                   │
│  • Update env kalau ada layanan baru (Midtrans, WhatsApp)    │
│  • Performance check: load time, image optimization          │
│  • Update dokumentasi internal klinik                        │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ BULAN 3: HANDOVER PREPARATION                                │
├──────────────────────────────────────────────────────────────┤
│  • Training final admin + Q&A                                │
│  • Serahkan dokumen "Panduan Admin Klinik"                   │
│  • Setup kontak darurat + SLA                                │
│  • Opsional: training IT klinik (kalau ada staff IT)         │
│  • Final review: semua fitur jalan, backup ok, SSL ok        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Dokumen Serah Terima untuk Klien

Buat dokumen terpisah (`HANDOVER_[NamaKlinik].pdf`) yang berisi:

#### Halaman 1: Informasi Penting
```
=== DENTALCARE — Informasi Akses ===
Klinik: [Nama Klinik]
Website: https://klinikgigi.com
Admin Panel: https://klinikgigi.com/admin/login

Login Admin:
  Email: [email admin]  ← GANTI DARI DEFAULT!
  Password: [password]  ← Simpan di tempat aman

Login Dokter:
  Email: [email dokter]
  Password: [password]

Domain: klinikgigi.com
Registrar/DNS: [Cloudflare / Niagahoster / dll]
Tanggal expired domain: [DD/MM/YYYY]
```

#### Halaman 2: Operasional Harian
```
Tugas harian admin klinik:

1. Cek Appointment Hari Ini
   → Login admin → Appointments → filter hari ini
   → Konfirmasi kehadiran pasien satu per satu

2. Lihat Laporan
   → Admin Dashboard → statistik otomatis
   → Export CSV untuk laporan bulanan

3. Tambah Pasien Baru (kalau booking via telepon/offline)
   → Admin → Patients → Tambah → isi form → Simpan

4. Cek Invoice
   → Lihat status pembayaran, update kalau ada transfer manual
```

#### Halaman 3: Maintenance Rutin
```
Bulanan:
  • Cek SSL expiry: buka https://klinikgigi.com → gembok masih hijau?
    (auto-renewal, tapi cek saja)

Per 3 Bulan:
  • Update aplikasi:
    Hubungi kami untuk update terbaru (bug fix, fitur baru)

Tahunan:
  • Perpanjang domain (jangan sampai expired!)
  • Perpanjang Tencent Cloud VPS (kalau pakai paket tahunan)
  • Cek kapasitas disk (`df -h` via SSH — target <80%)
```

#### Halaman 4: Kontak Darurat
```
=== Dukungan Teknis ===

Nama: [Nama Kamu]
WhatsApp: 08xx-xxxx-xxxx
Email: kamu@email.com

Jam operasional support: Senin-Jumat, 09:00-17:00 WIB

Prioritas:
  🔴 KRITIS (website down/tidak bisa diakses): Response <2 jam
  🟡 SEDANG (fitur error tapi masih bisa dipakai): Response <8 jam
  🟢 RINGAN (request training/fitur baru): Response <24 jam

Untuk masalah di luar jam operasional:
  → WhatsApp dengan prefix [URGENT]
```

### 5.3 Setelah Maintenance Selesai — Pilihan Klien

Saat kontrak maintenance 3 bulan berakhir, tawarkan opsi ini:

#### Opsi A: Managed Hosting — Rp 750.000/bulan (Recommended)
> "Saya urus semua teknis. Bapak/Ibu tinggal pakai aplikasinya saja."

Kamu handle:
- ✅ Monitoring server 24/7
- ✅ Backup harian + restore kalau diperlukan
- ✅ Update aplikasi rutin
- ✅ Renewal SSL otomatis
- ✅ Support teknis prioritas (response <4 jam)
- ✅ 1× minor change per bulan (ganti teks, tambah service)

Klinik handle:
- Operasional harian (input data, appointment, dll)

#### Opsi B: Support On-Demand — Rp 1.500.000/man-day
> "Kalau ada masalah atau butuh fitur baru, panggil saya."

- Tidak ada biaya bulanan
- Setiap ada masalah / request fitur → charge per hari kerja
- Minimum 1 man-day per request
- Tidak termasuk monitoring (klinik sadar sendiri kalau ada masalah)

#### Opsi C: Full Handover
> "Saya serahkan semua akses, klinik urus sendiri."

Kamu serahkan:
- Semua credential (VPS, MongoDB, Cloudinary, domain)
- Dokumentasi teknis lengkap
- 1× training final (2 jam)

Setelah handover:
- Tidak ada kewajiban support
- Kalau klinik minta tolong → masuk Opsi B (support on-demand)

### 5.4 Strategi Upsell

Selama maintenance 3 bulan, identifikasi peluang upsell:

| Trigger | Upsell |
|---------|--------|
| Klinik puas, traffic appointment meningkat | Tawarkan upgrade Pro (WhatsApp reminder, payment gateway) |
| Admin kewalahan input data | Tawarkan migrasi data dari Excel lama |
| Klinik minta fitur spesifik | Tawarkan custom development per man-day |
| Dokter minta tampilan beda | Tawarkan refresh design |
| Klinik buka cabang baru | Tawarkan paket Enterprise (multi-cabang) |

---

## 6. Troubleshooting Cepat

### Masalah Deploy

| Gejala | Penyebab Umum | Solusi |
|--------|---------------|--------|
| `git clone` gagal | Repo private, SSH key tidak terdaftar | Generate deploy key di GitHub → tambahkan ke repo |
| `npm ci` gagal (bcrypt error) | Build tools tidak terinstall | `sudo apt install build-essential python3 -y` lalu ulangi |
| `npm run build` gagal | Variabel VITE_ kosong/tidak ada `client/.env` | Pastikan `client/.env` ada dan terisi `VITE_API_URL` |
| PM2 start tapi `curl` gagal | Port 5000 tidak listen | Cek `pm2 logs dentalcare-api`, cek error di log |
| `/api/health` → `"degraded"` | MongoDB tidak konek | Cek MONGO_URI, cek Network Access di Atlas (IP VPS harus di-allow) |
| Nginx error 502 Bad Gateway | PM2 mati | `pm2 list`, `pm2 restart all`, cek log |

### Masalah Akses

| Gejala | Penyebab Umum | Solusi |
|--------|---------------|--------|
| Tidak bisa SSH ke VPS | Security Group port 22 source salah | Cek IP publik kamu di whatismyip.com, update source di Security Group |
| Website tidak bisa dibuka | (a) Nginx mati, (b) DNS belum propagasi, (c) Security Group port 80/443 tidak allow | `sudo systemctl status nginx`, cek `nslookup domain`, cek Security Group inbound rules |
| Gembok tidak hijau / SSL error | Sertifikat expired atau tidak terpasang | `sudo certbot renew --dry-run`, kalau gagal: `sudo certbot --nginx` ulangi |
| CORS error di console browser | `CLIENT_URL` di `server/.env` tidak cocok | Pastikan `CLIENT_URL` persis sama dengan origin browser (termasuk `https://`) |
| Upload gambar gagal | Cloudinary env kosong / fallback ke local disk | Cek `CLOUDINARY_*` di `server/.env`. Cek log PM2 untuk error detail. |
| Rate limit 429 (Too Many Requests) | Normal — auth limit 10 request/15 menit | Tunggu 15 menit. Atau naikkan limit di `server/server.js` (tidak direkomendasikan) |

### Masalah Maintenance

| Gejala | Penyebab Umum | Solusi |
|--------|---------------|--------|
| Backup MongoDB gagal | `mongodump` tidak terinstall / auth failed | Cek `mongodump --version`, cek MONGO_URI valid |
| Disk VPS penuh | Log menumpuk / backup lama tidak dihapus | `sudo journalctl --vacuum-size=100M`, hapus backup >30 hari |
| PM2 tidak auto-start setelah reboot | `pm2 startup` belum dijalankan / command salah | Jalankan ulang `pm2 startup systemd`, copy command yang muncul |
| SSL expired | Certbot auto-renewal gagal | `sudo certbot renew --dry-run` untuk cek. `sudo certbot renew --force-renewal` untuk renew manual |
| Aplikasi lambat | VPS kehabisan resource | `htop` cek CPU/RAM, `pm2 monit` cek memory PM2. Kalau >400MB per instance, naikkan `max_memory_restart` di ecosystem.config.js |

---

## Lampiran: Quick Reference Commands

```bash
# ===== LOGIN =====
ssh -i ~/.ssh/dentalcare_cvm deploy@<ELASTIC_IP>

# ===== CEK STATUS =====
pm2 list                         # Status aplikasi
pm2 logs dentalcare-api --lines 50  # Log terbaru
sudo systemctl status nginx      # Status Nginx
df -h                            # Disk usage
htop                             # CPU/RAM usage

# ===== RESTART =====
pm2 reload all                   # Reload tanpa downtime
sudo systemctl reload nginx      # Reload Nginx config
sudo systemctl restart nginx     # Restart total (ada downtime)

# ===== DEPLOY UPDATE =====
cd /opt/dentalcare
git pull
bash deploy/deploy.sh

# ===== BACKUP MANUAL =====
cd /opt/dentalcare
bash scripts/backup-mongo.sh

# ===== SSL =====
sudo certbot renew --dry-run     # Test auto-renewal
sudo certbot renew --force-renewal  # Force renew sekarang
sudo certbot certificates        # Lihat semua sertifikat

# ===== LOG =====
sudo tail -f /var/log/nginx/access.log   # Nginx access log
sudo tail -f /var/log/nginx/error.log    # Nginx error log
pm2 logs dentalcare-api                 # PM2 real-time log
sudo journalctl -u nginx -f             # System nginx log
```

---

> **Dokumen ini adalah panduan utama kamu.** Setiap kali onboarding klien baru, ikuti dari Section 2 sampai Section 3.12 secara berurutan. Setelah deploy sukses, pakai Section 4 untuk demo, dan Section 5 untuk strategi maintenance & serah terima.
>
> File teknis referensi: `DEPLOYMENT.md` (3 jalur deploy), `docs/vps-setup-guide.md` (detail teknis VPS).
>
> File bisnis referensi: `marketing/SALES.md` (sales playbook), `marketing/PRICING.md` (harga).
