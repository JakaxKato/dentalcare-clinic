import { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services';
import { extractMessage } from '../../services/api';

const ForgotPassword = () => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      toast.error(extractMessage(err, 'Gagal mengirim email reset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Lupa Password</h1>
        <p className="text-stone-600 text-sm text-center mt-2">
          Masukkan email Anda. Kami akan mengirim tautan reset jika email terdaftar.
        </p>

        {sent ? (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            Jika email <strong>{email}</strong> terdaftar, tautan reset password telah dikirim.
            Silakan cek inbox (dan folder spam) Anda. Tautan berlaku 30 menit.
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anda@email.com"
              required
              autoComplete="email"
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Memproses...' : 'Kirim Tautan Reset'}
            </button>
          </form>
        )}

        <p className="text-sm text-center text-stone-600 mt-5">
          <Link to="/login" className="text-brand-600 font-medium hover:underline">Kembali ke login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
