import { useEffect, useState } from 'react';
import Input from '../../components/common/Input';
import Odontogram from '../../components/clinical/Odontogram';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService, odontogramService } from '../../services';
import { extractMessage } from '../../services/api';

const csvJoin = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const csvSplit = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user.name || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
    gender: user.gender || '',
    address: user.address || '',
  });
  const [med, setMed] = useState({
    bloodType: user.medicalHistory?.bloodType || '',
    allergies: csvJoin(user.medicalHistory?.allergies),
    conditions: csvJoin(user.medicalHistory?.conditions),
    currentMedications: csvJoin(user.medicalHistory?.currentMedications),
    notes: user.medicalHistory?.notes || '',
  });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [odontogram, setOdontogram] = useState({ teeth: [], takenAt: null });

  useEffect(() => {
    odontogramService.forPatient(user._id).then((r) => {
      setOdontogram({ teeth: r.odontogram || [], takenAt: r.takenAt });
    }).catch(() => {
      toast.error('Gagal memuat data odontogram');
    });
  }, [user._id]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleMed = (e) => setMed({ ...med, [e.target.name]: e.target.value });
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

  const submitMed = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        bloodType: med.bloodType,
        allergies: csvSplit(med.allergies),
        conditions: csvSplit(med.conditions),
        currentMedications: csvSplit(med.currentMedications),
        notes: med.notes,
      };
      const updated = await userService.updateMedicalHistory(user._id, payload);
      updateUser({ ...user, medicalHistory: updated });
      toast.success('Rekam medis diperbarui');
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const submitPwd = async (e) => {
    e.preventDefault();
    if (!pwd.current) return toast.error('Masukkan password saat ini');
    if (pwd.next !== pwd.confirm) return toast.error('Konfirmasi password tidak cocok');
    if (pwd.next.length < 8) return toast.error('Password minimal 8 karakter');
    setLoading(true);
    try {
      await userService.update(user._id, { currentPassword: pwd.current, password: pwd.next });
      toast.success('Password berhasil diubah');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Profil Saya</h2>

      <form onSubmit={submitProfile} className="card p-6 space-y-4">
        <h3 className="font-semibold">Informasi Pribadi</h3>
        <Input label="Email" value={user.email} disabled />
        <Input label="Nama Lengkap" name="name" value={form.name} onChange={handle} required />
        <Input label="No. WhatsApp" name="phone" value={form.phone} onChange={handle} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Tanggal Lahir" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handle} />
          <label className="block">
            <span className="block text-sm font-medium text-stone-700 mb-1">Jenis Kelamin</span>
            <select
              name="gender"
              value={form.gender}
              onChange={handle}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">—</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Alamat</span>
          <textarea
            rows={2}
            name="address"
            value={form.address}
            onChange={handle}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <Input label="URL Avatar (opsional)" name="avatar" value={form.avatar} onChange={handle} />
        <button disabled={loading} className="btn-primary">Simpan Perubahan</button>
      </form>

      <form onSubmit={submitMed} className="card p-6 space-y-4">
        <h3 className="font-semibold">Rekam Medis</h3>
        <p className="text-xs text-stone-500">Informasi ini membantu dokter memberikan perawatan yang aman.</p>
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Golongan Darah</span>
          <select
            name="bloodType"
            value={med.bloodType}
            onChange={handleMed}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">—</option>
            {['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <Input
          label="Alergi (pisahkan dengan koma)"
          name="allergies"
          value={med.allergies}
          onChange={handleMed}
          placeholder="Penicillin, Latex"
        />
        <Input
          label="Penyakit Sistemik / Kondisi (pisahkan dengan koma)"
          name="conditions"
          value={med.conditions}
          onChange={handleMed}
          placeholder="Diabetes, Hipertensi"
        />
        <Input
          label="Obat yang Sedang Dikonsumsi"
          name="currentMedications"
          value={med.currentMedications}
          onChange={handleMed}
          placeholder="Metformin 500mg, ..."
        />
        <label className="block">
          <span className="block text-sm font-medium text-stone-700 mb-1">Catatan Tambahan</span>
          <textarea
            rows={3}
            name="notes"
            value={med.notes}
            onChange={handleMed}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </label>
        <button disabled={loading} className="btn-primary">Simpan Rekam Medis</button>
      </form>

      <div className="card p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Odontogram Terkini</h3>
          {odontogram.takenAt && (
            <span className="text-xs text-stone-500">
              Update: {new Date(odontogram.takenAt).toLocaleDateString('id-ID')}
            </span>
          )}
        </div>
        {odontogram.teeth.length === 0 ? (
          <p className="text-sm text-stone-500">Belum ada data odontogram. Akan diisi oleh dokter saat perawatan.</p>
        ) : (
          <Odontogram value={odontogram.teeth} readOnly />
        )}
      </div>

      <form onSubmit={submitPwd} className="card p-6 space-y-4">
        <h3 className="font-semibold">Ubah Password</h3>
        <Input label="Password Saat Ini" type="password" name="current" value={pwd.current} onChange={handlePwd} required autoComplete="current-password" />
        <Input label="Password Baru" type="password" name="next" value={pwd.next} onChange={handlePwd} required autoComplete="new-password" />
        <Input label="Konfirmasi Password" type="password" name="confirm" value={pwd.confirm} onChange={handlePwd} required autoComplete="new-password" />
        <button disabled={loading} className="btn-secondary">Ubah Password</button>
      </form>
    </div>
  );
};

export default PatientProfile;
