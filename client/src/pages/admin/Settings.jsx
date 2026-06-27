import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Palette, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input, Textarea } from '../../components/common/Input';
import { FormSkeleton } from '../../components/common/Skeleton';
import { useClinic } from '../../context/ClinicContext';
import { useToast } from '../../context/ToastContext';
import { clinicSettingsService } from '../../services';
import { extractMessage } from '../../services/api';

const HEX_RE = /^#([0-9a-fA-F]{3}){1,2}$/;
const optionalUrl = z
  .string()
  .trim()
  .refine((value) => !value || /^https?:\/\/\S+$/i.test(value), 'Gunakan URL http:// atau https://');

const settingsSchema = z.object({
  clinicName: z.string().trim().min(1, 'Nama klinik wajib diisi').max(120),
  tagline: z.string().trim().max(200),
  logoUrl: optionalUrl,
  faviconUrl: optionalUrl,
  primaryColor: z.string().regex(HEX_RE, 'Format warna harus berupa hex, contoh #f59e0b'),
  accentColor: z.string().regex(HEX_RE, 'Format warna harus berupa hex, contoh #facc15'),
  address: z.string().trim().max(500),
  mapEmbedUrl: optionalUrl,
  phone: z.string().trim().max(50),
  email: z
    .string()
    .trim()
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'Email tidak valid'),
  whatsapp: z.string().trim().max(50),
  instagram: z.string().trim().max(120),
  operatingHours: z.string().trim().max(300),
  footerNote: z.string().trim().max(300),
});

const defaultValues = {
  clinicName: '',
  tagline: '',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#f59e0b',
  accentColor: '#facc15',
  address: '',
  mapEmbedUrl: '',
  phone: '',
  email: '',
  whatsapp: '',
  instagram: '',
  operatingHours: '',
  footerNote: '',
};

const AdminSettings = () => {
  const toast = useToast();
  const { applySettings } = useClinic();
  const [loading, setLoading] = useState(true);
  const {
    register,
    reset,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  });

  const primaryColor = watch('primaryColor');
  const accentColor = watch('accentColor');

  useEffect(() => {
    let active = true;
    clinicSettingsService
      .get()
      .then((data) => {
        if (active) reset({ ...defaultValues, ...data });
      })
      .catch((error) => toast.error(extractMessage(error)))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reset, toast]);

  const submit = async (form) => {
    try {
      const updated = await clinicSettingsService.update(form);
      reset({ ...defaultValues, ...updated });
      applySettings(updated);
      toast.success('Pengaturan klinik tersimpan');
    } catch (error) {
      toast.error(extractMessage(error));
    }
  };

  if (loading) return <FormSkeleton />;

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6 max-w-4xl" noValidate>
      <div>
        <h1 className="text-2xl font-bold">Pengaturan Klinik</h1>
        <p className="text-sm text-stone-500">
          Ubah identitas, warna, dan informasi kontak tanpa mengedit source code.
        </p>
      </div>

      <section className="card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4" /> Identitas
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nama Klinik *"
            error={errors.clinicName?.message}
            {...register('clinicName')}
          />
          <Input
            label="Tagline"
            placeholder="Klinik Gigi Modern"
            error={errors.tagline?.message}
            {...register('tagline')}
          />
          <Input
            label="URL Logo"
            placeholder="https://..."
            hint="Kosongkan untuk menggunakan ikon gigi bawaan"
            error={errors.logoUrl?.message}
            {...register('logoUrl')}
          />
          <Input
            label="URL Favicon"
            placeholder="https://..."
            error={errors.faviconUrl?.message}
            {...register('faviconUrl')}
          />
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-semibold flex items-center gap-2">
          <Palette className="w-4 h-4" /> Tema Warna
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="primary-color-picker" className="label">Warna Brand</label>
            <div className="flex gap-2">
              <input
                id="primary-color-picker"
                type="color"
                value={HEX_RE.test(primaryColor || '') ? primaryColor : '#f59e0b'}
                onChange={(event) =>
                  setValue('primaryColor', event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="h-10 w-14 rounded border border-stone-300 bg-white cursor-pointer"
              />
              <Input
                className="flex-1"
                placeholder="#f59e0b"
                error={errors.primaryColor?.message}
                {...register('primaryColor')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="accent-color-picker" className="label">Warna Aksen</label>
            <div className="flex gap-2">
              <input
                id="accent-color-picker"
                type="color"
                value={HEX_RE.test(accentColor || '') ? accentColor : '#facc15'}
                onChange={(event) =>
                  setValue('accentColor', event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                className="h-10 w-14 rounded border border-stone-300 bg-white cursor-pointer"
              />
              <Input
                className="flex-1"
                placeholder="#facc15"
                error={errors.accentColor?.message}
                {...register('accentColor')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="card p-5 space-y-4">
        <h2 className="font-semibold">Kontak dan Lokasi</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Textarea
            label="Alamat"
            rows={2}
            className="sm:col-span-2"
            error={errors.address?.message}
            {...register('address')}
          />
          <Input
            label="URL Embed Google Maps"
            placeholder="https://www.google.com/maps?..."
            className="sm:col-span-2"
            error={errors.mapEmbedUrl?.message}
            {...register('mapEmbedUrl')}
          />
          <Input label="Telepon" error={errors.phone?.message} {...register('phone')} />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="WhatsApp"
            placeholder="628xxxxxxxxxx"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
          <Input
            label="Instagram"
            placeholder="@klinikanda"
            error={errors.instagram?.message}
            {...register('instagram')}
          />
          <Textarea
            label="Jam Operasional"
            rows={3}
            className="sm:col-span-2"
            hint="Gunakan satu baris untuk setiap keterangan jam."
            error={errors.operatingHours?.message}
            {...register('operatingHours')}
          />
          <Textarea
            label="Catatan Footer"
            rows={2}
            className="sm:col-span-2"
            error={errors.footerNote?.message}
            {...register('footerNote')}
          />
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>
    </form>
  );
};

export default AdminSettings;
