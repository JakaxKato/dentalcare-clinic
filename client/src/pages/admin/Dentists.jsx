import { useEffect, useState } from 'react';
import Modal from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { dentistService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const empty = {
  name: '', email: '', password: '', phone: '', avatar: '',
  specialization: '', experienceYears: 0, education: '', bio: '',
  consultationFee: 0,
};

const AdminDentists = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // {mode: 'create'|'edit', data}
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    dentistService.list().then(setItems).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setModal({ mode: 'create' }); };
  const openEdit = (entry) => {
    setForm({
      name: entry.user.name,
      email: entry.user.email,
      password: '',
      phone: entry.user.phone || '',
      avatar: entry.user.avatar || '',
      specialization: entry.profile?.specialization || '',
      experienceYears: entry.profile?.experienceYears || 0,
      education: entry.profile?.education || '',
      bio: entry.profile?.bio || '',
      consultationFee: entry.profile?.consultationFee || 0,
    });
    setModal({ mode: 'edit', data: entry });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await dentistService.create(form);
        toast.success('Dokter ditambahkan');
      } else {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await dentistService.update(modal.data.user._id, payload);
        toast.success('Dokter diperbarui');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (entry) => {
    try {
      await dentistService.update(entry.user._id, { isActive: !entry.user.isActive });
      toast.success(`Dokter ${!entry.user.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus dokter ini? Tindakan tidak dapat dibatalkan.')) return;
    try {
      await dentistService.remove(id);
      toast.success('Dokter dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manajemen Dokter</h2>
        <button onClick={openCreate} className="btn-primary text-sm">+ Tambah Dokter</button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="👨‍⚕️" title="Belum ada dokter" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Spesialisasi</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((d) => (
                <tr key={d.user._id}>
                  <td className="px-4 py-3 font-medium">{d.user.name}</td>
                  <td className="px-4 py-3 text-slate-600">{d.profile?.specialization || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{d.user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${d.user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {d.user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <button onClick={() => openEdit(d)} className="btn-secondary text-xs">Edit</button>
                    <button onClick={() => toggleActive(d)} className="btn-ghost text-xs">
                      {d.user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button onClick={() => remove(d.user._id)} className="btn-danger text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'create' ? 'Tambah Dokter' : 'Edit Dokter'} size="lg">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Nama" name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              label={modal?.mode === 'create' ? 'Password' : 'Password (kosongkan jika tidak diubah)'}
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={modal?.mode === 'create'}
              minLength={6}
            />
            <Input label="No. Telepon" name="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <Input label="URL Avatar" name="avatar" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label="Spesialisasi" name="specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Input label="Tahun Pengalaman" type="number" name="experienceYears" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          </div>
          <Input label="Pendidikan" name="education" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <Textarea label="Bio" name="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input label="Biaya Konsultasi (IDR)" type="number" name="consultationFee" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModal(null)} className="btn-ghost">Batal</button>
            <button disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDentists;
