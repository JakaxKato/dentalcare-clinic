import { useCallback, useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { paymentService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { extractMessage } from '../../services/api';
import { formatCurrency } from '../../utils/format';

const SNAP_SRC = {
  sandbox: 'https://app.sandbox.midtrans.com/snap/snap.js',
  prod: 'https://app.midtrans.com/snap/snap.js',
};

let snapLoading = null;
let loadedSnapSource = '';
const loadSnap = (clientKey, isProduction) => {
  const source = isProduction ? SNAP_SRC.prod : SNAP_SRC.sandbox;
  if (window.snap && loadedSnapSource === source) return Promise.resolve(window.snap);
  if (snapLoading) return snapLoading;
  snapLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = source;
    s.setAttribute('data-client-key', clientKey || '');
    s.onload = () => {
      loadedSnapSource = source;
      resolve(window.snap);
    };
    s.onerror = () => {
      snapLoading = null;
      reject(new Error('Failed to load Snap.js'));
    };
    document.body.appendChild(s);
  });
  return snapLoading;
};

const DpButton = ({ appointmentId, onPaid }) => {
  const toast = useToast();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await paymentService.getDpStatus(appointmentId);
      setInfo(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  useEffect(() => { load(); }, [load]);

  const pay = async () => {
    setPaying(true);
    try {
      const tx = await paymentService.createDp(appointmentId);
      if (info?.midtransEnabled) {
        const clientKey = tx.clientKey || info.clientKey;
        if (!clientKey) throw new Error('Midtrans client key is not available');
        const snap = await loadSnap(clientKey, tx.isProduction ?? info.isProduction);
        snap.pay(tx.snapToken, {
          onSuccess: () => {
            toast.success('DP berhasil dibayar');
            load();
            onPaid?.();
          },
          onPending: () => {
            toast.info('Menunggu konfirmasi pembayaran');
            load();
          },
          onError: () => toast.error('Pembayaran gagal'),
          onClose: () => load(),
        });
      } else {
        // Dev mode: confirm immediately so the flow is demo-able.
        if (window.confirm(`Mode DEV (Midtrans belum dikonfigurasi). Tandai DP ${formatCurrency(tx.amount)} sebagai LUNAS?`)) {
          await paymentService.confirmDpDev(appointmentId);
          toast.success('DP ditandai lunas (dev mode)');
          load();
          onPaid?.();
        }
      }
    } catch (err) {
      toast.error(extractMessage(err, 'Gagal membuat transaksi'));
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <span className="text-xs text-slate-400 inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Memuat…</span>;
  }
  if (!info) return null;

  if (['paid', 'partially_refunded'].includes(info.downPayment.status)) {
    const netPaid = Math.max(
      0,
      info.downPayment.amount - (info.downPayment.refundedAmount || 0)
    );
    return (
      <span className="badge bg-emerald-100 text-emerald-700 inline-flex items-center gap-1">
        <CheckCircle2 className="w-3.5 h-3.5" />
        DP {formatCurrency(netPaid)} diterapkan
      </span>
    );
  }

  return (
    <button
      onClick={pay}
      disabled={paying}
      className="btn-primary text-xs"
      title={`Bayar DP ${formatCurrency(info.suggestedAmount || info.downPayment.amount || 0)}`}
    >
      {paying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
      Bayar DP {formatCurrency(info.downPayment.amount || info.suggestedAmount || 0)}
    </button>
  );
};

export default DpButton;
