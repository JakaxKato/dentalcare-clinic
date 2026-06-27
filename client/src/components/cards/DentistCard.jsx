import { Link } from "react-router-dom";
import { UserCircle2 } from "lucide-react";

const DentistCard = ({ entry }) => {
  const { user, profile } = entry;
  return (
    <Link
      to={`/dentists/${user._id}`}
      className="card card-hover group flex gap-4 p-5"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-stone-100 ring-4 ring-stone-50 dark:bg-stone-800 dark:ring-stone-900">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400 dark:text-stone-500">
            <UserCircle2 className="h-12 w-12" strokeWidth={1.4} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 pt-1">
        <h3 className="truncate font-semibold text-stone-900 transition-colors group-hover:text-brand-700 dark:text-stone-100 dark:group-hover:text-brand-400">
          {user.name}
        </h3>
        <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
          {profile?.specialization || "General Dentistry"}
        </p>
        <p className="mt-1 text-xs text-stone-400 dark:text-stone-500">
          {profile?.experienceYears
            ? `${profile.experienceYears} thn pengalaman`
            : ""}
        </p>
        {profile?.bio && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
            {profile.bio}
          </p>
        )}
      </div>
    </Link>
  );
};

export default DentistCard;
