import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
    email: z.string().trim().email('Masukkan alamat email yang valid'),
    phone: z.string().trim().max(30, 'Nomor telepon terlalu panjang'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirm'],
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirm: '' },
  });

  const submit = async (values) => {
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });
      toast.success('Akun berhasil dibuat!');
      navigate('/patient/dashboard', { replace: true });
    } catch (error) {
      toast.error(extractMessage(error, 'Registrasi gagal'));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md card p-8">
        <h1 className="text-2xl font-bold text-center">Buat Akun Pasien</h1>
        <p className="text-slate-600 text-sm text-center mt-2">
          Daftar untuk booking dan pantau riwayat perawatan.
        </p>
        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4" noValidate>
          <Input
            label="Nama Lengkap"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="No. WhatsApp"
            placeholder="+62..."
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="Minimal 6 karakter"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register('confirm')}
          />
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="text-sm text-center text-slate-600 mt-5">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
