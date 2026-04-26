import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/appointments', label: 'Appointment', icon: '📅' },
  { to: '/admin/dentists', label: 'Dokter', icon: '🦷' },
  { to: '/admin/services', label: 'Layanan', icon: '🛠️' },
  { to: '/admin/patients', label: 'Pasien', icon: '👥' },
  { to: '/admin/articles', label: 'Artikel', icon: '📰' },
  { to: '/admin/testimonials', label: 'Testimoni', icon: '⭐' },
];

const AdminLayout = () => <DashboardLayout navItems={navItems} title="Admin" />;
export default AdminLayout;
