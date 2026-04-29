import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/cards/ServiceCard';
import DentistCard from '../../components/cards/DentistCard';
import ArticleCard from '../../components/cards/ArticleCard';
import Loader from '../../components/common/Loader';
import { serviceService, dentistService, articleService, testimonialService } from '../../services';
import { CLINIC } from '../../config/clinic';

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
          <Link to="/appointment" className="btn-primary">📅 Book Appointment</Link>
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
          <img
            src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=900"
            alt="Dental clinic"
            className="w-full h-full object-cover mix-blend-multiply"
          />
        </div>
        <div className="absolute -bottom-4 -left-4 lg:-left-8 card p-4 flex items-center gap-3 max-w-[220px]">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">✓</div>
          <div>
            <p className="text-xs text-slate-500">Sertifikasi</p>
            <p className="text-sm font-semibold">PDGI Resmi</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Features = () => (
  <section className="container-app py-16">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-3xl">Mengapa Memilih {CLINIC.shortName}?</h2>
      <p className="text-slate-600 mt-3">Komitmen kami adalah memberikan perawatan gigi berkualitas dengan pengalaman yang menyenangkan.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { i: '👨‍⚕️', t: 'Dokter Berpengalaman', d: 'Tim dokter gigi tersertifikasi PDGI dengan spesialisasi lengkap.' },
        { i: '🦷', t: 'Teknologi Modern', d: 'Peralatan digital terbaru untuk diagnosa akurat dan tindakan presisi.' },
        { i: '⏰', t: 'Booking 24/7', d: 'Atur jadwal kapan saja melalui website tanpa perlu antri telepon.' },
        { i: '💚', t: 'Ramah & Nyaman', d: 'Suasana klinik yang menenangkan, cocok untuk anak hingga dewasa.' },
      ].map((f) => (
        <div key={f.t} className="card p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-3">{f.i}</div>
          <h3 className="font-semibold text-slate-800">{f.t}</h3>
          <p className="text-sm text-slate-600 mt-2">{f.d}</p>
        </div>
      ))}
    </div>
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
        setTestimonials(t.slice(0, 4));
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
          <Link to="/services" className="hidden md:inline text-brand-600 hover:underline text-sm">
            Lihat semua layanan →
          </Link>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => <ServiceCard key={s._id} service={s} />)}
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-16">
        <div className="container-app">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl">Dokter Kami</h2>
              <p className="text-slate-600 mt-1">Tim dokter gigi tersertifikasi dan berpengalaman.</p>
            </div>
            <Link to="/dentists" className="hidden md:inline text-brand-600 hover:underline text-sm">
              Semua dokter →
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t._id} className="card p-6">
                <div className="flex gap-0.5 text-amber-400 mb-2">
                  {'★'.repeat(t.rating)}
                  {'☆'.repeat(5 - t.rating)}
                </div>
                <p className="text-slate-700 text-sm italic">"{t.message}"</p>
                <p className="mt-4 font-semibold text-slate-800 text-sm">— {t.patientName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand-600 text-white py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl md:text-4xl text-white">Siap Memulai Perawatan?</h2>
          <p className="mt-3 text-brand-100 max-w-xl mx-auto">
            Booking online dalam 2 menit, atau hubungi kami via WhatsApp untuk konsultasi.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/appointment" className="bg-white text-brand-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold">
              📅 Book Appointment
            </Link>
            <a
              href={`https://wa.me/${CLINIC.whatsappNumber}?text=${encodeURIComponent(`Halo ${CLINIC.name}, saya ingin konsultasi.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-semibold"
            >
              💬 WhatsApp Kami
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
            <Link to="/blog" className="hidden md:inline text-brand-600 hover:underline text-sm">
              Semua artikel →
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
