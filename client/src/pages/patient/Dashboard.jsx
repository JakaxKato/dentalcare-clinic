import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, CheckCircle2, Lightbulb } from 'lucide-react';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { appointmentService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/format';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { settings } = useClinic();
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.mine().then(setAppts).finally(() => setLoading(false));
  }, []);

  const upcoming = appts.filter((a) => ['pending', 'confirmed'].includes(a.status));
  const completed = appts.filter((a) => a.status === 'completed').length;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Halo, {user.name}</h2>
        <p className="text-slate-600">
          Ringkasan aktivitas Anda di {settings.clinicName || CLINIC.shortName}.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Appointment" value={appts.length} icon={<CalendarDays className="w-6 h-6" />} />
        <StatCard label="Upcoming" value={upcoming.length} icon={<Clock className="w-6 h-6" />} />
        <StatCard label="Selesai" value={completed} icon={<CheckCircle2 className="w-6 h-6" />} />
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Appointment Mendatang</h3>
          <Link to="/patient/appointments" className="text-sm text-brand-600 hover:underline">Lihat semua</Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Belum ada appointment"
            description="Yuk mulai dengan membuat appointment pertama Anda."
            action={<Link to="/appointment" className="btn-primary">Book Sekarang</Link>}
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium">{a.serviceId?.title || '-'}</p>
                  <p className="text-sm text-slate-500">
                    {a.dentistId?.name || '-'} · {formatDateTime(a.appointmentDate, a.appointmentTime)}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" /> Tips Hari Ini
        </h3>
        <p className="text-slate-600 text-sm">
          Sikat gigi tidak hanya tentang lamanya, tapi juga teknik. Sikat 2 menit dengan gerakan kecil, lembut, dan
          jangkau seluruh permukaan gigi termasuk gusi.
        </p>
      </div>
    </div>
  );
};

export default PatientDashboard;
