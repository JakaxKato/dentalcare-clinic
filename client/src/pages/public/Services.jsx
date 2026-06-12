import { useEffect, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import ServiceCard from '../../components/cards/ServiceCard';
import Loader from '../../components/common/Loader';
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
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl">Layanan Klinik</h1>
        <p className="text-slate-600 mt-3">Layanan komprehensif dari pemeriksaan rutin hingga perawatan estetika.</p>
      </div>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Cari layanan..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
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
