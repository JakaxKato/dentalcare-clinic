import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { appointmentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';
import { extractMessage } from '../../services/api';

const PatientAppointments = () => {
  const toast = useToast();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    appointmentService.mine().then(setAppts).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'all' ? appts : appts.filter((a) => a.status === filter);

  const cancel = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan appointment ini?')) return;
    try {
      await appointmentService.updateStatus(id, { status: 'cancelled' });
      toast.success('Appointment dibatalkan');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Riwayat Appointment</h2>
        <Link to="/appointment" className="btn-primary text-sm">+ Booking Baru</Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            {s === 'all' ? 'Semua' : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📅" title="Tidak ada appointment" description="Coba filter lain atau buat booking baru." />
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtered.map((a) => (
            <div key={a._id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.serviceId?.title || '-'}</p>
                <p className="text-sm text-slate-500">
                  {a.dentistId?.name || '-'} · {formatDateTime(a.appointmentDate, a.appointmentTime)}
                </p>
                {a.complaint && <p className="text-xs text-slate-500 mt-1">"{a.complaint}"</p>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={a.status} />
                <button onClick={() => setSelected(a)} className="btn-secondary text-xs">Detail</button>
                {a.status === 'pending' && (
                  <button onClick={() => cancel(a._id)} className="btn-danger text-xs">Batalkan</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Detail Appointment" size="lg">
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Layanan" value={selected.serviceId?.title} />
              <Info label="Dokter" value={selected.dentistId?.name} />
              <Info label="Tanggal" value={formatDateTime(selected.appointmentDate, selected.appointmentTime)} />
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            {selected.complaint && <Info label="Keluhan" value={selected.complaint} />}
            {selected.diagnosis && <Info label="Diagnosis" value={selected.diagnosis} />}
            {selected.treatmentNotes && <Info label="Catatan Tindakan" value={selected.treatmentNotes} />}
            {selected.recommendation && <Info label="Rekomendasi" value={selected.recommendation} />}
          </div>
        )}
      </Modal>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-medium">{value || '-'}</p>
  </div>
);

export default PatientAppointments;
