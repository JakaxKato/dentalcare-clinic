import { MessageCircle } from 'lucide-react';
import { CLINIC } from '../../config/clinic';

const WhatsAppFAB = () => {
  const number = CLINIC.whatsappNumber;
  const greeting = encodeURIComponent(
    `Halo ${CLINIC.name}, saya ingin konsultasi / booking appointment.`
  );
  return (
    <a
      href={`https://wa.me/${number}?text=${greeting}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center transition hover:scale-110"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  );
};

export default WhatsAppFAB;
