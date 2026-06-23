import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Sparkles } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { serviceService } from '../../services';
import { formatPriceRange } from '../../utils/format';
import { extractMessage } from '../../services/api';

const ServiceDetail = () => {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    serviceService
      .getBySlug(slug)
      .then(setService)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader fullScreen />;
  if (error || !service)
    return (
      <div className="container-app py-12">
        <EmptyState icon={AlertTriangle} title="Layanan tidak ditemukan" description={error} />
      </div>
    );

  return (
    <div className="container-app grid gap-10 py-12 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-6 aspect-[16/9] overflow-hidden rounded-[2rem] border border-white bg-brand-50 shadow-xl shadow-brand-900/10">
          {service.image ? (
            <img src={service.image} alt={service.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-brand-700">
              <Sparkles className="h-20 w-20" strokeWidth={1.4} />
            </div>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl">{service.title}</h1>
        <div className="mt-3 inline-flex rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-800">
          Durasi sesi: {service.duration} menit
        </div>
        <div className="prose prose-slate mt-6 max-w-none whitespace-pre-line leading-relaxed text-slate-700">
          {service.description}
        </div>
      </div>
      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-24">
          <p className="text-sm text-slate-500">Estimasi Biaya</p>
          <p className="mt-1 text-2xl font-extrabold text-brand-800">{formatPriceRange(service.priceRange)}</p>
          <p className="mt-1 text-xs text-slate-500">*Konfirmasi akhir setelah pemeriksaan dokter.</p>
          <Link to={`/appointment?service=${service._id}`} className="btn-primary mt-5 w-full">
            Book Layanan Ini
          </Link>
          <Link to="/services" className="btn-ghost mt-2 w-full">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Layanan
          </Link>
        </div>
      </aside>
    </div>
  );
};

export default ServiceDetail;
