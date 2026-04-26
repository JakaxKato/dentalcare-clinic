import { Link } from 'react-router-dom';
import { formatDateShort } from '../../utils/format';

const ArticleCard = ({ article }) => (
  <Link to={`/blog/${article.slug}`} className="card overflow-hidden group hover:shadow-lg transition flex flex-col">
    <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
      {article.coverImage ? (
        <img src={article.coverImage} alt={article.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
      )}
    </div>
    <div className="p-5 flex-1 flex flex-col">
      <div className="flex flex-wrap gap-1.5 mb-2">
        {(article.tags || []).slice(0, 3).map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">#{t}</span>
        ))}
      </div>
      <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 line-clamp-2">{article.title}</h3>
      <p className="text-sm text-slate-500 mt-2 line-clamp-3 flex-1">{article.excerpt}</p>
      <p className="text-xs text-slate-400 mt-3">{formatDateShort(article.createdAt)}</p>
    </div>
  </Link>
);

export default ArticleCard;
