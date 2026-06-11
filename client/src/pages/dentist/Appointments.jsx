import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { Textarea } from '../../components/common/Input';
import { appointmentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';
import { extractMessage } from '../../services/api';

const DentistAppointments = () => {
  const toast = useToast();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [date, setDate] = useState('');
  const [active, setActive] = useState(null);
  const [notes, setNotes] = useState({ diagnosis: '', treatmentNotes: '', recommendation: '' });

  const load = () => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (date) params.date = date;
    appointmentService.list(params).then(setAppts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, date]);

  const openComplete = (a) => {
    setActive(a);
    setNotes({
      diagnosis: a.diagnosis || '',
      treatmentNotes: a.treatmentNotes || '',
      recommendation: a.recommendation || '',
    });
  };

  const transition = async (id, status, extra = {}) => {
    try {
      await appointmentService.updateStatus(id, { status, ...extra });
      toast.success(`Status diubah ke ${status}`);
      setActive(null);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Appointment Saya</h2>

      <div className="flex flex-wrap gap-3 items-center">
        <select className="input max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" className="input max-w-[200px]" value={date} onChange={(e) => setDate(e.target.value)} />
        {date && (
          <button className="btn-ghost text-sm" onClick={() => setDate('')}>Reset Tanggal</button>
        )}
      </div>

      {appts.length === 0 ? (
        <EmptyState icon="📅" title="Tidak ada appointment" />
      ) : (
        <div className="card divide-y divide-slate-100">
          {appts.map((a) => (
            <div key={a._id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.patientId?.name}</p>
                <p className="text-sm text-slate-500">
                  {a.serviceId?.title} · {formatDateTime(a.appointmentDate, a.appointmentTime)}
                </p>
                {a.complaint && <p className="text-xs text-slate-500 mt-1 italic">"{a.complaint}"</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={a.status} />
                {a.status === 'pending' && (
                  <button onClick={() => transition(a._id, 'confirmed')} className="btn-secondary text-xs">Confirm</button>
                )}
                {a.status === 'confirmed' && (
                  <button onClick={() => openComplete(a)} className="btn-primary text-xs">Selesai + Catatan</button>
                )}
                {['pending', 'confirmed'].includes(a.status) && (
                  <button onClick={() => transition(a._id, 'cancelled')} className="btn-danger text-xs">Cancel</button>
                )}
                <Link to={`/dentist/treatment/${a._id}`} className="btn-primary text-xs">Treatment</Link>
                <button onClick={() => setActive(a)} className="btn-ghost text-xs">Detail</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title="Detail Appointment" size="lg">
        {active && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Pasien" value={active.patientId?.name} />
              <Info label="Telepon" value={active.patientId?.phone} />
              <Info label="Layanan" value={active.serviceId?.title} />
              <Info label="Jadwal" value={formatDateTime(active.appointmentDate, active.appointmentTime)} />
            </div>
            {active.complaint && <Info label="Keluhan" value={active.complaint} />}

            {active.status === 'confirmed' && (
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="font-semibold">Catatan Tindakan</h4>
                <Textarea label="Diagnosis" value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} />
                <Textarea label="Tindakan Dilakukan" value={notes.treatmentNotes} onChange={(e) => setNotes({ ...notes, treatmentNotes: e.target.value })} />
                <Textarea label="Rekomendasi" value={notes.recommendation} onChange={(e) => setNotes({ ...notes, recommendation: e.target.value })} />
                <button
                  onClick={() => transition(active._id, 'completed', notes)}
                  className="btn-primary"
                >
                  Tandai Selesai
                </button>
              </div>
            )}

            {(active.diagnosis || active.treatmentNotes || active.recommendation) && active.status === 'completed' && (
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <Info label="Diagnosis" value={active.diagnosis} />
                <Info label="Tindakan" value={active.treatmentNotes} />
                <Info label="Rekomendasi" value={active.recommendation} />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-medium whitespace-pre-line">{value || '-'}</p>
  </div>
);

export default DentistAppointments;
