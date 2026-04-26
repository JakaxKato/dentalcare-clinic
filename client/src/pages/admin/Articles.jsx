import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { articleService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { extractMessage } from '../../services/api';

const empty = { title: '', content: '', excerpt: '', coverImage: '', tags: '', published: false };

const AdminArticles = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    setLoading(true);
    articleService.list().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal({ mode: 'create' }); };
  const openEdit = (a) => {
    setForm({
      title: a.title,
      content: a.content,
      excerpt: a.excerpt || '',
      coverImage: a.coverImage || '',
      tags: (a.tags || []).join(', '),
      published: a.published,
    });
    setModal({ mode: 'edit', data: a });
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (modal.mode === 'create') {
        await articleService.create(payload);
        toast.success('Artikel ditambahkan');
      } else {
        await articleService.update(modal.data._id, payload);
        toast.success('Artikel diperbarui');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const togglePublish = async (a) => {
    try {
      await articleService.update(a._id, { published: !a.published });
      toast.success(`Artikel ${!a.published ? 'dipublikasi' : 'di-unpublish'}`);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus artikel ini?')) return;
    try {
      await articleService.remove(id);
      toast.success('Artikel dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Artikel</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Tulis Artikel</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="📰" title="Belum ada artikel" />
      ) : (
        <div className="card divide-y divide-slate-100">
          {items.map((a) => (
            <div key={a._id} className="p-4 flex flex-wrap items-center gap-4 justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.title}</p>
                  <span className={`badge ${a.published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                    {a.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {(a.tags || []).map((t) => `#${t}`).join(' ')} · {formatDate(a.createdAt)}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => togglePublish(a)} className="btn-ghost text-xs">
                  {a.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => openEdit(a)} className="btn-secondary text-xs">Edit</button>
                <button onClick={() => remove(a._id)} className="btn-danger text-xs">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Tulis Artikel' : 'Edit Artikel'} size="xl">
        <form onSubmit={submit} className="space-y-3">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="URL Cover Image" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <Input label="Tags (pisahkan dengan koma)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <Textarea label="Excerpt (ringkas)" rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <Textarea label="Konten" rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <span className="text-sm">Publish ke website</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-ghost">Batal</button>
            <button className="btn-primary">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminArticles;
