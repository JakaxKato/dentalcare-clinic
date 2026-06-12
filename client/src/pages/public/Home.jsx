import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules';
import {
  CalendarCheck,
  MessageCircle,
  Stethoscope,
  Sparkles,
  Clock,
  HeartHandshake,
  ShieldCheck,
  Star,
  ArrowRight,
  Image as ImageIcon,
} from 'lucide-react';
import ServiceCard from '../../components/cards/ServiceCard';
import DentistCard from '../../components/cards/DentistCard';
import ArticleCard from '../../components/cards/ArticleCard';
import Loader from '../../components/common/Loader';
import { serviceService, dentistService, articleService, testimonialService } from '../../services';
import { CLINIC } from '../../config/clinic';

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&q=80',
    alt: 'Suasana ruang praktek dokter gigi modern',
  },
  {
    src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
    alt: 'Pemeriksaan gigi dengan peralatan digital',
  },
  {
    src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80',
    alt: 'Dokter gigi tersenyum bersama pasien anak',
  },
];

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1588776813677-77aaf5595b83?w=900&q=80',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=900&q=80',
  'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=900&q=80',
  'https://images.unsplash.com/photo-1629909615184-74f495363b67?w=900&q=80',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=900&q=80',
  'https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=900&q=80',
];

const Hero = () => (
  <section className="relative bg-gradient-to-br from-brand-50 via-white to-accent-400/10">
    <div className="container-app py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-block bg-brand-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
          {CLINIC.tagline}
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-tight">
          Senyum Sehat & <span className="text-brand-600">Percaya Diri</span> untuk Keluarga Anda
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-lg">
          {CLINIC.name} hadir di dua lokasi strategis di Bandung — menggabungkan teknologi modern dengan sentuhan personal:
          booking online, dokter berpengalaman, dan suasana yang nyaman untuk semua usia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/appointment" className="btn-primary">
            <CalendarCheck className="w-5 h-5" /> Book Appointment
          </Link>
          <Link to="/services" className="btn-secondary">Lihat Layanan</Link>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
          {[
            { v: CLINIC.stats.years, l: 'Tahun Pengalaman' },
            { v: CLINIC.stats.patients, l: 'Pasien Puas' },
            { v: CLINIC.stats.rating, l: 'Rating Google' },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-2xl font-bold text-slate-900">{s.v}</p>
              <p className="text-xs text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-brand-200 to-accent-400/40">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={1200}
            loop
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full h-full"
          >
            {HERO_SLIDES.map((slide) => (
              <SwiperSlide key={slide.src}>
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="absolute -bottom-4 -left-4 lg:-left-8 card p-4 flex items-center gap-3 max-w-[220px]">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Sertifikasi</p>
            <p className="text-sm font-semibold">PDGI Resmi</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FEATURES = [
  { Icon: Stethoscope, t: 'Dokter Berpengalaman', d: 'Tim dokter gigi tersertifikasi PDGI dengan spesialisasi lengkap.' },
  { Icon: Sparkles, t: 'Teknologi Modern', d: 'Peralatan digital terbaru untuk diagnosa akurat dan tindakan presisi.' },
  { Icon: Clock, t: 'Booking 24/7', d: 'Atur jadwal kapan saja melalui website tanpa perlu antri telepon.' },
  { Icon: HeartHandshake, t: 'Ramah & Nyaman', d: 'Suasana klinik yang menenangkan, cocok untuk anak hingga dewasa.' },
];

const Features = () => (
  <section className="container-app py-16">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-3xl">Mengapa Memilih {CLINIC.shortName}?</h2>
      <p className="text-slate-600 mt-3">Komitmen kami adalah memberikan perawatan gigi berkualitas dengan pengalaman yang menyenangkan.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map(({ Icon, t, d }) => (
        <div key={t} className="card p-6 text-center hover:shadow-lg transition">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-slate-800">{t}</h3>
          <p className="text-sm text-slate-600 mt-2">{d}</p>
        </div>
      ))}
    </div>
  </section>
);

const Gallery = () => (
  <section className="container-app py-16">
    <div className="flex items-end justify-between mb-8">
      <div>
        <h2 className="text-3xl flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-brand-600" /> Galeri Klinik
        </h2>
        <p className="text-slate-600 mt-1">Suasana klinik, ruang tindakan, dan fasilitas pendukung.</p>
      </div>
    </div>
    <Swiper
      modules={[Autoplay, Navigation, Pagination]}
      spaceBetween={20}
      slidesPerView={1.2}
      breakpoints={{
        640: { slidesPerView: 2.2 },
        1024: { slidesPerView: 3.2 },
      }}
      loop
      speed={800}
      autoplay={{ delay: 3500, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      className="!pb-12"
    >
      {GALLERY_IMAGES.map((src) => (
        <SwiperSlide key={src}>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md group">
            <img
              src={src}
              alt="Galeri klinik"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const Home = () => {
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [articles, setArticles] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      serviceService.list(true).catch(() => []),
      dentistService.list().catch(() => []),
      articleService.list().catch(() => []),
      testimonialService.list().catch(() => []),
    ])
      .then(([s, d, a, t]) => {
        setServices(s.slice(0, 6));
        setDentists(d.slice(0, 3));
        setArticles(a.slice(0, 3));
        setTestimonials(t.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <Features />

      <section className="container-app py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl">Layanan Unggulan</h2>
            <p className="text-slate-600 mt-1">Perawatan dari rutin hingga estetik untuk seluruh keluarga.</p>
          </div>
          <Link to="/services" className="hidden md:inline-flex items-center gap-1 text-brand-600 hover:underline text-sm">
            Lihat semua layanan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1.1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={services.length > 3}
            speed={700}
            autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
            navigation
            pagination={{ clickable: true }}
            className="!pb-12"
          >
            {services.map((s) => (
              <SwiperSlide key={s._id}>
                <ServiceCard service={s} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      <Gallery />

      <section className="bg-slate-50 py-16">
        <div className="container-app">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl">Dokter Kami</h2>
              <p className="text-slate-600 mt-1">Tim dokter gigi tersertifikasi dan berpengalaman.</p>
            </div>
            <Link to="/dentists" className="hidden md:inline-flex items-center gap-1 text-brand-600 hover:underline text-sm">
              Semua dokter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dentists.map((d) => <DentistCard key={d.user?._id || d._id} entry={d} />)}
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="container-app py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl">Apa Kata Pasien Kami</h2>
            <p className="text-slate-600 mt-3">Kepercayaan Anda adalah kebanggaan kami.</p>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            loop={testimonials.length > 3}
            speed={800}
            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            className="!pb-12"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t._id}>
                <div className="card p-6 h-full">
                  <div className="flex gap-0.5 text-amber-400 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm italic">"{t.message}"</p>
                  <p className="mt-4 font-semibold text-slate-800 text-sm">— {t.patientName}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      <section className="bg-brand-600 text-white py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl text-white">Siap Memulai Perawatan?</h2>
          <p className="mt-3 text-brand-100 max-w-xl mx-auto">
            Booking online dalam 2 menit, atau hubungi kami via WhatsApp untuk konsultasi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold"
            >
              <CalendarCheck className="w-5 h-5" /> Book Appointment
            </Link>
            <a
              href={`https://wa.me/${CLINIC.whatsappNumber}?text=${encodeURIComponent(`Halo ${CLINIC.name}, saya ingin konsultasi.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold"
            >
              <MessageCircle className="w-5 h-5" /> WhatsApp Kami
            </a>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="container-app py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl">Artikel Terbaru</h2>
              <p className="text-slate-600 mt-1">Tips kesehatan gigi untuk Anda.</p>
            </div>
            <Link to="/blog" className="hidden md:inline-flex items-center gap-1 text-brand-600 hover:underline text-sm">
              Semua artikel <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
