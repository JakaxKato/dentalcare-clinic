import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Download, Plus, X } from 'lucide-react';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import Odontogram from '../../components/clinical/Odontogram';
import { Textarea } from '../../components/common/Input';
import Input from '../../components/common/Input';
import {
  appointmentService,
  odontogramService,
  prescriptionService,
  invoiceService,
} from '../../services';
import { useToast } from '../../context/ToastContext';
import { formatDateTime } from '../../utils/format';
import { extractMessage } from '../../services/api';

const tabs = [
  { key: 'overview', label: 'Ringkasan' },
  { key: 'odontogram', label: 'Odontogram' },
  { key: 'prescription', label: 'Resep' },
  { key: 'invoice', label: 'Invoice' },
];

const emptyItem = () => ({ drugName: '', dosage: '', frequency: '', duration: '', instructions: '' });
const emptyInvoiceItem = () => ({ description: '', quantity: 1, unitPrice: 0 });

const DentistTreatment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('overview');

  const [appt, setAppt] = useState(null);
  const [notes, setNotes] = useState({ diagnosis: '', treatmentNotes: '', recommendation: '' });
  const [odontogram, setOdontogram] = useState([]);

  const [prescription, setPrescription] = useState(null);
  const [prescDraft, setPrescDraft] = useState({ items: [emptyItem()], generalNotes: '' });

  const [invoice, setInvoice] = useState(null);
  const [invDraft, setInvDraft] = useState({
    items: [emptyInvoiceItem()],
    discount: 0,
    taxRate: 0,
    notes: '',
  });

  const reload = async () => {
    setLoading(true);
    try {
      const a = await appointmentService.get(id);
      setAppt(a);
      setOdontogram(a.odontogram || []);
      setNotes({
        diagnosis: a.diagnosis || '',
        treatmentNotes: a.treatmentNotes || '',
        recommendation: a.recommendation || '',
      });

      const prescs = await prescriptionService.list({ appointmentId: id });
      setPrescription(prescs[0] || null);
      if (prescs[0]) {
        setPrescDraft({
          items: prescs[0].items.map((it) => ({ ...it })),
          generalNotes: prescs[0].generalNotes || '',
        });
      }

      const invs = await invoiceService.list();
      const ownInv = invs.find((i) => (i.appointmentId?._id || i.appointmentId) === id);
      setInvoice(ownInv || null);
      if (ownInv) {
        setInvDraft({
          items: ownInv.items.map((it) => ({
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
          discount: ownInv.discount,
          taxRate: ownInv.taxRate,
          notes: ownInv.notes || '',
        });
      } else if (a.serviceId) {
        const price = a.serviceId.priceRange?.min || 0;
        setInvDraft((d) => ({
          ...d,
          items: [{ description: a.serviceId.title, quantity: 1, unitPrice: price }],
        }));
      }
    } catch (err) {
      toast.error(extractMessage(err, 'Gagal memuat data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const saveNotesAndComplete = async () => {
    setSaving(true);
    try {
      await appointmentService.updateStatus(id, { status: 'completed', ...notes });
      toast.success('Appointment ditandai selesai');
      await reload();
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveOdontogram = async () => {
    setSaving(true);
    try {
      await odontogramService.updateForAppointment(id, odontogram);
      toast.success('Odontogram disimpan');
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const savePrescription = async () => {
    const items = prescDraft.items.filter((it) => it.drugName.trim());
    if (items.length === 0) return toast.error('Tambahkan minimal satu obat');
    setSaving(true);
    try {
      if (prescription) {
        const updated = await prescriptionService.update(prescription._id, {
          items,
          generalNotes: prescDraft.generalNotes,
        });
        setPrescription(updated);
      } else {
        const created = await prescriptionService.create({
          appointmentId: id,
          items,
          generalNotes: prescDraft.generalNotes,
        });
        setPrescription(created);
      }
      toast.success('Resep tersimpan');
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveInvoice = async () => {
    const items = invDraft.items
      .filter((it) => it.description.trim())
      .map((it) => ({ ...it, quantity: Number(it.quantity) || 1, unitPrice: Number(it.unitPrice) || 0 }));
    if (items.length === 0) return toast.error('Tambahkan minimal satu item');
    setSaving(true);
    try {
      if (invoice) {
        const updated = await invoiceService.update(invoice._id, {
          items,
          discount: Number(invDraft.discount) || 0,
          taxRate: Number(invDraft.taxRate) || 0,
          notes: invDraft.notes,
        });
        setInvoice(updated);
      } else {
        const created = await invoiceService.create({
          appointmentId: id,
          items,
          discount: Number(invDraft.discount) || 0,
          taxRate: Number(invDraft.taxRate) || 0,
          notes: invDraft.notes,
        });
        setInvoice(created);
      }
      toast.success('Invoice tersimpan');
    } catch (err) {
      toast.error(extractMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !appt) return <Loader />;

  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
          <h2 className="text-2xl font-bold mt-1">Treatment — {appt.patientId?.name}</h2>
          <p className="text-sm text-slate-500">
            {appt.serviceId?.title} · {formatDateTime(appt.appointmentDate, appt.appointmentTime)}
          </p>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Pasien" value={appt.patientId?.name} />
            <Info label="Telepon" value={appt.patientId?.phone} />
            <Info label="Layanan" value={appt.serviceId?.title} />
            <Info label="Jadwal" value={formatDateTime(appt.appointmentDate, appt.appointmentTime)} />
            {appt.complaint && <Info label="Keluhan" value={appt.complaint} className="col-span-2" />}
          </div>

          {appt.patientId?.medicalHistory && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="font-semibold text-sm mb-2">Rekam Medis Pasien</h4>
              <MedicalHistoryView mh={appt.patientId.medicalHistory} />
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h4 className="font-semibold">Catatan Tindakan</h4>
            <Textarea label="Diagnosis" value={notes.diagnosis} onChange={(e) => setNotes({ ...notes, diagnosis: e.target.value })} />
            <Textarea label="Tindakan Dilakukan" value={notes.treatmentNotes} onChange={(e) => setNotes({ ...notes, treatmentNotes: e.target.value })} />
            <Textarea label="Rekomendasi" value={notes.recommendation} onChange={(e) => setNotes({ ...notes, recommendation: e.target.value })} />
            {appt.status === 'confirmed' ? (
              <button onClick={saveNotesAndComplete} disabled={saving} className="btn-primary">
                {saving ? 'Menyimpan...' : 'Simpan & Tandai Selesai'}
              </button>
            ) : (
              <p className="text-xs text-slate-500">Catatan dapat disimpan saat status appointment <em>confirmed</em>.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'odontogram' && (
        <div className="card p-6 space-y-4">
          <p className="text-sm text-slate-600">Klik gigi untuk menandai kondisi. Bisa pilih lebih dari satu.</p>
          <Odontogram value={odontogram} onChange={setOdontogram} />
          <button onClick={saveOdontogram} disabled={saving} className="btn-primary">
            {saving ? 'Menyimpan...' : 'Simpan Odontogram'}
          </button>
        </div>
      )}

      {tab === 'prescription' && (
        <PrescriptionEditor
          draft={prescDraft}
          setDraft={setPrescDraft}
          existing={prescription}
          onSave={savePrescription}
          saving={saving}
          patientName={appt.patientId?.name}
        />
      )}

      {tab === 'invoice' && (
        <InvoiceEditor
          draft={invDraft}
          setDraft={setInvDraft}
          existing={invoice}
          onSave={saveInvoice}
          saving={saving}
          appointmentId={id}
        />
      )}
    </div>
  );
};

const Info = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="font-medium whitespace-pre-line">{value || '-'}</p>
  </div>
);

const MedicalHistoryView = ({ mh }) => {
  const items = [
    ['Gol. Darah', mh.bloodType],
    ['Alergi', (mh.allergies || []).join(', ')],
    ['Kondisi/Penyakit', (mh.conditions || []).join(', ')],
    ['Obat Sekarang', (mh.currentMedications || []).join(', ')],
  ].filter(([, v]) => v && v.length > 0);

  if (items.length === 0 && !mh.notes) {
    return <p className="text-sm text-slate-500 italic">Pasien belum mengisi rekam medis.</p>;
  }

  return (
    <div className="space-y-1.5 text-sm">
      {items.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <span className="text-slate-500 min-w-[120px]">{k}:</span>
          <span className="font-medium">{v}</span>
        </div>
      ))}
      {mh.notes && <p className="text-xs text-slate-600 italic mt-2">{mh.notes}</p>}
    </div>
  );
};

const PrescriptionEditor = ({ draft, setDraft, existing, onSave, saving, patientName }) => {
  const updateItem = (i, key, val) => {
    const items = [...draft.items];
    items[i] = { ...items[i], [key]: val };
    setDraft({ ...draft, items });
  };
  const removeItem = (i) => {
    const items = draft.items.filter((_, idx) => idx !== i);
    setDraft({ ...draft, items: items.length ? items : [emptyItem()] });
  };
  const addItem = () => setDraft({ ...draft, items: [...draft.items, emptyItem()] });

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-semibold">Resep Obat</h3>
          <p className="text-sm text-slate-500">Untuk {patientName}</p>
        </div>
        {existing && (
          <Link to={`/print/prescription/${existing._id}`} target="_blank" className="btn-ghost text-sm inline-flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {draft.items.map((it, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-slate-600">Obat #{i + 1}</span>
              {draft.items.length > 1 && (
                <button onClick={() => removeItem(i)} className="text-xs text-red-600 hover:underline">Hapus</button>
              )}
            </div>
            <Input label="Nama Obat" value={it.drugName} onChange={(e) => updateItem(i, 'drugName', e.target.value)} placeholder="Amoxicillin 500mg" />
            <div className="grid grid-cols-3 gap-2">
              <Input label="Dosis" value={it.dosage} onChange={(e) => updateItem(i, 'dosage', e.target.value)} placeholder="1 tablet" />
              <Input label="Frekuensi" value={it.frequency} onChange={(e) => updateItem(i, 'frequency', e.target.value)} placeholder="3x sehari" />
              <Input label="Durasi" value={it.duration} onChange={(e) => updateItem(i, 'duration', e.target.value)} placeholder="5 hari" />
            </div>
            <Input label="Petunjuk Pakai" value={it.instructions} onChange={(e) => updateItem(i, 'instructions', e.target.value)} placeholder="Setelah makan" />
          </div>
        ))}
        <button onClick={addItem} className="btn-ghost text-sm w-full border border-dashed border-slate-300 inline-flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Tambah Obat
        </button>
      </div>

      <Textarea
        label="Catatan Umum"
        value={draft.generalNotes}
        onChange={(e) => setDraft({ ...draft, generalNotes: e.target.value })}
      />
      <button onClick={onSave} disabled={saving} className="btn-primary">
        {saving ? 'Menyimpan...' : existing ? 'Update Resep' : 'Simpan Resep'}
      </button>
    </div>
  );
};

const formatIDR = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID');

const InvoiceEditor = ({ draft, setDraft, existing, onSave, saving }) => {
  const updateItem = (i, key, val) => {
    const items = [...draft.items];
    items[i] = { ...items[i], [key]: val };
    setDraft({ ...draft, items });
  };
  const removeItem = (i) => {
    const items = draft.items.filter((_, idx) => idx !== i);
    setDraft({ ...draft, items: items.length ? items : [emptyInvoiceItem()] });
  };
  const addItem = () => setDraft({ ...draft, items: [...draft.items, emptyInvoiceItem()] });

  const totals = useMemo(() => {
    const subtotal = draft.items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
    const afterDisc = Math.max(0, subtotal - (Number(draft.discount) || 0));
    const tax = Math.round(afterDisc * (Number(draft.taxRate) || 0) / 100);
    return { subtotal, tax, total: afterDisc + tax };
  }, [draft]);

  const handleDownload = async () => {
    if (!existing) return;
    try {
      await invoiceService.downloadPdf(existing._id, `${existing.invoiceNumber}.pdf`);
    } catch (err) {
      // toast can be added here if injected
      console.error(err);
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex justify-between items-start gap-2 flex-wrap">
        <div>
          <h3 className="font-semibold">Invoice</h3>
          {existing && (
            <p className="text-sm text-slate-500">
              {existing.invoiceNumber} · <span className={
                existing.paymentStatus === 'paid' ? 'text-green-600' :
                existing.paymentStatus === 'partial' ? 'text-yellow-600' : 'text-red-600'
              }>{existing.paymentStatus}</span>
            </p>
          )}
        </div>
        {existing && (
          <button onClick={handleDownload} className="btn-ghost text-sm inline-flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        )}
      </div>

      <div className="space-y-2">
        {draft.items.map((it, i) => (
          <div key={i} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input label={i === 0 ? 'Deskripsi' : ''} value={it.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Scaling RA & RB" />
            </div>
            <div className="w-20">
              <Input label={i === 0 ? 'Qty' : ''} type="number" min="1" value={it.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} />
            </div>
            <div className="w-32">
              <Input label={i === 0 ? 'Harga Satuan' : ''} type="number" min="0" value={it.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', e.target.value)} />
            </div>
            <button onClick={() => removeItem(i)} className="text-red-600 hover:text-red-700 pb-2.5" aria-label="Hapus item">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={addItem} className="btn-ghost text-sm w-full border border-dashed border-slate-300 inline-flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Tambah Item
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Diskon (Rp)" type="number" min="0" value={draft.discount} onChange={(e) => setDraft({ ...draft, discount: e.target.value })} />
        <Input label="Tax (%)" type="number" min="0" max="100" value={draft.taxRate} onChange={(e) => setDraft({ ...draft, taxRate: e.target.value })} />
      </div>

      <div className="bg-slate-50 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatIDR(totals.subtotal)}</span></div>
        {draft.discount > 0 && <div className="flex justify-between"><span>Diskon</span><span>- {formatIDR(draft.discount)}</span></div>}
        {totals.tax > 0 && <div className="flex justify-between"><span>Tax ({draft.taxRate}%)</span><span>{formatIDR(totals.tax)}</span></div>}
        <div className="flex justify-between font-bold text-base border-t border-slate-200 pt-2 mt-2">
          <span>Total</span><span>{formatIDR(totals.total)}</span>
        </div>
        {existing?.downPaymentApplied > 0 && (
          <>
            <div className="flex justify-between text-emerald-700">
              <span>DP diterapkan</span><span>- {formatIDR(existing.downPaymentApplied)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Sisa tagihan</span>
              <span>{formatIDR(Math.max(0, totals.total - existing.amountPaid))}</span>
            </div>
          </>
        )}
      </div>

      <Textarea label="Catatan" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
      <button onClick={onSave} disabled={saving} className="btn-primary">
        {saving ? 'Menyimpan...' : existing ? 'Update Invoice' : 'Buat Invoice'}
      </button>
    </div>
  );
};

export default DentistTreatment;
