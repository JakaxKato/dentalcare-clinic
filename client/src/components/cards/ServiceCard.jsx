import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { formatPriceRange } from "../../utils/format";

const ServiceCard = ({ service }) => (
  <Link
    to={`/services/${service.slug}`}
    className="card card-hover group flex flex-col overflow-hidden"
  >
    <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-50 to-amber-50">
      {service.image ? (
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-300">
          <Sparkles className="h-12 w-12" strokeWidth={1.2} />
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h3 className="font-semibold text-stone-900 transition-colors group-hover:text-brand-700 dark:text-stone-100 dark:group-hover:text-brand-400">
        {service.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
        {service.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-700 dark:text-brand-400">
          {formatPriceRange(service.priceRange)}
        </span>
        <span className="text-xs text-stone-400">{service.duration} mnt</span>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
