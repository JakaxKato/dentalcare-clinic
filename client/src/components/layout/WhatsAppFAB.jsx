import { MessageCircle } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';

const WhatsAppFAB = () => {
  const { settings } = useClinic();
  const number = (settings.whatsapp || CLINIC.whatsappNumber).replace(/\D/g, '');
  const greeting = encodeURIComponent(
    `Halo ${settings.clinicName || CLINIC.name}, saya ingin konsultasi / booking appointment.`
  );
  return (
    <a
      href={`https://wa.me/${number}?text=${greeting}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-brand-200 shadow-lg shadow-brand-900/20 transition duration-300 hover:scale-105 hover:bg-slate-800"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppFAB;
