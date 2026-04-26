import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/cards/ServiceCard';
import DentistCard from '../../components/cards/DentistCard';
import ArticleCard from '../../components/cards/ArticleCard';
import Loader from '../../components/common/Loader';
import { serviceService, dentistService, articleService, testimonialService } from '../../services';

const Hero = () => (
  <section className="relative bg-gradient-to-br from-brand-50 via-white to-accent-400/10">
    <div className="container-app py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="inline-block bg-brand-100 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Klinik Gigi Modern
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-slate-900 leading-tight">
          Senyum Sehat & <span className="text-brand-600">Percaya Diri</span> untuk Keluarga Anda
        </h1>
        <p className="mt-5 text-lg text-slate-600 max-w-lg">
          DentalCare menggabungkan teknologi modern dengan sentuhan personal — booking online, dokter berpengalaman,
          dan suasana yang nyaman untuk semua usia.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/appointment" className="btn-primary">📅 Book Appointment</Link>
          <Link to="/services" className="btn-secondary">Lihat Layanan</Link>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
          {[
            { v: '15+', l: 'Tahun Pengalaman' },
            { v: '8K+', l: 'Pasien Puas' },
            { v: '4.9★', l: 'Rating Google' },
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
      <h2 className="text-3xl">Mengapa Memilih DentalCare?</h2>
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
            <p className="text-slate-600 mt-2">Pilih layanan sesuai kebutuhan kesehatan gigi Anda.</p>
          </div>
          <Link to="/services" className="text-brand-600 hover:underline text-sm font-medium hidden md:block">
            Lihat Semua →
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

      <section className="bg-white py-16">
        <div className="container-app">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl">Tim Dokter Profesional</h2>
            <p className="text-slate-600 mt-2">Berkomitmen memberikan perawatan terbaik untuk Anda.</p>
          </div>
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dentists.map((d) => <DentistCard key={d.user._id} entry={d} />)}
            </div>
          )}
          <div className="text-center mt-8">
            <Link to="/dentists" className="btn-secondary">Lihat Semua Dokter</Link>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="container-app py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl">Apa Kata Pasien Kami</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {testimonials.map((t) => (
              <div key={t._id} className="card p-5">
                <div className="text-amber-500 mb-2">{'★'.repeat(t.rating)}</div>
                <p className="text-sm text-slate-700 italic">"{t.message}"</p>
                <p className="text-sm font-semibold mt-3">— {t.patientName}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="container-app py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl">Artikel Terbaru</h2>
              <p className="text-slate-600 mt-2">Tips & edukasi kesehatan gigi dari ahlinya.</p>
            </div>
            <Link to="/blog" className="text-brand-600 hover:underline text-sm font-medium hidden md:block">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => <ArticleCard key={a._id} article={a} />)}
          </div>
        </section>
      )}

      <section className="bg-brand-600 text-white py-16">
        <div className="container-app text-center">
          <h2 className="text-3xl text-white">Siap Memulai Senyum Sehat Anda?</h2>
          <p className="text-brand-100 mt-3 max-w-xl mx-auto">
            Booking konsultasi pertama Anda hari ini — gratis tanya jawab dengan dokter kami.
          </p>
          <Link to="/appointment" className="mt-6 inline-flex bg-white text-brand-700 hover:bg-slate-100 btn">
            Book Appointment Sekarang
          </Link>
        </div>
      </section>
    </>
  );
};

export default Home;
