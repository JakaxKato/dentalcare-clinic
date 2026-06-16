# DentalCare — Marketing Folder

Semua materi untuk **menjual** produk DentalCare ke klinik. Bukan untuk end-user klinik.

## Isi

| File | Untuk |
|---|---|
| [SALES.md](SALES.md) | Sales playbook: positioning, diferensiasi, handling objection |
| [PRICING.md](PRICING.md) | Detail paket Basic / Pro / Enterprise + add-on |
| [DEMO_SCRIPT.md](DEMO_SCRIPT.md) | Script demo 15 menit ke prospek |
| [landing/index.html](landing/index.html) | Landing page produk standalone (deploy ke Vercel/GitHub Pages) |

## Cara deploy landing page

### Vercel (paling cepat)
```bash
cd marketing/landing
npx vercel --prod
```
Custom domain: `dentalcare.id` (atau apapun yang kamu beli).

### GitHub Pages
1. Buat repo `dentalcare-landing` baru.
2. Copy isi `marketing/landing/` ke root repo.
3. Settings → Pages → branch main → save.

### Self-host
Tinggal copy `landing/index.html` ke nginx static root. Tidak perlu build step (Tailwind via CDN).

## Catatan

- Ganti nomor WhatsApp & email kontak di `landing/index.html` dengan kontak kamu yang sebenarnya.
- Ganti URL `https://demo.dentalcare.id` dengan instance demo nyata.
- Logo & favicon: tambahkan sendiri di `landing/` lalu link dari `<head>`.
