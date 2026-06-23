import { Link } from 'react-router-dom';
import { UserCircle2 } from 'lucide-react';

const DentistCard = ({ entry }) => {
  const { user, profile } = entry;
  return (
    <Link to={`/dentists/${user._id}`} className="card group flex gap-4 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-3xl bg-brand-100 ring-4 ring-brand-50">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-700">
            <UserCircle2 className="h-12 w-12" strokeWidth={1.4} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="truncate font-bold text-slate-950 group-hover:text-brand-800">{user.name}</h3>
        <p className="text-sm font-semibold text-brand-700">{profile?.specialization || 'General Dentistry'}</p>
        <p className="mt-1 text-xs text-slate-500">
          {profile?.experienceYears ? `${profile.experienceYears} thn pengalaman` : ''}
        </p>
        {profile?.bio && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{profile.bio}</p>}
      </div>
    </Link>
  );
};

export default DentistCard;
