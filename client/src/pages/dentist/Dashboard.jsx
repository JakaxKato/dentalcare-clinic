import { useEffect, useState } from "react";
import { CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import StatCard from "../../components/dashboard/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { DashboardSkeleton } from "../../components/common/Skeleton";
import { appointmentService } from "../../services";
import { useAuth } from "../../context/AuthContext";
import { formatDateTime } from "../../utils/format";

const DentistDashboard = () => {
  const { user } = useAuth();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService
      .list()
      .then(setAppts)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todays = appts.filter(
    (a) => new Date(a.appointmentDate).toDateString() === today,
  );
  const upcoming = appts.filter(
    (a) =>
      ["pending", "confirmed"].includes(a.status) &&
      new Date(a.appointmentDate) >= new Date(),
  );
  const completed = appts.filter((a) => a.status === "completed").length;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          Selamat datang, drg. {user.name.replace(/^drg\.\s*/, "")}
        </h2>
        <p className="text-stone-500 dark:text-stone-400">
          Ringkasan praktik Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pasien Hari Ini"
          value={todays.length}
          icon={<CalendarCheck className="w-6 h-6" />}
        />
        <StatCard
          label="Upcoming"
          value={upcoming.length}
          icon={<Clock className="w-6 h-6" />}
        />
        <StatCard
          label="Selesai (total)"
          value={completed}
          icon={<CheckCircle2 className="w-6 h-6" />}
        />
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">Jadwal Hari Ini</h3>
        {todays.length === 0 ? (
          <p className="text-stone-500 text-sm dark:text-stone-400">
            Tidak ada appointment hari ini.
          </p>
        ) : (
          <div className="space-y-2">
            {todays.map((a) => (
              <div
                key={a._id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 dark:bg-stone-800/50 dark:border-stone-700/50"
              >
                <div>
                  <p className="font-medium">
                    {a.patientId?.name} - {a.serviceId?.title}
                  </p>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {formatDateTime(a.appointmentDate, a.appointmentTime)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DentistDashboard;
