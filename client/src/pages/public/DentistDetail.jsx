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
    <div className="container-app py-12 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-1">
        <div className="card p-6 text-center">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-brand-100 mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-600">
                <UserCircle2 className="w-20 h-20" strokeWidth={1.4} />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-brand-600 mt-1">{profile?.specialization || 'General Dentistry'}</p>
          {profile?.experienceYears > 0 && (
            <p className="text-sm text-slate-500 mt-1">{profile.experienceYears} tahun pengalaman</p>
          )}
          <Link to={`/appointment?dentist=${user._id}`} className="btn-primary w-full mt-5">
            Book Konsultasi
          </Link>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {profile?.bio && (
          <div className="card p-6">
            <h3 className="font-semibold mb-2">Tentang Dokter</h3>
            <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-6">
          {profile?.education && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Pendidikan</h3>
              <p className="text-slate-700">{profile.education}</p>
            </div>
          )}
          {profile?.consultationFee > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Biaya Konsultasi</h3>
              <p className="text-slate-700">{formatCurrency(profile.consultationFee)}</p>
            </div>
          )}
          {profile?.availableDays && profile.availableDays.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold mb-2">Hari Praktik</h3>
              <div className="flex flex-wrap gap-2">
                {profile.availableDays.map((d) => (
                  <span key={d} className="badge bg-brand-50 text-brand-700">{d}</span>
                ))}
              </div>
            </div>
          )}
          {profile?.workingHours && (
            <div className="card p-6">
              <h3 className="font-semibold mb-1">Jam Praktik</h3>
              <p className="text-slate-700">
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
