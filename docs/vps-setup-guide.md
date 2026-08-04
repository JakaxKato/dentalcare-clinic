# DentalCare — Setup Tencent Cloud VPS

Panduan langkah-demi-langkah untuk deploy DentalCare di Tencent Cloud Singapore.
Spek: Ubuntu 22.04, 2CPU/2GB RAM/30GB SSD.

> **Peran VPS (Path C):** VPS menjalankan **aplikasi** saja — Nginx (serve frontend SPA) + Express/PM2 (backend API). **Database = MongoDB Atlas (managed, Singapore)**, BUKAN MongoDB self-hosted di VPS. Alasan: VPS 2GB tidak cukup untuk Node + nginx + MongoDB bare-metal (OOM risk), dan self-host MongoDB = kamu yang jaga backup, auth, bind IP port 27017 (risiko ransomware exposed tinggi). Atlas free tier aman, auto-backup, network access di-whitelist ke IP VPS saja. Frontend (Vercel) & backend (Render) **tidak dipakai** — Path B (PaaS) punya cold-start & biaya recurring, sementara VPS Path C full kontrol tanpa cold start.

---

## ⚠️ Langkah 0 — Amankan akses SSH

Gunakan Tailscale agar IP laptop yang berubah tidak memaksa Anda mengubah Security Group setiap hari. Selama setup, **jangan tutup sesi SSH lama** sampai koneksi melalui Tailscale berhasil.

### 0.1 Pertahankan akses darurat sementara

Untuk sementara, batasi TCP:22 ke IP publik laptop saat ini:

```bash
curl ifconfig.me
```

Di Tencent Cloud → Security Group, gunakan hasilnya sebagai `<IP-LAPTOP>/32`. Hapus rule `::/0 → TCP:22` dan jangan gunakan `0.0.0.0/0 → TCP:22`.

### 0.2 Install Tailscale di Ubuntu VPS

Jalankan dari sesi SSH VPS yang masih aktif:

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

Aktifkan koneksi Tailscale:

```bash
sudo tailscale up
```

Terminal akan menampilkan URL login. Buka URL tersebut, login ke akun Tailscale, lalu izinkan perangkat VPS.

Lihat alamat privat Tailscale VPS:

```bash
tailscale ip -4
```

Catat alamat `100.x.y.z` yang ditampilkan sebagai `<TAILSCALE-VPS-IP>`.

### 0.3 Install Tailscale di laptop

Install Tailscale dari aplikasi resmi sesuai sistem operasi laptop, login menggunakan akun Tailscale yang sama, lalu pastikan VPS terlihat sebagai perangkat online di dashboard Tailscale.

Tes koneksi dari laptop:

```bash
ping <TAILSCALE-VPS-IP>
```

Jika ping diblokir oleh konfigurasi, lanjutkan dengan tes SSH.

### 0.4 Tes SSH melalui Tailscale

Buka terminal baru di laptop, jangan memakai sesi lama, lalu jalankan:

```bash
ssh deploy@<TAILSCALE-VPS-IP>
```

Jika memakai private key tertentu:

```bash
ssh -i ~/.ssh/dentalcare-vps deploy@<TAILSCALE-VPS-IP>
```

Pastikan login berhasil dan username tetap `deploy`.

### 0.5 Pindahkan SSH ke Tailscale secara bertahap

Setelah SSH melalui alamat Tailscale berhasil:

1. Di Tencent Security Group, hapus `::/0 → TCP:22` jika belum dihapus.
2. Hapus rule `<IP-LAPTOP>/32 → TCP:22` hanya setelah yakin tidak membutuhkan akses darurat publik.
3. Pastikan port 22 tidak dibuka ke `0.0.0.0/0`.
4. Di Ubuntu, biarkan SSH berjalan normal pada port 22; koneksi melalui interface Tailscale tetap menggunakan port tersebut.
5. Simpan sesi SSH lama sampai seluruh tes selesai.

Jika ingin memakai Tailscale SSH sebagai pengganti OpenSSH, fitur tersebut dapat diaktifkan dengan `sudo tailscale up --ssh`, tetapi saya menyarankan tetap memakai OpenSSH + SSH key terlebih dahulu karena lebih mudah di-debug.

> **Rollback:** jika Tailscale bermasalah, gunakan sesi SSH lama atau kembalikan rule `<IP-LAPTOP>/32 → TCP:22` sementara dari Tencent Console. Jangan menghapus akses darurat sebelum koneksi baru terverifikasi.

> Dokumentasi resmi: https://tailscale.com/download/linux

---

## Arsitektur Target

