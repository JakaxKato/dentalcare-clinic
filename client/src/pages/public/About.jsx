import { CLINIC } from '../../config/clinic';

const About = () => (
  <div className="container-app py-12">
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="text-brand-600 font-medium text-sm">Tentang Kami</span>
        <h1 className="text-4xl mt-2">Klinik Gigi Modern dengan Sentuhan Personal</h1>
        <p className="text-slate-600 mt-4 leading-relaxed">
          {CLINIC.name} adalah klinik gigi keluarga yang melayani masyarakat Bandung dan sekitarnya di dua lokasi:
          <strong> Bojongsoang</strong> dan <strong>Antapani</strong>. Kami percaya bahwa kesehatan gigi adalah investasi jangka panjang —
          itulah sebabnya kami menggunakan peralatan modern dan menghadirkan tim dokter gigi yang berpengalaman,
          ramah, dan siap mendampingi Anda maupun buah hati.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            'Sertifikasi PDGI dan tenaga medis berlisensi',
            'Standar sterilisasi alat sesuai protokol kesehatan',
            'Layanan lengkap: konservasi, ortodonti (behel), bedah minor, estetik, prosthodonti',
            'Pendekatan minim sakit — ramah pasien anak hingga lansia',
            'Dua cabang strategis untuk kemudahan akses',
          ].map((p) => (
            <li key={p} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">✓</span>
              <span className="text-slate-700">{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900"
          alt={`Suasana ${CLINIC.name}`}
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    <section className="mt-16 grid md:grid-cols-3 gap-6">
      {[
        { t: 'Visi', d: 'Menjadi klinik gigi keluarga rujukan utama di Bandung dengan layanan terintegrasi dan berbasis teknologi.' },
        { t: 'Misi', d: 'Memberikan perawatan gigi terbaik dengan biaya yang transparan, pendekatan personal, dan ramah keluarga.' },
        { t: 'Nilai Kami', d: 'Integritas, profesionalisme, kepedulian, dan inovasi berkelanjutan untuk senyum Anda.' },
      ].map((b) => (
        <div key={b.t} className="card p-6">
          <h3 className="text-xl font-bold text-brand-700">{b.t}</h3>
          <p className="text-slate-600 mt-2">{b.d}</p>
        </div>
      ))}
    </section>

    <section className="mt-16">
      <h2 className="text-3xl text-center mb-8">Dua Cabang, Satu Standar Pelayanan</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-700">{CLINIC.address.primary.label}</h3>
          <p className="text-slate-600 mt-2 text-sm">{CLINIC.address.primary.line}</p>
          <p className="text-slate-500 text-xs mt-3">{CLINIC.hours.summary}</p>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-bold text-brand-700">{CLINIC.address.secondary.label}</h3>
          <p className="text-slate-600 mt-2 text-sm">{CLINIC.address.secondary.line}</p>
          <p className="text-slate-500 text-xs mt-3">{CLINIC.hours.summary}</p>
        </div>
      </div>
    </section>
  </div>
);

export default About;
