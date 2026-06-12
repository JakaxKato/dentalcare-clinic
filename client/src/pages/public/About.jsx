import { Check } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

const About = () => {
  const { settings } = useClinic();
  const clinicName = settings.clinicName || CLINIC.name;
  const hours = settings.operatingHours || CLINIC.hours.summary;

  return (
    <div className="container-app py-12">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="text-brand-600 font-medium text-sm">Tentang Kami</span>
          <h1 className="text-4xl mt-2">Klinik Gigi Modern dengan Sentuhan Personal</h1>
          <p className="text-slate-600 mt-4 leading-relaxed">
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
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                <span className="text-slate-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900"
            alt={`Suasana ${clinicName}`}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <section className="mt-16 grid md:grid-cols-3 gap-6">
        {[
          {
            title: 'Visi',
            description:
              'Menjadi klinik gigi keluarga rujukan dengan layanan terintegrasi dan berbasis teknologi.',
          },
          {
            title: 'Misi',
            description:
              'Memberikan perawatan terbaik dengan biaya transparan, pendekatan personal, dan ramah keluarga.',
          },
          {
            title: 'Nilai Kami',
            description:
              'Integritas, profesionalisme, kepedulian, dan inovasi berkelanjutan untuk senyum Anda.',
          },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <h3 className="text-xl font-bold text-brand-700">{item.title}</h3>
            <p className="text-slate-600 mt-2">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <h2 className="text-3xl text-center mb-8">Lokasi Klinik</h2>
        <div className="card p-6 max-w-2xl mx-auto text-center">
          <h3 className="text-lg font-bold text-brand-700">{clinicName}</h3>
          <p className="text-slate-600 mt-2 text-sm">
            {settings.address || CLINIC.address.primary.line}
          </p>
          <p className="text-slate-500 text-xs mt-3 whitespace-pre-line">{hours}</p>
        </div>
      </section>
    </div>
  );
};

export default About;
