import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
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
import { CardGridSkeleton } from '../../components/common/Skeleton';
import { serviceService, dentistService, articleService, testimonialService } from '../../services';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

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

const Hero = () => {
  const { settings } = useClinic();
  const clinicName = settings.clinicName || CLINIC.name;

  return (
  <section className="relative isolate overflow-hidden">
    <div className="absolute left-[-12rem] top-[-10rem] -z-10 h-96 w-96 rounded-full bg-brand-200/45 blur-3xl" />
    <div className="absolute right-[-12rem] top-24 -z-10 h-[28rem] w-[28rem] rounded-full bg-brand-100/70 blur-3xl" />
    <div className="container-app grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-20">
      <div>
        <span className="section-kicker mb-5">
          {settings.tagline || CLINIC.tagline}
        </span>
        <h1 className="max-w-3xl text-4xl leading-[1.03] text-slate-950 md:text-6xl lg:text-7xl">
          Senyum sehat yang terasa <span className="text-brand-700">hangat, tenang, dan percaya diri</span>.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
          {clinicName} menggabungkan teknologi modern, dokter berpengalaman, dan proses booking yang ringan untuk keluarga Anda.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/appointment" className="btn-primary">
            <CalendarCheck className="h-5 w-5" /> Book Appointment
          </Link>
          <Link to="/services" className="btn-secondary">Lihat Layanan</Link>
        </div>
        <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
          {[
            { v: CLINIC.stats.years, l: 'Tahun pengalaman' },
            { v: CLINIC.stats.patients, l: 'Pasien puas' },
            { v: CLINIC.stats.rating, l: 'Rating Google' },
          ].map((s) => (
            <div key={s.l} className="rounded-3xl border border-brand-100 bg-white/78 p-4 shadow-sm shadow-brand-900/5 backdrop-blur">
              <p className="text-2xl font-extrabold text-slate-950">{s.v}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -right-5 -top-5 h-24 w-24 rounded-full bg-brand-300/80 blur-2xl" />
        <div className="relative overflow-hidden rounded-[2rem] border border-white bg-brand-100 shadow-[0_30px_90px_rgba(146,64,14,0.18)]">
          <div className="aspect-[4/5]">
            <img
              src={HERO_SLIDES[0].src}
              alt={HERO_SLIDES[0].alt}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-900/18 via-transparent to-white/8" />
        </div>
        <div className="card absolute -bottom-5 left-4 z-10 flex max-w-[240px] items-center gap-3 p-4 lg:-left-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-200 text-brand-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Standar perawatan</p>
            <p className="text-sm font-bold text-slate-950">Dokter berlisensi PDGI</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  );
};

const FEATURES = [
  { Icon: Stethoscope, t: 'Dokter Berpengalaman', d: 'Tim dokter gigi tersertifikasi PDGI dengan spesialisasi lengkap.' },
  { Icon: Sparkles, t: 'Teknologi Modern', d: 'Peralatan digital terbaru untuk diagnosa akurat dan tindakan presisi.' },
  { Icon: Clock, t: 'Booking 24/7', d: 'Atur jadwal kapan saja melalui website tanpa perlu antri telepon.' },
  { Icon: HeartHandshake, t: 'Ramah & Nyaman', d: 'Suasana klinik yang menenangkan, cocok untuk anak hingga dewasa.' },
];

const Features = () => {
  const { settings } = useClinic();
  return (
  <section className="container-app py-16">
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <span className="section-kicker mb-4">Pengalaman Klinik</span>
      <h2 className="section-heading">Mengapa Memilih {settings.clinicName || CLINIC.shortName}?</h2>
      <p className="section-copy mt-3">Perawatan gigi yang rapi, transparan, dan terasa lebih tenang sejak pertama masuk.</p>
    </div>
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ Icon, t, d }, index) => (
        <div
          key={t}
          className={`card p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10 ${
            index === 0 ? 'lg:col-span-2 lg:text-left' : 'text-left'
          }`}
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-950">{t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
        </div>
      ))}
    </div>
  </section>
  );
};

const Gallery = () => (
  <section className="container-app py-16">
    <div className="mb-8 flex items-end justify-between">
      <div>
        <h2 className="section-heading flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
            <ImageIcon className="h-6 w-6" />
          </span>
          Galeri Klinik
        </h2>
        <p className="section-copy mt-2">Suasana klinik, ruang tindakan, dan fasilitas pendukung.</p>
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
          <div className="group aspect-[4/3] overflow-hidden rounded-[1.75rem] border border-white bg-brand-50 shadow-md shadow-brand-900/10">
            <img
              src={src}
              alt="Galeri klinik"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

const Home = () => {
  const { settings } = useClinic();
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
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="section-heading">Layanan Unggulan</h2>
            <p className="section-copy mt-2">Perawatan dari rutin hingga estetik untuk seluruh keluarga.</p>
          </div>
          <Link to="/services" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 md:inline-flex">
            Lihat semua layanan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {loading ? (
          <CardGridSkeleton />
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

      <section className="border-y border-brand-100/70 bg-white/58 py-16 backdrop-blur">
        <div className="container-app">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="section-heading">Dokter Kami</h2>
              <p className="section-copy mt-2">Tim dokter gigi tersertifikasi dan berpengalaman.</p>
            </div>
            <Link to="/dentists" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 md:inline-flex">
              Semua dokter <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <CardGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dentists.map((d) => <DentistCard key={d.user?._id || d._id} entry={d} />)}
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="container-app py-16">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="section-heading">Apa Kata Pasien Kami</h2>
            <p className="section-copy mt-3">Kepercayaan Anda adalah kebanggaan kami.</p>
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
                <div className="card h-full p-6">
                  <div className="mb-3 flex gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm italic leading-relaxed text-slate-700">"{t.message}"</p>
                  <p className="mt-4 text-sm font-semibold text-slate-950">{t.patientName}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      <section className="container-app py-16">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-300 via-brand-200 to-white p-8 text-center shadow-xl shadow-brand-900/10 md:p-12">
          <h2 className="text-3xl text-slate-950 md:text-4xl">Siap Memulai Perawatan?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-700">
            Booking online dalam 2 menit, atau hubungi kami via WhatsApp untuk konsultasi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/appointment"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white transition hover:bg-slate-800 active:translate-y-px"
            >
              <CalendarCheck className="h-5 w-5" /> Book Appointment
            </Link>
            <a
              href={`https://wa.me/${(settings.whatsapp || CLINIC.whatsappNumber).replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${settings.clinicName || CLINIC.name}, saya ingin konsultasi.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-slate-950 transition hover:bg-brand-50 active:translate-y-px"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp Kami
            </a>
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="container-app py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="section-heading">Artikel Terbaru</h2>
              <p className="section-copy mt-2">Tips kesehatan gigi untuk Anda.</p>
            </div>
            <Link to="/blog" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800 md:inline-flex">
              Semua artikel <ArrowRight className="h-4 w-4" />
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
