import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Loader2 } from 'lucide-react';
import { Input, Select, Textarea } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { dentistService, serviceService, appointmentService } from '../../services';
import { extractMessage } from '../../services/api';
import Loader from '../../components/common/Loader';

const DAY_LABELS = {
  Mon: 'Sen',
  Tue: 'Sel',
  Wed: 'Rab',
  Thu: 'Kam',
  Fri: 'Jum',
  Sat: 'Sab',
  Sun: 'Min',
};

const clinicToday = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

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
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  const [form, setForm] = useState({
    dentistId: searchParams.get('dentist') || '',
    serviceId: searchParams.get('service') || '',
    appointmentDate: '',
    appointmentTime: '',
    complaint: '',
  });
  const { dentistId, serviceId, appointmentDate } = form;

  useEffect(() => {
    Promise.all([dentistService.list(), serviceService.list(true)])
      .then(([dentistList, serviceList]) => {
        setDentists(dentistList);
        setServices(serviceList);
      })
      .catch((err) => toast.error(extractMessage(err, 'Gagal memuat data booking')))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (!dentistId || !serviceId || !appointmentDate) {
      setAvailability(null);
      setAvailabilityError('');
      return;
    }

    let active = true;
    setAvailabilityLoading(true);
    setAvailabilityError('');
    appointmentService
      .availability({ dentistId, serviceId, date: appointmentDate })
      .then((data) => {
        if (active) setAvailability(data);
      })
      .catch((err) => {
        if (active) {
          setAvailability(null);
          setAvailabilityError(extractMessage(err, 'Gagal memuat slot'));
        }
      })
      .finally(() => {
        if (active) setAvailabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dentistId, serviceId, appointmentDate]);

  const selectedDentist = useMemo(
    () => dentists.find((entry) => entry.user._id === form.dentistId),
    [dentists, form.dentistId]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(['dentistId', 'serviceId', 'appointmentDate'].includes(name)
        ? { appointmentTime: '' }
        : {}),
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
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
    <div className="container-app max-w-3xl py-12">
      <span className="section-kicker mb-4">Booking</span>
      <h1 className="text-4xl md:text-5xl">Booking Appointment</h1>
      <p className="section-copy mt-3">Pilih dokter, layanan, dan jadwal yang sesuai untuk Anda.</p>

      {submitted ? (
        <div className="card mt-8 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-100 text-brand-800">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-2xl">Booking Berhasil!</h2>
          <p className="mt-2 text-slate-600">
            Appointment Anda akan dikonfirmasi oleh tim klinik dalam 1x24 jam. Periksa status di dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/patient/appointments" className="btn-primary">Lihat Appointment Saya</Link>
            <Link to="/" className="btn-secondary">Ke Beranda</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="card mt-8 space-y-5 p-6 lg:p-8">
          <Select
            label="Dokter Gigi"
            name="dentistId"
            value={form.dentistId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih dokter</option>
            {dentists.map((entry) => (
              <option key={entry.user._id} value={entry.user._id}>
                {entry.user.name} - {entry.profile?.specialization || 'General Dentistry'}
              </option>
            ))}
          </Select>

          {selectedDentist?.profile && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
              <p className="inline-flex items-center gap-2 font-semibold">
                <CalendarClock className="h-4 w-4" /> Jadwal praktik
              </p>
              <p className="mt-1">
                {selectedDentist.profile.availableDays.map((day) => DAY_LABELS[day] || day).join(', ')}
                {' | '}
                {selectedDentist.profile.workingHours?.start} - {selectedDentist.profile.workingHours?.end}
              </p>
            </div>
          )}

          <Select
            label="Layanan"
            name="serviceId"
            value={form.serviceId}
            onChange={handleChange}
            required
          >
            <option value="">Pilih layanan</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>
                {service.title} ({service.duration || 30} menit)
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              type="date"
              label="Tanggal"
              name="appointmentDate"
              value={form.appointmentDate}
              min={clinicToday()}
              onChange={handleChange}
              required
            />
            <Select
              label="Jam Tersedia"
              name="appointmentTime"
              value={form.appointmentTime}
              onChange={handleChange}
              disabled={!availability || availabilityLoading}
              required
              error={availabilityError}
            >
              <option value="">
                {availabilityLoading ? 'Memuat slot...' : 'Pilih jam'}
              </option>
              {(availability?.slots || []).map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </Select>
          </div>

          {availabilityLoading && (
            <p className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Memeriksa jadwal dokter...
            </p>
          )}
          {availability && !availabilityLoading && availability.slots.length === 0 && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Dokter tidak praktik atau seluruh slot pada tanggal ini sudah terisi.
            </p>
          )}

          <Textarea
            label="Keluhan / Catatan (opsional)"
            name="complaint"
            value={form.complaint}
            onChange={handleChange}
            rows={3}
            placeholder="Misal: gigi geraham bawah berlubang dan ngilu saat minum dingin..."
          />

          {!user && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Anda perlu <Link to="/login" className="underline font-medium">login</Link> atau{' '}
              <Link to="/register" className="underline font-medium">register</Link> sebagai pasien untuk menyelesaikan booking.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !form.appointmentTime}
            className="btn-primary w-full"
          >
            {submitting ? 'Mengirim...' : 'Konfirmasi Booking'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Appointment;
