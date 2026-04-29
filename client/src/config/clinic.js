// Central clinic branding config.
// Values can be overridden via Vite env vars (see client/.env.example).
// For a different clinic deployment, update env vars — no code changes required for the core identity fields.
export const CLINIC = {
  name: import.meta.env.VITE_CLINIC_NAME || 'Smile Dental Studio',
  shortName: import.meta.env.VITE_CLINIC_SHORT_NAME || 'Smile Dental',
  tagline: 'Klinik Gigi Modern Keluarga',
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '628995242631',
  phoneDisplay: import.meta.env.VITE_CLINIC_PHONE || '0899-5242-631',
  email: import.meta.env.VITE_CLINIC_EMAIL || 'info@smiledentalstudio.id',
  address: {
    primary: {
      label: 'Cabang Bojongsoang',
      line: 'Jl. Raya Bojongsoang No.79, Bojongsoang, Kab. Bandung 40278',
    },
    secondary: {
      label: 'Cabang Antapani',
      line: 'Jl. Purwakarta No.37b, Antapani Tengah, Kota Bandung 40291',
    },
  },
  hours: {
    summary: 'Senin – Minggu: 09.00 – 20.00',
    lines: [
      'Senin – Minggu: 09.00 – 20.00',
      'Buka setiap hari',
      'Hari Libur Nasional: Konfirmasi dahulu via WhatsApp',
    ],
  },
  mapEmbedSrc:
    'https://www.google.com/maps?q=Praktek+Dokter+Gigi+Smile+Dental+Studio+Bojongsoang&output=embed',
  stats: {
    years: '10+',
    patients: '5K+',
    rating: '5.0★',
  },
};

export default CLINIC;
