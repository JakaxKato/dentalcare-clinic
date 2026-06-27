import { useEffect, useState } from "react";
import { CalendarDays, CalendarCheck, Users, CheckCircle2 } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import { DashboardSkeleton } from "../../components/common/Skeleton";
import { appointmentService } from "../../services";
import { useToast } from "../../context/ToastContext";
import { extractMessage } from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    appointmentService
      .stats()
      .then(setStats)
      .catch((err) => toast.error(extractMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !stats) return <DashboardSkeleton cards={4} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Klinik</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Appointment"
          value={stats.totalAppointments}
          icon={<CalendarDays className="w-6 h-6" />}
        />
        <StatCard
          label="Hari Ini"
          value={stats.todayCount}
          icon={<CalendarCheck className="w-6 h-6" />}
        />
        <StatCard
          label="Pasien Baru (Bulan ini)"
          value={stats.newPatientsThisMonth}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          label="Selesai"
          value={stats.byStatus.completed}
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold mb-4">Status Appointment</h3>
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([k, v]) => {
              const total = stats.totalAppointments || 1;
              const pct = Math.round((v / total) * 100);
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{k}</span>
                    <span className="font-medium">
                      {v} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        k === "pending"
                          ? "bg-amber-400"
                          : k === "confirmed"
                            ? "bg-blue-500"
                            : k === "completed"
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-4">Layanan Paling Dipilih</h3>
          {stats.topServices.length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 text-sm">Belum ada data.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topServices.map((s, i) => (
                <li key={s.serviceId} className="flex justify-between text-sm">
                  <span>
                    {i + 1}. {s.title}
                  </span>
                  <span className="font-semibold">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="font-semibold mb-4">
            Dokter dengan Appointment Terbanyak
          </h3>
          {stats.topDentists.length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 text-sm">Belum ada data.</p>
          ) : (
            <ul className="space-y-2">
              {stats.topDentists.map((d, i) => (
                <li key={d.dentistId} className="flex justify-between text-sm">
                  <span>
                    {i + 1}. {d.name}
                  </span>
                  <span className="font-semibold">{d.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
