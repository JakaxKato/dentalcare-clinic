import { useState } from 'react';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services';
import { extractMessage } from '../../services/api';

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePwd = (e) => setPwd({ ...pwd, [e.target.name]: e.target.value });

  const submitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await userService.update(user._id, form);
      updateUser(updated);
      toast.success('Profil diperbarui');
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitPwd = async (e) => {
    e.preventDefault();
    if (pwd.next !== pwd.confirm) return toast.error('Konfirmasi password tidak cocok');
    if (pwd.next.length < 6) return toast.error('Password minimal 6 karakter');
    setLoading(true);
    try {
      await userService.update(user._id, { password: pwd.next });
      toast.success('Password berhasil diubah');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Profil Saya</h2>

      <form onSubmit={submitProfile} className="card p-6 space-y-4">
        <h3 className="font-semibold">Informasi Pribadi</h3>
        <Input label="Email" value={user.email} disabled />
        <Input label="Nama Lengkap" name="name" value={form.name} onChange={handle} required />
        <Input label="No. WhatsApp" name="phone" value={form.phone} onChange={handle} />
        <Input label="URL Avatar (opsional)" name="avatar" value={form.avatar} onChange={handle} />
        <button disabled={loading} className="btn-primary">Simpan Perubahan</button>
      </form>

      <form onSubmit={submitPwd} className="card p-6 space-y-4">
        <h3 className="font-semibold">Ubah Password</h3>
        <Input label="Password Baru" type="password" name="next" value={pwd.next} onChange={handlePwd} required />
        <Input label="Konfirmasi Password" type="password" name="confirm" value={pwd.confirm} onChange={handlePwd} required />
        <button disabled={loading} className="btn-secondary">Ubah Password</button>
      </form>
    </div>
  );
};

export default PatientProfile;
