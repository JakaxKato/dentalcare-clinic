import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { formatPriceRange } from '../../utils/format';

const ServiceCard = ({ service }) => (
  <Link
    to={`/services/${service.slug}`}
    className="card group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10"
  >
    <div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-brand-100 via-white to-brand-200">
      {service.image ? (
        <img src={service.image} alt={service.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-700">
          <Sparkles className="h-14 w-14" strokeWidth={1.4} />
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <h3 className="font-bold text-slate-950 transition group-hover:text-brand-800">{service.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{service.description}</p>
      <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-4">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">{formatPriceRange(service.priceRange)}</span>
        <span className="text-xs font-medium text-slate-500">{service.duration} mnt</span>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
