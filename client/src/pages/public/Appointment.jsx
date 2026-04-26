import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Select, Textarea } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dentistService, serviceService, appointmentService } from '../../services';
import { extractMessage } from '../../services/api';
import Loader from '../../components/common/Loader';

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00',
];

const Appointment = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [dentists, setDentists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    dentistId: searchParams.get('dentist') || '',
    serviceId: searchParams.get('service') || '',
    appointmentDate: '',
    appointmentTime: '',
    complaint: '',
  });

  useEffect(() => {
    Promise.all([dentistService.list(), serviceService.list(true)])
      .then(([d, s]) => {
        setDentists(d);
        setServices(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate());
    return d.toISOString().split('T')[0];
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Silakan login terlebih dahulu untuk membuat appointment');
      navigate('/login', { state: { from: '/appointment' } });
      return;
    }
    if (user.role !== 'patient') {
      toast.error('Hanya pasien yang dapat membuat appointment');
      return;
    }
    setSubmitting(true);
    try {
      await appointmentService.create(form);
      setSubmitted(true);
      toast.success('Appointment berhasil dibuat. Menunggu konfirmasi.');
    } catch (err) {
      toast.error(extractMessage(err, 'Gagal membuat appointment'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="container-app py-12 max-w-3xl">
      <h1 className="text-4xl">Booking Appointment</h1>
      <p className="text-slate-600 mt-2">Pilih dokter, layanan, dan jadwal yang sesuai untuk Anda.</p>

      {submitted ? (
        <div className="card p-8 mt-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-3xl">✓</div>
          <h2 className="text-2xl mt-4">Booking Berhasil!</h2>
          <p className="text-slate-600 mt-2">
            Appointment Anda akan dikonfirmasi oleh tim klinik dalam 1×24 jam. Periksa status di dashboard.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/patient/appointments" className="btn-primary">Lihat Appointment Saya</Link>
            <Link to="/" className="btn-secondary">Ke Beranda</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 lg:p-8 mt-8 space-y-5">
          <Select
            label="Dokter Gigi"
            name="dentistId"
            value={form.dentistId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih dokter</option>
            {dentists.map((d) => (
              <option key={d.user._id} value={d.user._id}>
                {d.user.name} — {d.profile?.specialization || 'General Dentistry'}
              </option>
            ))}
          </Select>

          <Select
            label="Layanan"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih layanan</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.title}</option>
            ))}
          </Select>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Tanggal"
              name="appointmentDate"
              value={form.appointmentDate}
              min={minDate}
              onChange={handleChange}
              required
            />
            <Select
              label="Jam"
              name="appointmentTime"
              value={form.appointmentTime}
              onChange={handleChange}
              required
            >
              <option value="">Pilih jam</option>
              {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>

          <Textarea
            label="Keluhan / Catatan (opsional)"
            name="complaint"
            value={form.complaint}
            onChange={handleChange}
            rows={3}
            placeholder="Misal: gigi geraham bawah berlubang dan ngilu saat minum dingin..."
          />

          {!user && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-lg p-3">
              Anda perlu <Link to="/login" className="underline font-medium">login</Link> atau{' '}
              <Link to="/register" className="underline font-medium">register</Link> sebagai pasien untuk menyelesaikan booking.
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Mengirim...' : 'Konfirmasi Booking'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Appointment;