```
Internet → Tencent Security Group (:80, :443)
Laptop admin → Tailscale private network → VPS SSH (:22)
              │
         ┌────▼────┐
         │  Nginx   │  :80/:443
         │ (system) │
         └─┬────┬───┘
           │    │
   /api/   │    │  static SPA
   /uploads│    │  /var/www/dentalcare/client/dist/
           │    │
    ┌──────▼──┐ │
    │ Express  │ │
    │ PM2 x2   │ │
    │ :5000    │ │   (127.0.0.1 only — TIDAK dipublikasikan)
    └────┬─────┘ │
         │       │
    ┌────▼───┐   │
    │ MongoDB │   │
    │ Atlas M0│   │   (managed — port 27017 TIDAK ada di VPS/Security Group)
    │ (SG)    │   │
    └────────┘   │
         ┌──────▼──┐
         │ Cloudinary│
         └──────────┘
```

**Port yang boleh terbuka ke publik:**
- `80/443` → website dan HTTPS

**Port yang TIDAK boleh terbuka ke publik:**
- `22` → akses melalui interface Tailscale (`tailscale0`), bukan internet umum
- `27017` (MongoDB) → tidak ada, DB di Atlas
- `5000` (Express) → tidak ada, hanya nginx proxy ke `127.0.0.1:5000` secara lokal
---

## Prasyarat

Sebelum mulai, siapkan:

