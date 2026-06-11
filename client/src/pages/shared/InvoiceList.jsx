import { useEffect, useState } from 'react';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { invoiceService } from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import { extractMessage } from '../../services/api';

const formatIDR = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const statusStyle = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  unpaid: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const InvoiceList = ({ isAdmin = false }) => {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [payment, setPayment] = useState({ amountPaid: 0, paymentMethod: '' });

  const load = () => {
    setLoading(true);
    invoiceService.list().then(setList).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDownload = async (inv) => {
    try {
      await invoiceService.downloadPdf(inv._id, `${inv.invoiceNumber}.pdf`);
    } catch (err) {
      toast.error(extractMessage(err, 'Gagal download'));
    }
  };

  const openPayment = (inv) => {
    setActive(inv);
    setPayment({
      amountPaid: inv.amountPaid || inv.total,
      paymentMethod: inv.paymentMethod || 'Cash',
    });
  };

  const submitPayment = async () => {
    if (!active) return;
    try {
      await invoiceService.updatePayment(active._id, {
        amountPaid: Number(payment.amountPaid) || 0,
        paymentMethod: payment.paymentMethod,
      });
      toast.success('Pembayaran diperbarui');
      setActive(null);
      load();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{isAdmin ? 'Invoice (Semua)' : 'Invoice Saya'}</h2>

      {list.length === 0 ? (
        <EmptyState icon="🧾" title="Belum ada invoice" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Tanggal</th>
                {isAdmin && <th className="px-4 py-3">Pasien</th>}
                <th className="px-4 py-3">Layanan</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((inv) => (
                <tr key={inv._id}>
                  <td className="px-4 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(inv.createdAt)}</td>
                  {isAdmin && <td className="px-4 py-3">{inv.patientId?.name}</td>}
                  <td className="px-4 py-3 text-slate-600">{inv.appointmentId?.serviceId?.title || '-'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatIDR(inv.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${statusStyle[inv.paymentStatus] || ''}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDownload(inv)} className="text-brand-600 hover:underline text-xs">PDF</button>
                    {isAdmin && (
                      <button onClick={() => openPayment(inv)} className="ml-3 text-brand-600 hover:underline text-xs">Bayar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!active} onClose={() => setActive(null)} title={`Pembayaran ${active?.invoiceNumber}`}>
        {active && (
          <div className="space-y-3">
            <p className="text-sm">Total tagihan: <strong>{formatIDR(active.total)}</strong></p>
            <Input
              label="Jumlah Dibayar (Rp)"
              type="number"
              min="0"
              value={payment.amountPaid}
              onChange={(e) => setPayment({ ...payment, amountPaid: e.target.value })}
            />
            <label className="block">
              <span className="block text-sm font-medium text-slate-700 mb-1">Metode Pembayaran</span>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={payment.paymentMethod}
                onChange={(e) => setPayment({ ...payment, paymentMethod: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Transfer">Transfer Bank</option>
                <option value="QRIS">QRIS</option>
                <option value="Debit/Credit Card">Debit/Credit Card</option>
                <option value="Asuransi">Asuransi</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button className="btn-ghost" onClick={() => setActive(null)}>Batal</button>
              <button className="btn-primary" onClick={submitPayment}>Simpan</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceList;
