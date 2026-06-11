import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { extractMessage } from '../../services/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, form.password);
      toast.success('Password berhasil diubah. Silakan login.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(extractMessage(err, 'Reset password gagal'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <p className="text-slate-600 text-sm text-center mt-2">Masukkan password baru Anda.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Password baru"
            type="password"
            name="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          <Input
            label="Konfirmasi password"
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Memproses...' : 'Simpan Password Baru'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-600 mt-5">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Kembali ke login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
