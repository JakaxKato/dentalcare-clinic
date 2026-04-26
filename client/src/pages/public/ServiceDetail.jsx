import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
        <EmptyState icon="⚠️" title="Layanan tidak ditemukan" description={error} />
      </div>
    );

  return (
    <div className="container-app py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2">
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mb-6">
          {service.image ? (
            <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">🦷</div>
          )}
        </div>
        <h1 className="text-3xl">{service.title}</h1>
        <div className="mt-2 text-slate-500 text-sm">Durasi sesi: {service.duration} menit</div>
        <div className="prose prose-slate max-w-none mt-6 whitespace-pre-line text-slate-700 leading-relaxed">
          {service.description}
        </div>
      </div>
      <aside className="lg:col-span-1">
        <div className="card p-6 sticky top-24">
          <p className="text-sm text-slate-500">Estimasi Biaya</p>
          <p className="text-2xl font-bold text-brand-700 mt-1">{formatPriceRange(service.priceRange)}</p>
          <p className="text-xs text-slate-500 mt-1">*Konfirmasi akhir setelah pemeriksaan dokter.</p>
          <Link to={`/appointment?service=${service._id}`} className="btn-primary w-full mt-5">
            Book Layanan Ini
          </Link>
          <Link to="/services" className="btn-ghost w-full mt-2">← Kembali ke Layanan</Link>
        </div>
      </aside>
    </div>
  );
};

export default ServiceDetail;
