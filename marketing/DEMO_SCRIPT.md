# DentalCare — Demo Script (15 menit)

Pakai script ini saat demo ke calon klien klinik gigi. Sediakan instance demo (`demo.dentalcare.id` atau localhost share via ngrok) sebelumnya.

## Persiapan (sebelum call)

- [ ] Seed data sudah jalan (`npm run seed`)
- [ ] Akun login siap:
  - Admin: `admin@dentalcare.id` / `admin123`
  - Dokter: `dentist1@dentalcare.id` / `dentist123`
  - Pasien: `patient@dentalcare.id` / `patient123`
- [ ] Browser jendela 1: tampilan publik (Home)
- [ ] Browser jendela 2 (incognito): siap login sebagai role berbeda
- [ ] HP siap (PWA install demo)

## Script

### Menit 0-2 — Pembukaan
> "Pak/Bu [nama], saya akan tunjukkan DentalCare dari sudut pandang 3 pengguna: pasien, dokter, dan admin klinik. Saya highlight 3 hal: kemudahan booking, lengkapnya rekam medis, dan otomasi reminder. Kalau ada pertanyaan, langsung interupsi ya."

### Menit 2-5 — Sebagai Pasien
1. Buka Home → tunjukkan branding "Smile Dental Studio" (atau brand demo).
   > "Ini sudah white-label. Nanti logo, warna, dan nama klinik bisa diganti ibu sendiri lewat halaman Settings."
2. Klik **"Buat Appointment"** → register cepat (skip login).
3. Pilih dokter → pilih layanan → pilih tanggal → simpan.
4. Login pasien → **Dashboard** → tunjukkan upcoming appointment.
5. Buka **Resep saya** & **Invoice saya** → tunjukkan ada riwayat & download PDF.

### Menit 5-9 — Sebagai Dokter
1. Login dokter di jendela incognito.
2. Buka **Appointments** → klik salah satu pasien → masuk **Treatment**.
3. Tab **Odontogram** → klik 1-2 gigi → ubah status (mis. karies) → simpan.
   > "Ini odontogram FDI 32 gigi. Dokter klik gigi, tandai kondisi, simpan otomatis."
4. Tab **Resep** → tambah 2 obat (dosis, frekuensi) → preview Print → tunjukkan PDF.
5. Tab **Invoice** → tambah item layanan + harga → generate invoice → unduh PDF.

### Menit 9-12 — Sebagai Admin
1. Login admin.
2. **Dashboard** → tunjukkan widget statistik (revenue, no-show rate, top dentist).
3. **Settings** → ganti warna primer (mis. ungu) → simpan → refresh tab pasien → warna ikut berubah.
   > "Ini real-time. Branding seluruh aplikasi update tanpa redeploy."
4. **Appointments** → demo export CSV.
5. Buka tab terminal → tampilkan log reminder cron:
   > "Jam 9 pagi tiap hari, sistem broadcast WhatsApp ke semua pasien yang appointment besok. Pakai Fonnte. Bisa dimatikan via env var kalau klinik belum mau aktif."

### Menit 12-14 — PWA & Closing
1. HP → buka app → **Add to Home Screen**.
2. Buka dari home → tunjukkan splash, lalu offline shell saat airplane mode.
3. Tutup:
   > "Yang baru ibu lihat itu fitur paket **Pro** (Rp 9,9 juta one-time). Termasuk setup di server klinik, training admin, dan support 6 bulan. Kalau cocok, kita lanjut PKS minggu ini, setup 1 minggu, klinik bisa pakai akhir bulan."

### Menit 14-15 — Q&A
Common questions sudah ada di [[SALES]].

## Setelah call
- Kirim recording (jika diizinkan).
- Kirim PDF [[PRICING]] + link ke instance demo.
- Schedule follow-up 3 hari kemudian.
