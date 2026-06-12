import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { testimonialService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const StarRow = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-4 h-4 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
      />
    ))}
  </div>
);

const AdminTestimonials = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    testimonialService.list().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggle = async (t) => {
    try {
      await testimonialService.approve(t._id, !t.isApproved);
      toast.success(`Testimoni ${!t.isApproved ? 'disetujui' : 'disembunyikan'}`);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus testimoni?')) return;
    try {
      await testimonialService.remove(id);
      toast.success('Testimoni dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manajemen Testimoni</h2>

      {items.length === 0 ? (
        <EmptyState icon={Star} title="Belum ada testimoni" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t._id} className="card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{t.patientName}</p>
                  <StarRow rating={t.rating} />
                </div>
                <span className={`badge ${t.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t.isApproved ? 'Disetujui' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-slate-700 mt-3 italic">"{t.message}"</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => toggle(t)} className="btn-secondary text-xs flex-1">
                  {t.isApproved ? 'Sembunyikan' : 'Setujui'}
                </button>
                <button onClick={() => remove(t._id)} className="btn-danger text-xs">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
