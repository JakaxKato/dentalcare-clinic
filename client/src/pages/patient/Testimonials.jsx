import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { Textarea } from '../../components/common/Input';
import { testimonialService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';
import { formatDate } from '../../utils/format';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110"
        aria-label={`${n} star${n > 1 ? 's' : ''}`}
      >
        <Star
          className={`w-7 h-7 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
        />
      </button>
    ))}
  </div>
);

const StarRow = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`w-5 h-5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
      />
    ))}
  </div>
);

const PatientTestimonials = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    testimonialService
      .mine()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return toast.error('Pesan testimoni tidak boleh kosong');
    if (rating < 1 || rating > 5) return toast.error('Rating harus 1-5');
    setSubmitting(true);
    try {
      await testimonialService.create({ rating, message: message.trim() });
      toast.success('Terima kasih! Testimoni Anda menunggu persetujuan admin.');
      setMessage('');
      setRating(5);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Hapus testimoni ini? Hanya bisa dihapus selama belum disetujui admin.')) return;
    try {
      await testimonialService.remove(id);
      toast.success('Testimoni dihapus');
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold">Testimoni Saya</h2>
        <p className="text-sm text-stone-500 mt-1">
          Bagikan pengalaman Anda di klinik kami. Testimoni akan tampil di beranda setelah disetujui admin.
        </p>
      </div>

      <form onSubmit={submit} className="card p-6 space-y-4">
        <h3 className="font-semibold">Beri Testimoni Baru</h3>
        <div>
          <label className="label">Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <Textarea
          label="Pesan"
          placeholder="Ceritakan pengalaman Anda di klinik..."
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
        />
        <p className="text-xs text-stone-400">{message.length}/500</p>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Mengirim...' : 'Kirim Testimoni'}
        </button>
      </form>

      <div>
        <h3 className="font-semibold mb-3">Riwayat Testimoni</h3>
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState icon={Star} title="Belum ada testimoni" description="Testimoni yang Anda kirim akan muncul di sini." />
        ) : (
          <div className="space-y-3">
            {items.map((t) => (
              <div key={t._id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <StarRow rating={t.rating} />
                    <p className="text-sm text-stone-700 italic mt-2">"{t.message}"</p>
                    <p className="text-xs text-stone-400 mt-3">
                      Dikirim {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span
                      className={`badge ${
                        t.isApproved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {t.isApproved ? 'Tampil di beranda' : 'Menunggu persetujuan'}
                    </span>
                    {!t.isApproved && (
                      <button
                        onClick={() => remove(t._id)}
                        className="btn-danger text-xs"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientTestimonials;
