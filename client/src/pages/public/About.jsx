import { Check } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

const About = () => {
  const { settings } = useClinic();
  const clinicName = settings.clinicName || CLINIC.name;
  const hours = settings.operatingHours || CLINIC.hours.summary;

  return (
    <div className="container-app py-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="section-kicker">Tentang Kami</span>
          <h1 className="mt-4 text-4xl leading-tight md:text-5xl">Klinik Gigi Modern dengan Sentuhan Personal</h1>
          <p className="section-copy mt-4">
            {clinicName} adalah klinik gigi keluarga yang mengutamakan perawatan modern,
            transparan, dan nyaman. Tim dokter kami siap mendampingi pasien anak hingga
            dewasa dalam menjaga kesehatan gigi jangka panjang.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'Tenaga medis profesional dan berlisensi',
              'Standar sterilisasi alat sesuai protokol kesehatan',
              'Layanan konservasi, ortodonti, bedah minor, estetik, dan prosthodonti',
              'Pendekatan minim sakit yang ramah untuk seluruh keluarga',
              'Booking online dan informasi biaya yang transparan',
            ].map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-stone-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-square overflow-hidden rounded-[2rem] border border-white shadow-xl shadow-brand-900/10">
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900"
            alt={`Suasana ${clinicName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <section className="mt-16">
        <div className="grid gap-6 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="card p-8 bg-brand-50/60 dark:bg-brand-950/20">
            <span className="inline-flex items-center rounded-full border border-brand-300/70 bg-brand-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-700 mb-4">Visi</span>
            <p className="text-lg font-semibold leading-relaxed text-brand-900 dark:text-brand-200">
              Menjadi klinik gigi keluarga rujukan dengan layanan terintegrasi dan berbasis teknologi.
            </p>
          </div>
          <div className="card p-6 bg-brand-50/60 dark:bg-brand-950/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700 mb-3">Misi</h3>
            <p className="text-brand-900 leading-relaxed dark:text-brand-200">
              Memberikan perawatan terbaik dengan biaya transparan, pendekatan personal, dan ramah keluarga.
            </p>
          </div>
          <div className="card p-6 bg-brand-50/60 dark:bg-brand-950/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-700 mb-3">Nilai Kami</h3>
            <p className="text-brand-900 leading-relaxed dark:text-brand-200">
              Integritas, profesionalisme, kepedulian, dan inovasi berkelanjutan untuk senyum Anda.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="section-heading mb-8 text-center">Lokasi Klinik</h2>
        <div className="card mx-auto max-w-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-brand-800">{clinicName}</h3>
          <p className="mt-2 text-sm text-stone-600">
            {settings.address || CLINIC.address.primary.line}
          </p>
          <p className="text-stone-500 text-xs mt-3 whitespace-pre-line">{hours}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
