import { useState } from 'react';
import { Input, Textarea } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { CLINIC } from '../../config/clinic';

const FAQ = [
  { q: 'Apakah perlu booking dulu?', a: 'Sangat disarankan agar Anda mendapatkan slot dan dokter sesuai pilihan tanpa harus mengantri. Booking bisa dilakukan online 24 jam melalui website ini.' },
  { q: 'Apakah klinik menerima BPJS?', a: 'Saat ini kami belum bekerja sama dengan BPJS, namun kami menerima asuransi swasta tertentu. Hubungi kami untuk detailnya.' },
  { q: 'Apakah ada cicilan untuk perawatan mahal?', a: 'Ya, kami bekerja sama dengan layanan cicilan medis untuk perawatan ortodonti (behel), implant, dan veneer.' },
  { q: 'Bagaimana jika saya perlu reschedule?', a: 'Anda bisa membatalkan appointment dengan status pending dan membuat baru, atau hubungi admin via WhatsApp untuk reschedule.' },
  { q: 'Apakah menerima pasien anak?', a: 'Ya, kami memiliki pendekatan khusus untuk pasien anak dengan suasana yang ramah dan tidak menakutkan.' },
];

const Contact = () => {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    toast.success('Pesan terkirim! Tim kami akan menghubungi Anda segera.');
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container-app py-12">
      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl">Hubungi Kami</h1>
          <p className="text-slate-600 mt-3">Punya pertanyaan? Tim kami siap membantu Anda.</p>

          <div className="space-y-4 mt-8">
            <div className="card p-5 flex items-start gap-3">
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="font-semibold">{CLINIC.address.primary.label}</h3>
                <p className="text-slate-600 text-sm">{CLINIC.address.primary.line}</p>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-3">
              <div className="text-2xl">📍</div>
              <div>
                <h3 className="font-semibold">{CLINIC.address.secondary.label}</h3>
                <p className="text-slate-600 text-sm">{CLINIC.address.secondary.line}</p>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-3">
              <div className="text-2xl">📞</div>
              <div>
                <h3 className="font-semibold">Telepon / WhatsApp</h3>
                <p className="text-slate-600 text-sm">
                  <a
                    href={`https://wa.me/${CLINIC.whatsappNumber}?text=${encodeURIComponent(`Halo ${CLINIC.name}, saya ingin bertanya.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600"
                  >
                    {CLINIC.phoneDisplay}
                  </a>
                </p>
              </div>
            </div>
            <div className="card p-5 flex items-start gap-3">
              <div className="text-2xl">⏰</div>
              <div>
                <h3 className="font-semibold">Jam Operasional</h3>
                <p className="text-slate-600 text-sm">{CLINIC.hours.summary}</p>
                <p className="text-slate-500 text-xs mt-1">Buka setiap hari termasuk akhir pekan.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl overflow-hidden shadow-md">
            <iframe
              title={`Lokasi ${CLINIC.name}`}
              src={CLINIC.mapEmbedSrc}
              className="w-full h-72 border-0"
              loading="lazy"
            />
          </div>
        </div>

        <div>
          <form onSubmit={submit} className="card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Kirim Pesan</h2>
            <Input label="Nama" name="name" value={form.name} onChange={handle} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={handle} required />
            <Textarea label="Pesan" name="message" rows={5} value={form.message} onChange={handle} required />
            <button type="submit" className="btn-primary w-full">Kirim Pesan</button>
          </form>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Pertanyaan Umum (FAQ)</h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <details key={f.q} className="card p-4 group">
                  <summary className="cursor-pointer font-medium flex justify-between items-center">
                    {f.q}
                    <span className="text-brand-600 group-open:rotate-180 transition">▾</span>
                  </summary>
                  <p className="text-slate-600 text-sm mt-2">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
