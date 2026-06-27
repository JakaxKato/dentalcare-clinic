import { useCallback, useEffect, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import idLocale from '@fullcalendar/core/locales/id';
import { CalendarDays, CalendarRange, Download, List } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { appointmentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, formatDate } from '../../utils/format';
import { extractMessage } from '../../services/api';

const AdminAppointments = () => {
  const toast = useToast();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [date, setDate] = useState('');
  const [view, setView] = useState('table');
  const [active, setActive] = useState(null);
  const [reschedule, setReschedule] = useState({ open: false, data: null, date: '', time: '' });
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (date) params.date = date;
    appointmentService
      .list(params)
      .then(setAppts)
      .catch((err) => toast.error(extractMessage(err, 'Gagal memuat appointment')))
      .finally(() => setLoading(false));
  }, [date, filter, toast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!reschedule.open || !reschedule.data || !reschedule.date) {
      setRescheduleSlots([]);
      setRescheduleError('');
      return;
    }
    let current = true;
    setRescheduleLoading(true);
    setRescheduleError('');
    appointmentService
      .availability({
        dentistId: reschedule.data.dentistId?._id,
        serviceId: reschedule.data.serviceId?._id,
        date: reschedule.date,
        excludeAppointmentId: reschedule.data._id,
      })
      .then((result) => {
        if (current) setRescheduleSlots(result.slots);
      })
      .catch((err) => {
        if (current) setRescheduleError(extractMessage(err, 'Gagal memuat slot'));
      })
      .finally(() => {
        if (current) setRescheduleLoading(false);
      });
    return () => {
      current = false;
    };
  }, [reschedule.open, reschedule.data, reschedule.date]);

  const calendarEvents = useMemo(
    () =>
      appts.map((appointment) => {
        const dateKey = String(appointment.appointmentDate).slice(0, 10);
        const duration = appointment.serviceId?.duration || 30;
        const [hour, minute] = appointment.appointmentTime.split(':').map(Number);
        const endMinutes = hour * 60 + minute + duration;
        const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(
          endMinutes % 60
        ).padStart(2, '0')}`;
        return {
          id: appointment._id,
          title: `${appointment.patientId?.name || 'Pasien'} - ${
            appointment.serviceId?.title || 'Layanan'
          }`,
          start: `${dateKey}T${appointment.appointmentTime}:00`,
          end: `${dateKey}T${end}:00`,
          backgroundColor:
            appointment.status === 'completed'
              ? '#059669'
              : appointment.status === 'confirmed'
                ? '#0284c7'
                : appointment.status === 'cancelled'
                  ? '#94a3b8'
                  : '#d97706',
          borderColor: 'transparent',
          extendedProps: { appointment },
        };
      }),
    [appts]
  );

  const openReschedule = (appointment) => {
    setReschedule({
      open: true,
      data: appointment,
      date: String(appointment.appointmentDate).slice(0, 10),
      time: appointment.appointmentTime,
    });
  };

  const transition = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success(`Status: ${status}`);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus appointment?')) return;
    try {
      await appointmentService.remove(id);
      toast.success('Appointment dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const submitReschedule = async () => {
    if (!reschedule.date || !reschedule.time) {
      toast.error('Pilih tanggal dan jam baru');
      return;
    }
    try {
      await appointmentService.reschedule(reschedule.data._id, {
        appointmentDate: reschedule.date,
        appointmentTime: reschedule.time,
      });
      toast.success('Appointment berhasil di-reschedule');
      setReschedule({ open: false, data: null, date: '', time: '' });
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const exportCSV = () => {
    const headers = ['Tanggal', 'Jam', 'Pasien', 'Dokter', 'Layanan', 'Status', 'Keluhan'];
    const rows = appts.map((a) => [
      formatDate(a.appointmentDate),
      a.appointmentTime,
      a.patientId?.name || '',
      a.dentistId?.name || '',
      a.serviceId?.title || '',
      a.status,
      (a.complaint || '').replace(/[\r\n,]/g, ' '),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">Manajemen Appointment</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setView(view === 'table' ? 'calendar' : 'table')}
            className="btn-secondary text-sm inline-flex items-center gap-1.5"
          >
            {view === 'table' ? (
              <CalendarRange className="w-4 h-4" />
            ) : (
              <List className="w-4 h-4" />
            )}
            {view === 'table' ? 'Kalender' : 'Daftar'}
          </button>
          <button onClick={exportCSV} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select className="input max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" className="input max-w-[200px]" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && <button className="btn-ghost text-sm" onClick={() => setDate('')}>Reset</button>}
      </div>

      {appts.length === 0 ? (
        <EmptyState icon={CalendarDays} title="Tidak ada appointment" />
      ) : view === 'calendar' ? (
        <div className="card p-3 md:p-5 overflow-x-auto">
          <div className="min-w-[760px]">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              buttonText={{ today: 'Hari ini', month: 'Bulan', week: 'Minggu', day: 'Hari' }}
              locale={idLocale}
              firstDay={1}
              slotMinTime="08:00:00"
              slotMaxTime="20:00:00"
              allDaySlot={false}
              height="auto"
              events={calendarEvents}
              eventClick={(info) => setActive(info.event.extendedProps.appointment)}
            />
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-stone-600">
              <tr>
                <th className="px-3 py-3 text-left">Jadwal</th>
                <th className="px-3 py-3 text-left">Pasien</th>
                <th className="px-3 py-3 text-left">Dokter</th>
                <th className="px-3 py-3 text-left">Layanan</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {appts.map((a) => (
                <tr key={a._id}>
                  <td className="px-3 py-3 whitespace-nowrap">{formatDateTime(a.appointmentDate, a.appointmentTime)}</td>
                  <td className="px-3 py-3">{a.patientId?.name}</td>
                  <td className="px-3 py-3">{a.dentistId?.name}</td>
                  <td className="px-3 py-3">{a.serviceId?.title}</td>
                  <td className="px-3 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-3 py-3 text-right space-x-1 whitespace-nowrap">
                    <button onClick={() => setActive(a)} className="btn-ghost text-xs">Detail</button>
                    {a.status === 'pending' && (
                      <button onClick={() => transition(a._id, 'confirmed')} className="btn-secondary text-xs">Confirm</button>
                    )}
                    {['pending', 'confirmed'].includes(a.status) && (
                      <>
                        <button onClick={() => openReschedule(a)} className="btn-ghost text-xs">Reschedule</button>
                        <button onClick={() => transition(a._id, 'cancelled')} className="btn-danger text-xs">Cancel</button>
                      </>
                    )}
                    <button onClick={() => remove(a._id)} className="btn-danger text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Detail Appointment" size="lg">
        {active && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Pasien" value={active.patientId?.name} />
            <Info label="Telepon Pasien" value={active.patientId?.phone} />
            <Info label="Dokter" value={active.dentistId?.name} />
            <Info label="Layanan" value={active.serviceId?.title} />
            <Info label="Jadwal" value={formatDateTime(active.appointmentDate, active.appointmentTime)} />
            <Info label="Status" value={active.status} />
            <div className="col-span-2"><Info label="Keluhan" value={active.complaint} /></div>
            <div className="col-span-2"><Info label="Diagnosis" value={active.diagnosis} /></div>
            <div className="col-span-2"><Info label="Tindakan" value={active.treatmentNotes} /></div>
            <div className="col-span-2"><Info label="Rekomendasi" value={active.recommendation} /></div>
          </div>
        )}
      </Modal>

      <Modal
        open={reschedule.open}
        onClose={() => setReschedule({ open: false, data: null, date: '', time: '' })}
        title="Reschedule Appointment"
      >
        <div className="space-y-3">
          <Input
            label="Tanggal Baru"
            type="date"
            value={reschedule.date}
            onChange={(e) => setReschedule({ ...reschedule, date: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
          />
          <label className="block">
            <span className="label">Jam Baru</span>
            <select
              className={`input ${rescheduleError ? 'border-rose-400' : ''}`}
              value={reschedule.time}
              onChange={(e) => setReschedule({ ...reschedule, time: e.target.value })}
              disabled={rescheduleLoading || !reschedule.date}
            >
              <option value="">
                {rescheduleLoading ? 'Memuat slot...' : 'Pilih jam'}
              </option>
              {rescheduleSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
            {rescheduleError && <p className="text-xs text-rose-600 mt-1">{rescheduleError}</p>}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setReschedule({ open: false, data: null, date: '', time: '' })} className="btn-ghost">Batal</button>
            <button onClick={submitReschedule} className="btn-primary">Simpan</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-stone-500">{label}</p>
    <p className="font-medium whitespace-pre-line capitalize-first">{value || '-'}</p>
  </div>
);

export default AdminAppointments;
