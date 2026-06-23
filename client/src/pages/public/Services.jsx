import { useEffect, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import ServiceCard from '../../components/cards/ServiceCard';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { serviceService } from '../../services';
import { extractMessage } from '../../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    serviceService
      .list(true)
      .then(setServices)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = services.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container-app py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="section-kicker mb-4">Layanan</span>
        <h1 className="text-4xl md:text-5xl">Layanan Klinik</h1>
        <p className="section-copy mt-3">Layanan komprehensif dari pemeriksaan rutin hingga perawatan estetika.</p>
      </div>
      <div className="mx-auto mb-8 max-w-md">
        <input
          type="text"
          placeholder="Cari layanan..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Gagal memuat layanan" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Layanan tidak ditemukan" description="Coba kata kunci lain." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => <ServiceCard key={s._id} service={s} />)}
        </div>
      )}
    </div>
  );
};

export default Services;