1. **Domain** — sudah punya, untuk SSL via Let's Encrypt
2. **Akun MongoDB Atlas** — [cloud.mongodb.com](https://cloud.mongodb.com), free tier M0
3. **Akun Cloudinary** — [cloudinary.com](https://cloudinary.com), free tier
4. **Akun Midtrans** (opsional) — sandbox mode untuk testing pembayaran
5. **SSH key pair** — generate di lokal: `ssh-keygen -t ed25519 -C "dentalcare-vps"`
6. **VPS Tencent Cloud** — 2CPU/2GB/30GB, Ubuntu 22.04, Singapore

---

## Section 1 — Provisioning VPS Tencent Cloud

### 1.1 Buat CVM Instance

1. Buka **Tencent Cloud Console** → **Cloud Virtual Machine (CVM)**
2. **Create Instance**
   - **Billing**: Pay-as-you-go (atau package bulanan)
   - **Region**: Singapore
   - **Image**: Ubuntu 22.04 LTS (64-bit)
   - **Instance Type**: 2 Core, 2GB Memory (General)
   - **System Disk**: 30GB SSD Cloud Disk
   - **Traffic**: 1TB/bulan

### 1.2 SSH Key

- Pilih **SSH Key** saat provisioning
- **Import existing key** → paste public key kamu (`cat ~/.ssh/id_ed25519.pub`)
- Atau **Create new** lalu download private key-nya

### 1.3 Security Group (WAJIB — Tencent Cloud Firewall)

> **PENTING**: Security Group di Tencent Cloud itu firewall di level hypervisor. Nanti di dalam VPS ada UFW juga. **Dua-duanya harus allow port yang sama.** Jika kamu sudah membuka port 22 ke `0.0.0.0/0` saat create instance (default banyak template), **wajib dipersempit sekarang juga** — lihat **Langkah 0** di atas.

Buka **Cloud Firewall** → **Security Group** → buat/edit rule.

**Mode transisi, sebelum Tailscale teruji:**

| Direction | Protocol | Port | Source | Description |
|-----------|----------|------|--------|-------------|
| Inbound | TCP | 22 | `<IP-LAPTOP>/32` | SSH sementara; hapus setelah Tailscale berhasil |
| Inbound | TCP | 80 | `0.0.0.0/0` | HTTP (redirect ke HTTPS) |
| Inbound | TCP | 443 | `0.0.0.0/0` | HTTPS — satu-satunya port publik aplikasi |
| Outbound | ALL | ALL | `0.0.0.0/0` | Untuk Atlas, npm, certbot, API eksternal |

**Mode final setelah Tailscale teruji:** hapus semua rule inbound TCP:22 dari internet, termasuk `0.0.0.0/0`, `::/0`, dan `<IP-LAPTOP>/32`. Akses SSH tetap berjalan melalui interface Tailscale dan rule UFW `tailscale0`.

**Jangan tambahkan** port `27017` (MongoDB) atau `5000` (Express) — DB di Atlas, Express hanya diakses nginx secara lokal di `127.0.0.1:5000`.

### 1.4 Elastic IP (Opsional tapi recommended)

- **Elastic IP** → **Create** → bind ke instance CVM kamu
- Ini mencegah IP berubah kalau instance di-restart

### 1.5 Login Pertama

```bash
# Bootstrap awal melalui EIP/public IP saat rule transisi masih aktif.
ssh ubuntu@<EIP-ATAU-PUBLIC-IP>
# atau
ssh -i ~/.ssh/id_ed25519 ubuntu@<EIP-ATAU-PUBLIC-IP>

# Setelah Tailscale aktif, gunakan alamat Tailscale.
ssh -i ~/.ssh/id_ed25519 deploy@<TAILSCALE-VPS-IP>
```

---

## Section 2 — Hardening Server

### 2.1 Update system

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Buat user deploy

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy

# Copy SSH key ke user deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp /home/ubuntu/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

### 2.3 Hardening SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Pastikan baris ini (uncomment/ubah):
```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd
```

> **Test**: buka terminal baru, pastikan masih bisa login melalui `ssh deploy@<TAILSCALE-VPS-IP>`. Jangan tutup terminal yang sekarang sebelum yakin!

### 2.4 UFW Firewall (Inner ring)

```bash
# Izinkan SSH hanya melalui interface Tailscale.
sudo ufw allow in on tailscale0 to any port 22 proto tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Selama migrasi, jangan hapus akses SSH publik sebelum SSH melalui Tailscale berhasil. Setelah berhasil dan rule Security Group `<IP-LAPTOP>/32 → TCP:22` sudah dihapus, pastikan UFW tidak lagi memiliki rule `22/tcp` umum; yang tersisa hanya rule melalui `tailscale0`.

### 2.5 Fail2ban + Auto update

```bash
sudo apt install fail2ban unattended-upgrades -y
sudo systemctl enable --now fail2ban
sudo dpkg-reconfigure --priority=low unattended-upgrades  # pilih Yes
```

### 2.6 Timezone

```bash
sudo timedatectl set-timezone Asia/Jakarta
timedatectl
```

---

## Section 3 — Install Dependencies

### 3.1 Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y
node -v   # pastikan v20.x
npm -v
```

### 3.2 Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable --now nginx
```

Test: buka `http://<VPS_IP>` di browser → muncul "Welcome to nginx"

### 3.3 PM2

```bash
sudo npm install -g pm2
pm2 -v
```

### 3.4 MongoDB Database Tools (untuk backup)

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install mongodb-database-tools -y
mongodump --version
```

### 3.5 Certbot (untuk SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 3.6 Build tools (untuk bcrypt native compile)

```bash
sudo apt install build-essential git -y
```

---

## Section 4 — MongoDB Atlas Setup

### 4.1 Buat Cluster

1. Login ke [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Create** → **M0 FREE** (atau yang tersedia gratis)
3. **Provider**: AWS/GCP/Azure (pilih yang ada region Singapore)
4. **Region**: Singapore (`ap-southeast-1`)
5. **Cluster Name**: `dentalcare-prod`
6. Klik **Create Cluster**

### 4.2 Database User

1. **Database Access** → **Add New Database User**
2. Authentication: **Password**
3. Username: `dentalcare`
4. Password: generate kuat (minimal 16 karakter, campur huruf/angka/symbol)
5. **Built-in Role**: `Read and write to any database`
6. Simpan password di password manager!

### 4.3 Network Access

1. **Network Access** → **Add IP Address**
2. Masukkan **hanya IP Elastic IP VPS Tencent kamu** (`<VPS_IP>/32`)
3. **Jangan pakai `0.0.0.0/0` di production** — itu expose DB ke seluruh internet. Jika butuh akses sementara dari laptop untuk debug, tambahkan IP laptop kamu sebagai entry terpisah, lalu hapus setelah selesai.

### 4.4 Connection String

1. **Database** → **Connect** → **Drivers**
2. Copy connection string, ganti `<username>` dan `<password>`
3. Format: `mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority`
4. Simpan, ini untuk `MONGO_URI` di `.env` nanti

### 4.5 Test koneksi dari VPS

```bash
# Install mongosh
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install mongodb-mongosh -y

mongosh "mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority"
# Harusnya konek dan masuk ke shell MongoDB
# Exit: Ctrl+D
```

---

## Section 5 — Cloudinary Setup

1. Daftar/login ke [cloudinary.com](https://cloudinary.com)
2. Dashboard → **Account Details**
3. Catat 3 nilai ini:
   - **Cloud name**
   - **API Key**
   - **API Secret**
4. Ini untuk `CLOUDINARY_*` di `.env` nanti

---

## Section 6 — Clone & Konfigurasi Aplikasi

### 6.1 Clone repo

```bash
cd /opt
sudo git clone <REPO_URL> dentalcare
sudo chown -R deploy:deploy /opt/dentalcare
cd /opt/dentalcare
```

> **PENTING**: Ganti `<REPO_URL>` dengan URL repo Git kamu (GitHub/GitLab). Pastikan VPS bisa akses (public repo atau deploy key).

### 6.2 Buat .env server

```bash
cp server/.env.production.example server/.env
nano server/.env
```

Isi dengan nilai asli:

```env
NODE_ENV=production
PORT=5000
TRUST_PROXY=1

# ---- Database ----
MONGO_URI=mongodb+srv://dentalcare:<PASSWORD>@cluster0.xxxxx.mongodb.net/dentalcare?retryWrites=true&w=majority

# ---- Auth ----
# Generate: openssl rand -base64 48
JWT_SECRET=<GENERATE_SENDIRI_32_CHAR_MINIMAL>
JWT_EXPIRES_IN=7d

# ---- CORS ----
CLIENT_URL=https://<DOMAIN_KAMU>

# ---- Cloudinary ----
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>
CLOUDINARY_FOLDER=dentalcare

# ---- SMTP (skip dulu) ----
# Biarkan kosong — reset password akan log di console PM2

# ---- Clinic info ----
CLINIC_NAME=Nama Klinik Gigi
CLINIC_ADDRESS=Jl. Alamat Lengkap, Kota
CLINIC_PHONE_DISPLAY=0812-xxxx-xxxx

# ---- Midtrans (skip dulu — sandbox bisa diaktifkan nanti) ----
# Kosongkan MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY
```

### 6.3 Generate JWT_SECRET

```bash
openssl rand -base64 48
# Copy output-nya, paste ke server/.env sebagai JWT_SECRET
```

### 6.4 Buat .env client

```bash
cp client/.env.production.example client/.env
nano client/.env
```

Isi:

```env
VITE_API_URL=https://<DOMAIN_KAMU>/api
# Midtrans di-skip dulu — UI payment tidak muncul
```

> Untuk IP-only (testing): `VITE_API_URL=http://<VPS_IP>/api`

---

## Section 7 — Deploy Aplikasi

### 7.1 Buat direktori nginx & log

```bash
sudo mkdir -p /var/www/dentalcare/client
sudo mkdir -p /var/log/dentalcare
sudo chown deploy:deploy /var/log/dentalcare
```

### 7.2 Jalankan deploy script

```bash
cd /opt/dentalcare
chmod +x deploy/deploy.sh
bash deploy/deploy.sh
```

Script ini akan:
- Install server dependencies (production only)
- Install & build client
- Copy `client/dist/` ke `/var/www/dentalcare/client/dist/`
- Start/reload PM2 dengan 2 instance

### 7.3 PM2 startup (auto-start saat reboot)

```bash
pm2 save
pm2 startup systemd
# Copy & jalankan command yang muncul dari output pm2 startup
```

### 7.4 Verifikasi

```bash
# Cek PM2
pm2 list
# Harusnya: dentalcare-api | 2 instances | online

# Cek API health
curl http://127.0.0.1:5000/api/health
# Harusnya: {"success":true,"status":"ok","uptime":...,"database":"connected"}

# Cek log
pm2 logs dentalcare-api --lines 20
```

### 7.5 Bootstrap admin production

Jangan jalankan seed pada production karena seed bersifat destructive. Buat admin melalui prosedur bootstrap non-destructive dengan password unik dari password manager. Seed hanya boleh digunakan pada instance demo dengan database demo terpisah.

---

## Section 8 — Nginx + SSL

### 8.1 Pasang Nginx config

```bash
sudo cp /opt/dentalcare/deploy/nginx-dentalcare.conf /etc/nginx/sites-available/dentalcare
sudo ln -s /etc/nginx/sites-available/dentalcare /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t
# Harusnya: syntax is ok, test is successful

sudo systemctl reload nginx
```

### 8.2 DNS Setup

Di DNS provider kamu (Cloudflare/Niagahoster/dll):

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` (atau subdomain) | `<VPS_IP>` | Auto/600 |

Tunggu propagasi (±5-30 menit). Cek:

```bash
nslookup <DOMAIN_KAMU>
# Harusnya resolve ke IP VPS
```

### 8.3 Test HTTP dulu

Buka `http://<DOMAIN_KAMU>` — harusnya tampil halaman login DentalCare.

### 8.4 SSL dengan Certbot

```bash
sudo certbot --nginx -d <DOMAIN_KAMU>
# Ikuti prompt:
# - Enter email
# - Agree to terms
# - No (don't share email)
```

Certbot otomatis:
- Issue certificate dari Let's Encrypt
- Modifikasi nginx config (tambah listen 443, ssl_certificate, redirect HTTP→HTTPS)
- Set auto-renewal timer

### 8.5 Aktifkan HSTS

```bash
sudo nano /etc/nginx/sites-available/dentalcare
```

Cari baris ini, uncomment:
```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 8.6 Update CLIENT_URL

Setelah SSL aktif, pastikan `CLIENT_URL` di `server/.env` pakai `https://`:

```env
CLIENT_URL=https://<DOMAIN_KAMU>
```

```bash
pm2 reload deploy/ecosystem.config.js
```

### 8.7 Verifikasi SSL

Buka `https://<DOMAIN_KAMU>` dan `https://<DOMAIN_KAMU>/api/health` — harusnya HTTPS dengan gembok hijau.

---

## Section 9 — Backup, Monitoring & Maintenance

### 9.1 MongoDB Backup (cron)

```bash
# Test manual dulu
cd /opt/dentalcare
sudo mkdir -p /var/backups/dentalcare
bash scripts/backup-mongo.sh

# Tambah ke crontab
crontab -e
```

Tambah baris:
```
0 2 * * * /opt/dentalcare/scripts/backup-mongo.sh >> /var/log/dentalcare-backup.log 2>&1
```

### 9.2 PM2 Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 9.3 Disk Monitoring

```bash
# Cek disk usage
df -h

# Kalau /var/log mulai penuh
sudo journalctl --vacuum-size=200M
```

Target: jangan sampai pemakaian di atas 80% (24GB dari 30GB).

### 9.4 Update Aplikasi

Setiap kali ada perubahan di repo:

```bash
cd /opt/dentalcare
git pull
bash deploy/deploy.sh
```

Satu perintah. Downtime <5 detik (PM2 reload zero-downtime).

### 9.5 Post-Deploy Checklist

Setelah semua selesai, verifikasi:

**Keamanan (wajib lolos semua):**
- [ ] Security Group port 22 = `<IP-kamu>/32` (bukan `0.0.0.0/0`) — lihat Langkah 0
- [ ] `PasswordAuthentication no` & `PermitRootLogin no` di `/etc/ssh/sshd_config`
- [ ] UFW aktif (22, 80, 443 saja) — `sudo ufw status`
- [ ] Tidak ada port 27017/5000 terbuka ke publik (cek Security Group + UFW)
- [ ] Atlas Network Access hanya IP VPS (`/32`), bukan `0.0.0.0/0`
- [ ] `fail2ban` running — `sudo systemctl status fail2ban`
- [ ] `JWT_SECRET` produksi berbeda dari dev, ≥32 karakter
- [ ] Password admin seed sudah diganti
- [ ] HTTPS aktif + HSTS on, SSL Labs grade A — cek di https://www.ssllabs.com

**Fungsi:**
- [ ] `https://<DOMAIN>` — halaman login tampil
- [ ] `https://<DOMAIN>/api/health` — return `{"status":"ok"}`
- [ ] Login sebagai admin → ganti password
- [ ] Upload foto dokter (test Cloudinary)
- [ ] Buat appointment → muncul di kalender
- [ ] Buat invoice → PDF ter-generate
- [ ] `pm2 list` — 2 instance, uptime stabil
- [ ] Restart VPS → `pm2 list` auto-start setelah reboot
- [ ] Backup script jalan manual: `bash scripts/backup-mongo.sh`
- [ ] `sudo certbot renew --dry-run` — auto-renewal SSL siap

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Nginx error 502 Bad Gateway | PM2 mati. `pm2 list`, cek log: `pm2 logs dentalcare-api` |
| `/api/health` return `degraded` | MongoDB tidak konek. Cek `MONGO_URI`, whitelist IP di Atlas Network Access |
| Gagal upload gambar | Cek `CLOUDINARY_*` di `server/.env`. Cek log PM2: `pm2 logs dentalcare-api --err` |
| CSS/JS tidak ke-load di browser | `Ctrl+Shift+R` (hard refresh). Cek `VITE_API_URL` sudah benar. |
| CORS error di console browser | Pastikan `CLIENT_URL` di `server/.env` persis sama dengan origin browser (termasuk `https://`) |
| Rate limit 429 | Normal untuk `/api/auth/login` setelah 10 attempt/15 menit. Tunggu atau turunkan rate limit di nginx config |
| Certbot gagal | Pastikan port 80 terbuka di Tencent Security Group dan UFW. DNS sudah pointing ke VPS. |
| `npm ci` gagal (bcrypt) | `sudo apt install build-essential python3` |
| Disk penuh | `sudo journalctl --vacuum-size=100M`, hapus backup lama, cek `du -sh /var/*` |
