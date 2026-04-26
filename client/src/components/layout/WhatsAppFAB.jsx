const WhatsAppFAB = () => {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || '6281234567890';
  return (
    <a
      href={`https://wa.me/${number}?text=Halo%20DentalCare%2C%20saya%20ingin%20konsultasi.`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg flex items-center justify-center transition hover:scale-110"
    >
      <span className="text-2xl">💬</span>
    </a>
  );
};

export default WhatsAppFAB;
