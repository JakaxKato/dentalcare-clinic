import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Printer, Pill } from 'lucide-react';
import Loader from '../../components/common/Loader';
import { prescriptionService } from '../../services';

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const PrescriptionPrint = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.get(id).then(setData).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 300);
  }, [data]);

  if (loading || !data) return <Loader />;

  const patient = data.patientId || {};
  const dentist = data.dentistId || {};
  const appt = data.appointmentId || {};
  const clinicName = import.meta.env.VITE_CLINIC_NAME || 'DentalCare Clinic';

  return (
    <div className="min-h-screen bg-white text-stone-900 p-6 sm:p-10 max-w-2xl mx-auto print:p-4">
      <style>{`@media print { .no-print { display: none; } body { background: white; } }`}</style>

      <div className="no-print mb-4 flex justify-end">
        <button onClick={() => window.print()} className="btn-primary text-sm inline-flex items-center gap-1.5">
          <Printer className="w-4 h-4" /> Print
        </button>
      </div>

      <div className="border-b-2 border-stone-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold">{clinicName}</h1>
        <p className="text-sm text-stone-600">drg. {dentist.name}</p>
      </div>

      <h2 className="text-center text-lg font-bold tracking-wide mb-6">RESEP / PRESCRIPTION</h2>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div>
          <p className="text-stone-500">Pasien</p>
          <p className="font-semibold">{patient.name}</p>
          {patient.phone && <p className="text-xs text-stone-600">{patient.phone}</p>}
        </div>
        <div className="text-right">
          <p className="text-stone-500">Tanggal</p>
          <p className="font-semibold">{formatDate(data.createdAt)}</p>
        </div>
      </div>

      {appt?.serviceId?.title && (
        <p className="text-sm mb-3"><span className="text-stone-500">Layanan:</span> {appt.serviceId.title}</p>
      )}
      {appt?.diagnosis && (
        <p className="text-sm mb-4"><span className="text-stone-500">Diagnosis:</span> {appt.diagnosis}</p>
      )}

      <div className="border-t border-stone-200 pt-4">
        <Pill className="w-7 h-7 mb-3 text-stone-700" />
        <ol className="space-y-4 list-decimal list-inside">
          {data.items.map((it, i) => (
            <li key={i} className="text-sm">
              <span className="font-semibold">{it.drugName}</span>
              <div className="ml-6 mt-1 text-stone-700 space-y-0.5">
                {it.dosage && <p>S. {it.dosage} {it.frequency && `, ${it.frequency}`} {it.duration && `, selama ${it.duration}`}</p>}
                {it.instructions && <p className="italic text-stone-600">— {it.instructions}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {data.generalNotes && (
        <div className="border-t border-stone-200 mt-6 pt-4 text-sm">
          <p className="text-stone-500 mb-1">Catatan:</p>
          <p className="whitespace-pre-line">{data.generalNotes}</p>
        </div>
      )}

      <div className="mt-12 text-right text-sm">
        <p className="text-stone-500">Hormat kami,</p>
        <div className="h-16" />
        <p className="font-semibold underline">drg. {dentist.name}</p>
      </div>
    </div>
  );
};

export default PrescriptionPrint;
