import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { serviceService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatPriceRange } from '../../utils/format';
import { extractMessage } from '../../services/api';

const empty = {
  title: '', description: '', priceRangeMin: 0, priceRangeMax: 0,
  duration: 30, image: '', isActive: true,
};

const AdminServices = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    serviceService.list().then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal({ mode: 'create' }); };
  const openEdit = (s) => {
    setForm({
      title: s.title,
      description: s.description,
      priceRangeMin: s.priceRange?.min || 0,
      priceRangeMax: s.priceRange?.max || 0,
      duration: s.duration,
      image: s.image || '',
      isActive: s.isActive,
    });
    setModal({ mode: 'edit', data: s });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      description: form.description,
      duration: Number(form.duration),
      image: form.image,
      isActive: form.isActive,
      priceRange: { min: Number(form.priceRangeMin), max: Number(form.priceRangeMax) },
    };
    try {
      if (modal.mode === 'create') {
        await serviceService.create(payload);
        toast.success('Layanan ditambahkan');
      } else {
        await serviceService.update(modal.data._id, payload);
        toast.success('Layanan diperbarui');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus layanan ini?')) return;
    try {
      await serviceService.remove(id);
      toast.success('Layanan dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Layanan</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Tambah Layanan</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🛠️" title="Belum ada layanan" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s._id} className="card p-5 flex flex-col">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold">{s.title}</h3>
                <span className={`badge ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {s.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{formatPriceRange(s.priceRange)} · {s.duration} mnt</p>
              <p className="text-sm text-slate-600 mt-2 line-clamp-3 flex-1">{s.description}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(s)} className="btn-secondary text-xs flex-1">Edit</button>
                <button onClick={() => remove(s._id)} className="btn-danger text-xs">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Tambah Layanan' : 'Edit Layanan'} size="lg">
        <form onSubmit={submit} className="space-y-3">
          <Input label="Judul" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Deskripsi" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid sm:grid-cols-3 gap-3">
            <Input label="Harga Min" type="number" value={form.priceRangeMin} onChange={(e) => setForm({ ...form, priceRangeMin: e.target.value })} />
            <Input label="Harga Max" type="number" value={form.priceRangeMax} onChange={(e) => setForm({ ...form, priceRangeMax: e.target.value })} />
            <Input label="Durasi (menit)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <Input label="URL Gambar" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm">Aktif</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-ghost">Batal</button>
            <button disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServices;
