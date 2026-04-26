import { useEffect, useState } from 'react';
import DentistCard from '../../components/cards/DentistCard';
import Loader from '../../components/common/Loader';
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
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl">Tim Dokter Kami</h1>
        <p className="text-slate-600 mt-3">Bertemu dengan dokter gigi spesialis berpengalaman dan ramah.</p>
      </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState icon="⚠️" title="Gagal memuat" description={error} />
      ) : dentists.length === 0 ? (
        <EmptyState icon="👨‍⚕️" title="Belum ada dokter" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dentists.map((d) => <DentistCard key={d.user._id} entry={d} />)}
        </div>
      )}
    </div>
  );
};

export default Dentists;
