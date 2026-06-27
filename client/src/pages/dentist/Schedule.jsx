import { useEffect, useState } from "react";
import { CalendarOff, Plus, Trash2, AlertTriangle } from "lucide-react";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import { dentistLeaveService } from "../../services";
import { useToast } from "../../context/ToastContext";
import { extractMessage } from "../../services/api";

const REASONS = [
  "Cuti",
  "Sakit",
  "Seminar/Pelatihan",
  "Urusan Keluarga",
  "Lainnya",
];

const todayStr = () => new Date().toISOString().slice(0, 10);

const formatDateRange = (start, end) => {
  const opts = { day: "numeric", month: "long", year: "numeric" };
  const s = new Date(start).toLocaleDateString("id-ID", opts);
  const e = new Date(end).toLocaleDateString("id-ID", opts);
  return s === e ? s : `${s} - ${e}`;
};

const isActiveLeave = (leave) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(leave.startDate) <= today && new Date(leave.endDate) >= today;
};

const isUpcoming = (leave) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(leave.startDate) > today;
};

const emptyForm = {
  startDate: todayStr(),
  endDate: todayStr(),
  reason: "Cuti",
  note: "",
};

const DentistSchedule = () => {
  const toast = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    dentistLeaveService
      .list()
      .then((r) => setLeaves(r.data || []))
      .catch((err) => toast.error(extractMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpen = () => {
    setForm(emptyForm);
    setConflicts(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.endDate < form.startDate) {
      toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
      return;
    }
    setSaving(true);
    setConflicts(null);
    try {
      const res = await dentistLeaveService.create(form);
      if (res.conflicts) {
        setConflicts(res.conflicts);
        toast.info(`Cuti disimpan. ${res.conflicts.message}`);
      } else {
        toast.success("Jadwal cuti berhasil ditambahkan");
      }
      load();
      if (!res.conflicts) setShowModal(false);
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin membatalkan cuti ini?")) return;
    setDeletingId(id);
    try {
      await dentistLeaveService.remove(id);
      toast.success("Jadwal cuti dibatalkan");
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const activeLeaves = leaves.filter(isActiveLeave);
  const upcomingLeaves = leaves.filter(isUpcoming);
  const pastLeaves = leaves.filter((l) => !isActiveLeave(l) && !isUpcoming(l));

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">
            Jadwal Cuti &amp; Ketidakhadiran
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Kelola tanggal cuti Anda. Pasien tidak dapat booking pada periode
            ini.
          </p>
        </div>
        <button onClick={handleOpen} className="btn-primary gap-2">
          <Plus className="h-4 w-4" /> Tambah Cuti
        </button>
      </div>

      {/* Status banner — active leave */}
      {activeLeaves.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
          <CalendarOff className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Anda sedang dalam periode cuti
            </p>
            {activeLeaves.map((l) => (
              <p
                key={l._id}
                className="text-sm text-amber-700 dark:text-amber-400"
              >
                {formatDateRange(l.startDate, l.endDate)} - {l.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      <div className="card overflow-hidden">
        <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
          <h3 className="font-semibold text-stone-900 dark:text-stone-100">
            Jadwal Mendatang
          </h3>
        </div>
        {upcomingLeaves.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="Tidak ada jadwal cuti mendatang"
            description="Klik 'Tambah Cuti' untuk menambahkan jadwal tidak bisa praktek."
          />
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {upcomingLeaves.map((l) => (
              <LeaveRow
                key={l._id}
                leave={l}
                onDelete={handleDelete}
                deletingId={deletingId}
                canDelete
              />
            ))}
          </ul>
        )}
      </div>

      {/* Past */}
      {pastLeaves.length > 0 && (
        <div className="card overflow-hidden">
          <div className="border-b border-stone-100 px-6 py-4 dark:border-stone-800">
            <h3 className="font-semibold text-stone-500 dark:text-stone-400">
              Riwayat Cuti
            </h3>
          </div>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {pastLeaves.slice(0, 10).map((l) => (
              <LeaveRow
                key={l._id}
                leave={l}
                onDelete={handleDelete}
                deletingId={deletingId}
                canDelete={false}
              />
            ))}
          </ul>
        </div>
      )}

      {/* Modal: add leave */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Jadwal Cuti"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tanggal Mulai</label>
              <input
                type="date"
                className="input"
                min={todayStr()}
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="label">Tanggal Selesai</label>
              <input
                type="date"
                className="input"
                min={form.startDate || todayStr()}
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Alasan</label>
            <select
              className="input"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
            >
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Catatan (opsional)</label>
            <textarea
              className="input min-h-[72px] resize-none"
              placeholder="Catatan tambahan untuk admin..."
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              maxLength={500}
            />
          </div>

          {/* Conflict warning after save */}
          {conflicts && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800/40 dark:bg-red-900/20">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-sm text-red-700 dark:text-red-400">
                <p className="font-medium">{conflicts.message}</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {conflicts.appointments.map((a) => (
                    <li key={a._id}>
                      {a.patient} -{" "}
                      {new Date(a.date).toLocaleDateString("id-ID")} {a.time}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  Cuti sudah disimpan. Hubungi admin untuk reschedule
                  appointment di atas.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={saving}
            >
              {saving ? "Menyimpan..." : "Simpan Cuti"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const LeaveRow = ({ leave, onDelete, deletingId, canDelete }) => {
  const isActive = isActiveLeave(leave);
  const isDeleting = deletingId === leave._id;

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            isActive
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : "bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
          }`}
        >
          <CalendarOff className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-stone-900 dark:text-stone-100">
              {formatDateRange(leave.startDate, leave.endDate)}
            </p>
            {isActive && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Aktif
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {leave.reason}
          </p>
          {leave.note && (
            <p className="mt-0.5 text-xs text-stone-400 dark:text-stone-500 italic">
              {leave.note}
            </p>
          )}
        </div>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(leave._id)}
          disabled={isDeleting}
          className="btn-ghost text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 gap-1.5 text-sm"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? "Membatalkan..." : "Batalkan"}
        </button>
      )}
    </li>
  );
};

export default DentistSchedule;
