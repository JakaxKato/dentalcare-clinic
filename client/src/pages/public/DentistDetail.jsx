import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, UserCircle2 } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { dentistService } from '../../services';
import { formatCurrency } from '../../utils/format';
import { extractMessage } from '../../services/api';

const DentistDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dentistService
      .get(id)
      .then(setData)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullScreen />;
  if (error || !data)
    return (
      <div className="container-app py-12">
        <EmptyState icon={AlertTriangle} title="Dokter tidak ditemukan" description={error} />
      </div>
    );

  const { user, profile } = data;

  return (
    <div className="container-app grid gap-10 py-12 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <div className="card p-6 text-center">
          <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-[2rem] bg-brand-100 ring-4 ring-brand-50">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-brand-700">
                <UserCircle2 className="h-20 w-20" strokeWidth={1.4} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="mt-1 font-semibold text-brand-700">{profile?.specialization || 'General Dentistry'}</p>
          {profile?.experienceYears > 0 && (
            <p className="text-sm text-stone-500 mt-1">{profile.experienceYears} tahun pengalaman</p>
          )}
          <Link to={`/appointment?dentist=${user._id}`} className="btn-primary w-full mt-5">
            Book Konsultasi
          </Link>
        </div>
      </div>

      <div className="space-y-6 lg:col-span-2">
        {profile?.bio && (
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Tentang Dokter</h3>
            <p className="text-stone-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2">
          {profile?.education && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Pendidikan</h3>
              <p className="text-stone-700">{profile.education}</p>
            </div>
          )}
          {profile?.consultationFee > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Biaya Konsultasi</h3>
              <p className="text-stone-700">{formatCurrency(profile.consultationFee)}</p>
            </div>
          )}
          {profile?.availableDays && profile.availableDays.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Hari Praktik</h3>
              <div className="flex flex-wrap gap-2">
                {profile.availableDays.map((d) => (
                  <span key={d} className="badge bg-brand-100 text-brand-800">{d}</span>
                ))}
              </div>
            </div>
          )}
          {profile?.workingHours && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Jam Praktik</h3>
              <p className="text-stone-700">
                {profile.workingHours.start} - {profile.workingHours.end}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DentistDetail;
