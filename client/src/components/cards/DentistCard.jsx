import { Link } from 'react-router-dom';
import { UserCircle2 } from 'lucide-react';

const DentistCard = ({ entry }) => {
  const { user, profile } = entry;
  return (
    <Link to={`/dentists/${user._id}`} className="card p-5 flex gap-4 hover:shadow-lg transition group">
      <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-100 flex-shrink-0">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-600">
            <UserCircle2 className="w-12 h-12" strokeWidth={1.4} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 truncate">{user.name}</h3>
        <p className="text-sm text-brand-600">{profile?.specialization || 'General Dentistry'}</p>
        <p className="text-xs text-slate-500 mt-1">
          {profile?.experienceYears ? `${profile.experienceYears} thn pengalaman` : ''}
        </p>
        {profile?.bio && <p className="text-sm text-slate-600 mt-2 line-clamp-2">{profile.bio}</p>}
      </div>
    </Link>
  );
};

export default DentistCard;
