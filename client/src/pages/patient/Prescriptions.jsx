import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill, Printer } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { prescriptionService } from '../../services';
import { formatDate } from '../../utils/format';

const PatientPrescriptions = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.list().then(setList).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Resep Saya</h2>

      {list.length === 0 ? (
        <EmptyState icon={Pill} title="Belum ada resep" />
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <div key={p._id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{formatDate(p.createdAt)}</p>
                <p className="text-sm text-stone-500">
                  drg. {p.dentistId?.name} · {p.items.length} obat
                </p>
                {p.appointmentId?.serviceId?.title && (
                  <p className="text-xs text-stone-500 mt-1">{p.appointmentId.serviceId.title}</p>
                )}
              </div>
              <Link to={`/print/prescription/${p._id}`} target="_blank" className="btn-ghost text-sm inline-flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> Lihat / Print
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
