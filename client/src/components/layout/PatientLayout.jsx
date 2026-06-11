import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { to: '/patient/appointments', label: 'Appointment', icon: '📅' },
<<<<<<< HEAD
  { to: '/patient/testimonials', label: 'Testimoni Saya', icon: '⭐' },
=======
  { to: '/patient/prescriptions', label: 'Resep Saya', icon: '℞' },
  { to: '/patient/invoices', label: 'Invoice', icon: '🧾' },
>>>>>>> 57c03a6 (Sprint 1 + 2: security hardening + dental features)
  { to: '/patient/profile', label: 'Profil Saya', icon: '👤' },
  { to: '/appointment', label: 'Booking Baru', icon: '➕' },
];

const PatientLayout = () => <DashboardLayout navItems={navItems} title="Patient" />;
export default PatientLayout;
