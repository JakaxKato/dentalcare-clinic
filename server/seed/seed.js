require('dotenv').config();

if (process.env.NODE_ENV === 'production') {
  console.error('\n[seed] Refusing to run in production! This script deletes all data.\n');
  process.exit(1);
}

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const DentistProfile = require('../models/DentistProfile');
const Service = require('../models/Service');
const Article = require('../models/Article');
const Testimonial = require('../models/Testimonial');
const ClinicSettings = require('../models/ClinicSettings');

const services = [
  {
    title: 'Pemeriksaan Umum & Konsultasi',
    description:
      'Pemeriksaan menyeluruh kesehatan gigi dan mulut, termasuk konsultasi dengan dokter gigi profesional kami untuk merencanakan perawatan terbaik.',
    priceRange: { min: 100000, max: 250000 },
    duration: 30,
    image: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800',
  },
  {
    title: 'Pembersihan Karang Gigi (Scaling)',
    description: 'Membersihkan plak dan karang gigi menggunakan ultrasonic scaler untuk gigi yang lebih sehat.',
    priceRange: { min: 300000, max: 600000 },
    duration: 45,
    image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
  },
  {
    title: 'Tambal Gigi Estetik',
    description: 'Penambalan gigi berlubang dengan bahan komposit warna gigi alami sehingga tidak terlihat tambalan.',
    priceRange: { min: 250000, max: 800000 },
    duration: 45,
    image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800',
  },
  {
    title: 'Pemutihan Gigi (Bleaching)',
    description: 'Treatment pemutihan gigi profesional untuk senyum yang lebih cerah dan percaya diri.',
    priceRange: { min: 1500000, max: 3500000 },
    duration: 90,
    image: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=800',
  },
  {
    title: 'Behel / Kawat Gigi',
    description: 'Perawatan ortodonti untuk merapikan susunan gigi menggunakan behel metal, ceramic, atau clear aligner.',
    priceRange: { min: 6000000, max: 25000000 },
    duration: 60,
    image: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800',
  },
  {
    title: 'Cabut Gigi & Bedah Minor',
    description: 'Pencabutan gigi rusak, gigi bungsu, dan bedah minor lainnya dengan teknik minim trauma.',
    priceRange: { min: 200000, max: 1500000 },
    duration: 45,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
  },
];

const dentists = [
  {
    name: 'drg. Sarah Aulia',
    email: 'sarah@dentalcare.id',
    password: 'password123',
    phone: '+62 812-1234-5678',
    avatar: 'https://i.pravatar.cc/300?img=47',
    profile: {
      specialization: 'Konservasi Gigi',
      experienceYears: 8,
      education: 'Universitas Indonesia',
      bio: 'Spesialis konservasi gigi dengan pengalaman 8 tahun dalam tambal estetik dan perawatan saluran akar.',
      availableDays: ['Mon', 'Tue', 'Wed', 'Fri'],
      workingHours: { start: '09:00', end: '17:00' },
      consultationFee: 200000,
    },
  },
  {
    name: 'drg. Budi Santoso, Sp.Ort',
    email: 'budi@dentalcare.id',
    password: 'password123',
    phone: '+62 813-2345-6789',
    avatar: 'https://i.pravatar.cc/300?img=33',
    profile: {
      specialization: 'Ortodonti (Behel)',
      experienceYears: 12,
      education: 'Universitas Gadjah Mada',
      bio: 'Spesialis ortodonti yang menangani ribuan kasus perawatan kawat gigi dan clear aligner.',
      availableDays: ['Tue', 'Wed', 'Thu', 'Sat'],
      workingHours: { start: '10:00', end: '19:00' },
      consultationFee: 350000,
    },
  },
  {
    name: 'drg. Maya Pratiwi',
    email: 'maya@dentalcare.id',
    password: 'password123',
    phone: '+62 814-3456-7890',
    avatar: 'https://i.pravatar.cc/300?img=45',
    profile: {
      specialization: 'Estetika & Pedodonti',
      experienceYears: 6,
      education: 'Universitas Padjadjaran',
      bio: 'Berfokus pada perawatan gigi anak dan estetika senyum dewasa.',
      availableDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
      workingHours: { start: '09:00', end: '16:00' },
      consultationFee: 250000,
    },
  },
];

const testimonials = [
  { patientName: 'Andre W.', rating: 5, message: 'Pelayanan sangat ramah dan dokternya sabar. Tambal gigi anak saya selesai tanpa drama!', isApproved: true },
  { patientName: 'Rina K.', rating: 5, message: 'Klinik bersih, modern, dan jadwal booking online sangat membantu. Recommended!', isApproved: true },
  { patientName: 'Budi P.', rating: 4, message: 'Hasil bleaching memuaskan, gigi terlihat lebih cerah dalam 1 sesi.', isApproved: true },
  { patientName: 'Siti N.', rating: 5, message: 'drg. Sarah menjelaskan setiap tindakan dengan detail. Saya jadi tidak takut lagi ke dokter gigi.', isApproved: true },
];

