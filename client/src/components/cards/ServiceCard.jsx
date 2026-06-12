import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { formatPriceRange } from '../../utils/format';

const ServiceCard = ({ service }) => (
  <Link
    to={`/services/${service.slug}`}
    className="card overflow-hidden group hover:shadow-lg transition flex flex-col"
  >
    <div className="aspect-[16/10] bg-gradient-to-br from-brand-100 to-accent-400/30 overflow-hidden">
      {service.image ? (
        <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-brand-500">
          <Sparkles className="w-14 h-14" strokeWidth={1.4} />
        </div>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <h3 className="font-semibold text-slate-800 group-hover:text-brand-700">{service.title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 flex-1">{service.description}</p>
      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
        <span className="text-sm font-semibold text-brand-700">{formatPriceRange(service.priceRange)}</span>
        <span className="text-xs text-slate-500">{service.duration} mnt</span>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
