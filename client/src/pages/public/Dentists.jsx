import { useEffect, useState } from 'react';
import { AlertTriangle, Stethoscope } from 'lucide-react';
import DentistCard from '../../components/cards/DentistCard';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { dentistService } from '../../services';
import { extractMessage } from '../../services/api';

const Dentists = () => {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dentistService
      .list()
      .then(setDentists)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container-app py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="section-kicker mb-4">Dokter</span>
        <h1 className="text-4xl md:text-5xl">Tim Dokter Kami</h1>
        <p className="section-copy mt-3">Bertemu dengan dokter gigi spesialis berpengalaman dan ramah.</p>
      </div>
      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Gagal memuat" description={error} />
      ) : dentists.length === 0 ? (
        <EmptyState icon={Stethoscope} title="Belum ada dokter" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentists.map((d) => <DentistCard key={d.user._id} entry={d} />)}
        </div>
      )}
    </div>
  );
};

export default Dentists;
