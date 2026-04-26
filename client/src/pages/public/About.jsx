const About = () => (
  <div className="container-app py-12">
    <div className="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        <span className="text-brand-600 font-medium text-sm">Tentang Kami</span>
        <h1 className="text-4xl mt-2">Klinik Gigi Modern dengan Sentuhan Personal</h1>
        <p className="text-slate-600 mt-4 leading-relaxed">
          DentalCare Clinic berdiri sejak 2010 dengan misi memberikan perawatan gigi berkualitas dan ramah pasien.
          Kami percaya bahwa kesehatan gigi adalah investasi jangka panjang — itulah sebabnya kami menggunakan
          peralatan modern dan menghadirkan tim dokter terbaik di bidangnya.
        </p>
        <ul className="mt-6 space-y-3">
          {[
            'Sertifikasi PDGI dan akreditasi penuh',
            'Standar sterilisasi rumah sakit',
            'Tim spesialis: konservasi, ortodonti, bedah, pedodonti, prosthodonti',
            'Pendekatan minim sakit dan ramah anak',
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
          alt="DentalCare clinic"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    <section className="mt-16 grid md:grid-cols-3 gap-6">
      {[
        { t: 'Visi', d: 'Menjadi klinik gigi rujukan utama dengan layanan terintegrasi dan berbasis teknologi.' },
        { t: 'Misi', d: 'Memberikan perawatan gigi terbaik dengan biaya yang transparan dan ramah keluarga.' },
        { t: 'Nilai Kami', d: 'Integritas, profesionalisme, kepedulian, dan inovasi berkelanjutan.' },
      ].map((b) => (
        <div key={b.t} className="card p-6">
          <h3 className="text-xl font-bold text-brand-700">{b.t}</h3>
          <p className="text-slate-600 mt-2">{b.d}</p>
        </div>
      ))}
    </section>
  </div>
);

export default About;
