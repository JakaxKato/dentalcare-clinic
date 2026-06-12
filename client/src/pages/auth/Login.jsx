import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const loginSchema = z.object({
  email: z.string().trim().email('Masukkan alamat email yang valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const Login = () => {
  const { login } = useAuth();
  const { settings } = useClinic();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = async (form) => {
    try {
      const user = await login(form);
      toast.success(`Selamat datang, ${user.name}!`);
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      const target =
        user.role === 'admin'
          ? '/admin/dashboard'
          : user.role === 'dentist'
            ? '/dentist/dashboard'
            : '/patient/dashboard';
      navigate(target, { replace: true });
    } catch (error) {
      toast.error(extractMessage(error, 'Login gagal'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Masuk ke Akun Anda</h1>
        <p className="text-slate-600 text-sm text-center mt-2">
          Selamat datang kembali di {settings.clinicName}!
        </p>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            placeholder="anda@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="********"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          <Link to="/forgot-password" className="text-brand-600 hover:underline">
            Lupa password?
          </Link>
        </p>
        <p className="text-sm text-center text-slate-600 mt-2">
          Belum punya akun?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">
            Daftar
          </Link>
        </p>
        <div className="mt-6 p-3 bg-slate-50 rounded-lg text-xs text-slate-600">
          <p className="font-semibold mb-1">Akun demo untuk preview:</p>
          <ul className="space-y-0.5">
            <li>admin@dentalcare.id / password123 (Admin)</li>
            <li>sarah@dentalcare.id / password123 (Dokter)</li>
            <li>patient@dentalcare.id / password123 (Pasien)</li>
          </ul>
          <p className="text-[10px] text-slate-400 mt-2 italic">
            Akun demo hanya untuk preview. Pada produksi, akun dibuat melalui alur resmi klinik.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
