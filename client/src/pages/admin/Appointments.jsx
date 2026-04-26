import { useEffect, useState } from 'react';
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
  const [active, setActive] = useState(null);
  const [reschedule, setReschedule] = useState({ open: false, data: null, date: '', time: '' });

  const load = () => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (date) params.date = date;
    appointmentService.list(params).then(setAppts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, date]);

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
        <button onClick={exportCSV} className="btn-secondary text-sm">⬇️ Export CSV</button>
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
        <EmptyState icon="📅" title="Tidak ada appointment" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-3 text-left">Jadwal</th>
                <th className="px-3 py-3 text-left">Pasien</th>
                <th className="px-3 py-3 text-left">Dokter</th>
                <th className="px-3 py-3 text-left">Layanan</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                        <button onClick={() => setReschedule({ open: true, data: a, date: '', time: a.appointmentTime })} className="btn-ghost text-xs">Reschedule</button>
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
          <Input
            label="Jam Baru"
            type="time"
            value={reschedule.time}
            onChange={(e) => setReschedule({ ...reschedule, time: e.target.value })}
          />
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
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-medium whitespace-pre-line capitalize-first">{value || '-'}</p>
  </div>
);

export default AdminAppointments;