const articles = (authorId) => [
  {
    title: '5 Cara Menjaga Kesehatan Gigi Sehari-hari',
    content:
      'Menjaga kesehatan gigi tidak harus mahal. Berikut 5 cara sederhana yang bisa dilakukan setiap hari:\n\n1. Sikat gigi minimal 2x sehari dengan pasta gigi berfluoride.\n2. Gunakan benang gigi (dental floss) setiap malam.\n3. Kurangi konsumsi minuman manis dan asam.\n4. Minum air putih yang cukup.\n5. Lakukan kontrol ke dokter gigi setiap 6 bulan.\n\nDengan kebiasaan kecil ini, Anda dapat mencegah berbagai masalah gigi seperti karies, gusi berdarah, dan bau mulut.',
    coverImage: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200',
    tags: ['edukasi', 'kebersihan'],
    published: true,
    authorId,
  },
  {
    title: 'Kapan Anak Perlu Dibawa ke Dokter Gigi Pertama Kali?',
    content:
      'Banyak orang tua bertanya, kapan sebaiknya anak dibawa ke dokter gigi untuk pertama kalinya?\n\nIDAI dan AAPD merekomendasikan kunjungan pertama dilakukan saat gigi pertama tumbuh, atau paling lambat saat anak berusia 1 tahun. Tujuannya adalah:\n\n- Memantau perkembangan gigi dan rahang.\n- Mengedukasi orang tua tentang cara membersihkan gigi anak.\n- Mendeteksi dini risiko karies botol susu (early childhood caries).\n\nKlinik DentalCare menyediakan layanan pedodonti yang ramah anak dengan suasana yang menyenangkan.',
    coverImage: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=1200',
    tags: ['anak', 'pedodonti'],
    published: true,
    authorId,
  },
  {
    title: 'Mitos & Fakta Pemutihan Gigi (Bleaching)',
    content:
      'Pemutihan gigi atau bleaching menjadi tren namun masih banyak mitos beredar.\n\n**Mitos:** Bleaching merusak email gigi.\n**Fakta:** Jika dilakukan oleh dokter gigi profesional dengan konsentrasi yang tepat, bleaching aman.\n\n**Mitos:** Pasta gigi whitening sama dengan bleaching.\n**Fakta:** Pasta gigi whitening hanya membersihkan stain di permukaan, sementara bleaching mengubah warna intrinsik gigi.\n\nKonsultasikan kebutuhan estetika senyum Anda dengan dokter kami.',
    coverImage: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=1200',
    tags: ['estetika', 'bleaching'],
    published: true,
    authorId,
  },
];

const run = async () => {
  await connectDB();

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    DentistProfile.deleteMany({}),
    Service.deleteMany({}),
    Article.deleteMany({}),
    Testimonial.deleteMany({}),
    ClinicSettings.deleteMany({}),
  ]);

  console.log('Creating admin...');
  const admin = await User.create({
    name: 'Admin Klinik',
    email: 'admin@dentalcare.id',
    password: 'password123',
    phone: '+62 811-0000-0001',
    role: 'admin',
  });

  console.log('Creating dentists...');
  for (const d of dentists) {
    const user = await User.create({
      name: d.name,
      email: d.email,
      password: d.password,
      phone: d.phone,
      avatar: d.avatar,
      role: 'dentist',
    });
    await DentistProfile.create({ userId: user._id, ...d.profile });
  }

  console.log('Creating sample patient...');
  await User.create({
    name: 'Pasien Demo',
    email: 'patient@dentalcare.id',
    password: 'password123',
    phone: '+62 812-9999-1111',
    role: 'patient',
  });

  console.log('Creating services...');
  await Service.insertMany(services);

  console.log('Creating articles...');
  for (const a of articles(admin._id)) {
    await Article.create(a);
  }

  console.log('Creating testimonials...');
  await Testimonial.insertMany(testimonials);

  console.log('Creating clinic settings...');
  await ClinicSettings.getOrCreate();

  console.log('\nSeed complete!');
  console.log('Login credentials:');
  console.log('  admin@dentalcare.id    / password123');
  console.log('  sarah@dentalcare.id    / password123 (dentist)');
  console.log('  budi@dentalcare.id     / password123 (dentist)');
  console.log('  maya@dentalcare.id     / password123 (dentist)');
  console.log('  patient@dentalcare.id  / password123 (patient)');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
