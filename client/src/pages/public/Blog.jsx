import { useEffect, useState } from 'react';
import { AlertTriangle, Newspaper } from 'lucide-react';
import ArticleCard from '../../components/cards/ArticleCard';
import { CardGridSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { articleService } from '../../services';
import { extractMessage } from '../../services/api';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    articleService
      .list()
      .then(setArticles)
      .catch((err) => setError(extractMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.tags || []).some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="container-app py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-4xl">Artikel & Edukasi</h1>
        <p className="text-slate-600 mt-3">Tips kesehatan gigi langsung dari dokter berpengalaman.</p>
      </div>
      <div className="max-w-md mx-auto mb-8">
        <input
          type="text"
          placeholder="Cari artikel atau tag..."
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Gagal memuat" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Newspaper} title="Belum ada artikel" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => <ArticleCard key={a._id} article={a} />)}
        </div>
      )}
    </div>
  );
};

export default Blog;
