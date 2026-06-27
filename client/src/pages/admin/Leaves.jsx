import { useEffect, useState } from 'react';
import { CalendarOff, Trash2 } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { dentistLeaveService, dentistService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const formatDateRange = (start, end) => {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('id-ID', opts);
  const e = new Date(end).toLocaleDateString('id-ID', opts);
  return s === e ? s : `${s} - ${e}`;
};

const isActiveLeave = (leave) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(leave.startDate) <= today && new Date(leave.endDate) >= today;
};

const AdminLeaves = () => {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDentist, setFilterDentist] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    const params = {};
    if (filterDentist) params.dentistId = filterDentist;
    Promise.all([
      dentistLeaveService.list(params).then((r) => r.data || []),
      dentists.length === 0 ? dentistService.list() : Promise.resolve(dentists),
    ])
      .then(([l, d]) => {
        setLeaves(l);
        if (d) setDentists(d);
      })
      .catch((err) => toast.error(extractMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDentist]);

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin membatalkan cuti ini?')) return;
    setDeletingId(id);
    try {
      await dentistLeaveService.remove(id);
      toast.success('Cuti dibatalkan oleh admin');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const upcoming = leaves.filter((l) => !isActiveLeave(l) && new Date(l.endDate) >= new Date());
  const active   = leaves.filter(isActiveLeave);
  const past     = leaves.filter((l) => new Date(l.endDate) < new Date() && !isActiveLeave(l));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Jadwal Cuti Dokter</h2>
          <p className="mt-1 text-sm text-stone-500">Semua jadwal ketidakhadiran dokter.</p>
        </div>
        <select
          className="input w-auto min-w-[180px]"
          value={filterDentist}
          onChange={(e) => setFilterDentist(e.target.value)}
        >
          <option value="">Semua Dokter</option>
          {dentists.map((d) => (
            <option key={d.user._id} value={d.user._id}>{d.user.name}</option>
          ))}
        </select>
      </div>

      {loading ? <Loader /> : (
        <>
          {active.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-600">Sedang Cuti</h3>
              <div className="card overflow-hidden">
                <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                  {active.map((l) => (
                    <LeaveAdminRow key={l._id} leave={l} onDelete={handleDelete} deletingId={deletingId} isActive />
                  ))}
                </ul>
              </div>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">Akan Datang</h3>
              <div className="card overflow-hidden">
                <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                  {upcoming.map((l) => (
                    <LeaveAdminRow key={l._id} leave={l} onDelete={handleDelete} deletingId={deletingId} />
                  ))}
                </ul>
              </div>
            </div>
          )}

          {active.length === 0 && upcoming.length === 0 && (
            <EmptyState
              icon={CalendarOff}
              title="Tidak ada jadwal cuti aktif atau mendatang"
              description="Dokter akan mengisi jadwal cuti mereka sendiri."
            />
          )}

          {past.length > 0 && (
            <details className="rounded-2xl border border-stone-200 dark:border-stone-800">
              <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-stone-500 select-none">
                Riwayat cuti ({past.length})
              </summary>
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {past.map((l) => (
                  <LeaveAdminRow key={l._id} leave={l} onDelete={handleDelete} deletingId={deletingId} isPast />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
};

const LeaveAdminRow = ({ leave, onDelete, deletingId, isActive, isPast }) => (
  <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
        isActive
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : isPast
          ? 'bg-stone-100 text-stone-400 dark:bg-stone-800'
          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
      }`}>
        <CalendarOff className="h-4 w-4" />
      </div>
      <div>
        <p className="font-medium text-stone-900 dark:text-stone-100">
          {leave.dentistId?.name || '-'}
        </p>
        <p className="text-sm text-stone-500">
          {formatDateRange(leave.startDate, leave.endDate)} - {leave.reason}
        </p>
        {leave.note && <p className="text-xs italic text-stone-400">{leave.note}</p>}
      </div>
    </div>
    {!isPast && (
      <button
        onClick={() => onDelete(leave._id)}
        disabled={deletingId === leave._id}
        className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 gap-1.5 text-sm"
      >
        <Trash2 className="h-4 w-4" />
        {deletingId === leave._id ? 'Membatalkan...' : 'Batalkan'}
      </button>
    )}
  </li>
);

export default AdminLeaves;
