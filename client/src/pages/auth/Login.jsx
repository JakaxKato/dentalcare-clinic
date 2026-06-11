import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';
import { CLINIC } from '../../config/clinic';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(form);
      toast.success(`Selamat datang, ${u.name}!`);
      const from = location.state?.from;
      if (from) return navigate(from, { replace: true });
      const target =
        u.role === 'admin' ? '/admin/dashboard' : u.role === 'dentist' ? '/dentist/dashboard' : '/patient/dashboard';
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(extractMessage(err, 'Login gagal'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Masuk ke Akun Anda</h1>
        <p className="text-slate-600 text-sm text-center mt-2">Selamat datang kembali di {CLINIC.shortName}!</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="anda@email.com"
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          <Link to="/forgot-password" className="text-brand-600 hover:underline">Lupa password?</Link>
        </p>
        <p className="text-sm text-center text-slate-600 mt-2">
          Belum punya akun?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">Daftar</Link>
        </p>
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
          <p className="font-semibold mb-1">Akun demo untuk preview:</p>
          <ul className="space-y-0.5">
            <li>admin@dentalcare.id / password123 (Admin)</li>
            <li>sarah@dentalcare.id / password123 (Dokter)</li>
            <li>patient@dentalcare.id / password123 (Pasien)</li>
          </ul>
          <p className="text-[10px] text-slate-400 mt-2 italic">
            Catatan: akun demo ini hanya untuk preview. Pada deploy produksi, akun dibuat oleh admin klinik.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
