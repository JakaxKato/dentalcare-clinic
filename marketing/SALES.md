# DentalCare — Sales Playbook

Dokumen ini buat **kamu** (reseller / sales). Bukan untuk end-user klinik.

## 1. Posisi Produk (1 kalimat)

> Sistem manajemen klinik gigi siap pakai — booking online, odontogram, resep, invoice, WhatsApp reminder, PWA — dipasang di klinik Anda dalam 1 hari, tanpa biaya bulanan vendor besar.

## 2. Pain Point Target Customer

Klinik gigi independen (1-5 dokter) di Indonesia biasanya:
- Masih pakai buku/Excel untuk appointment → sering double-booking & no-show tinggi.
- Belum punya situs sendiri (atau cuma 1 halaman statis).
- Reminder pasien manual via WA admin → telat / kelewat.
- Rekam medis kertas → susah dicari, hilang saat pindah dokter.
- Pembayaran cash/transfer manual → invoice tulis tangan.

DentalCare langsung menyelesaikan lima pain point di atas dalam satu instalasi.

## 3. Diferensiasi vs Kompetitor

| Aspek | DentalCare | Kompetitor SaaS umum (Klinik Pintar, dll) |
|---|---|---|
| Model bayar | **One-time** + maintenance opsional | Subscription bulanan terus |
| Hosting | Klinik bisa pilih (VPS sendiri / kami host) | Vendor lock-in |
| Customisasi | Open code, white-label penuh | Branding terkunci |
| Data | Milik klinik 100%, MongoDB sendiri | Numpang server vendor |
| Bahasa | Indonesia native | Sebagian campur EN |
| Fitur dental-specific | Odontogram FDI 32 gigi built-in | Sering modul tambahan |

## 4. Cara Demo (15 menit)

1. **Buka landing klinik** (Home) — tunjukkan branding bisa ganti (logo, warna).
2. **Booking online** — register sebagai pasien, pilih dokter & layanan, buat appointment.
3. **Login dokter** — kelola pasien, isi odontogram (klik gigi), tulis resep.
4. **Cetak resep PDF + invoice PDF**.
5. **Login admin** → Settings → ganti nama klinik & warna primer di depan customer.
6. **WhatsApp reminder preview** (cron 09:00 H-1) — tunjukkan log console / pesan asli.
7. **PWA install** — Add to Home Screen di HP, buka offline shell.

## 5. Handling Objection

| Objection | Counter |
|---|---|
| "Mahal." | Bayar sekali, hemat dibanding subscription tahunan SaaS lain. Hitung ROI: 1 no-show pasien = Rp 500rb hilang. Reminder otomatis kembalikan investasi <3 bulan. |
| "Kami nggak punya tim IT." | Paket **Pro & Enterprise** sudah include setup + 6 bulan maintenance. Klinik tinggal pakai. |
| "Data kami sensitif." | Database MongoDB on-premise atau Atlas di akun klinik sendiri. Tidak ada vendor yang baca. Kompatibel UU PDP. |
| "Bagaimana kalau butuh fitur baru?" | Kode open. Bisa kami kustomisasi (jam kerja), atau tim IT klinik. Bukan vendor lock-in. |
| "Sudah pakai sistem lain." | Kami sediakan migrasi data pasien dari Excel/CSV. (Charge separate.) |

## 6. Closing & Follow-up

- **Trial**: Sediakan demo instance di subdomain `demo.dentalcare.id` selama 7 hari (read-write, reset setiap malam).
- **Quotation**: kirim PDF berdasar [[PRICING]] dengan estimasi setup time.
- **Kontrak**: PKS one-time + SLA support opsional.
- **Onboarding**: lihat [[DEMO_SCRIPT]] untuk script handover ke admin klinik.

Kontak resmi:
- WhatsApp Sales: **0812-XXX-XXXX**
- Email: **sales@dentalcare.id**
