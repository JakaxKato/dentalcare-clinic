import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success('Akun berhasil dibuat!');
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractMessage(err, 'Registrasi gagal'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Buat Akun Pasien</h1>
        <p className="text-slate-600 text-sm text-center mt-2">Daftar untuk booking & pantau riwayat perawatan.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input label="Nama Lengkap" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="No. WhatsApp" name="phone" value={form.phone} onChange={handleChange} placeholder="+62..." />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
            hint="Minimal 6 karakter"
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-600 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
