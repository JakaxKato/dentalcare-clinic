import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { articleService } from '../../services';
import { formatDate } from '../../utils/format';
import { extractMessage } from '../../services/api';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

const ArticleDetail = () => {
  const { slug } = useParams();
  const { settings } = useClinic();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    articleService
      .getBySlug(slug)
      .then(setArticle)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader fullScreen />;
  if (error || !article)
    return (
      <div className="container-app py-12">
        <EmptyState icon={AlertTriangle} title="Artikel tidak ditemukan" description={error} />
      </div>
    );

  return (
    <article className="container-app py-12 max-w-3xl">
      <Link to="/blog" className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Blog
      </Link>
      <div className="flex flex-wrap gap-2 mt-6">
        {(article.tags || []).map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 bg-brand-50 text-brand-700 rounded-full">#{t}</span>
        ))}
      </div>
      <h1 className="text-4xl mt-3">{article.title}</h1>
      <div className="flex items-center gap-3 mt-4 text-sm text-slate-500">
        <span>{article.authorId?.name || settings.clinicName || CLINIC.shortName}</span>
        <span>•</span>
        <span>{formatDate(article.createdAt)}</span>
      </div>
      {article.coverImage && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mt-6">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="prose prose-slate max-w-none mt-8 whitespace-pre-line text-slate-700 leading-relaxed">
        {article.content}
      </div>
    </article>
  );
};

export default ArticleDetail;
