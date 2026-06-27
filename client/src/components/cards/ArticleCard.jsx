import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { formatDateShort } from '../../utils/format';

const ArticleCard = ({ article }) => (
  <Link to={`/blog/${article.slug}`} className="card group flex flex-col overflow-hidden transition duration-300 hover:-transtone-y-1 hover:shadow-xl hover:shadow-brand-900/10">
    <div className="aspect-[16/9] overflow-hidden bg-brand-50">
      {article.coverImage ? (
        <img src={article.coverImage} alt={article.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-brand-700">
          <Newspaper className="h-12 w-12" strokeWidth={1.4} />
        </div>
      )}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {(article.tags || []).slice(0, 3).map((t) => (
          <span key={t} className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800">#{t}</span>
        ))}
      </div>
      <h3 className="line-clamp-2 font-bold text-stone-950 group-hover:text-brand-800">{article.title}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500">{article.excerpt}</p>
      <p className="mt-3 text-xs font-medium text-stone-400">{formatDateShort(article.createdAt)}</p>
    </div>
  </Link>
);

export default ArticleCard;
