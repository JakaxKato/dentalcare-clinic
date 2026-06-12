import {
  LayoutDashboard,
  CalendarDays,
  Star,
  Pill,
  Receipt,
  UserCircle2,
  Plus,
} from 'lucide-react';
import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patient/appointments', label: 'Appointment', icon: CalendarDays },
  { to: '/patient/testimonials', label: 'Testimoni Saya', icon: Star },
  { to: '/patient/prescriptions', label: 'Resep Saya', icon: Pill },
  { to: '/patient/invoices', label: 'Invoice', icon: Receipt },
  { to: '/patient/profile', label: 'Profil Saya', icon: UserCircle2 },
  { to: '/appointment', label: 'Booking Baru', icon: Plus },
];

const PatientLayout = () => <DashboardLayout navItems={navItems} title="Patient" />;
export default PatientLayout;
