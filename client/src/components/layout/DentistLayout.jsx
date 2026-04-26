import DashboardLayout from './DashboardLayout';

const navItems = [
  { to: '/dentist/dashboard', label: 'Dashboard', icon: '📊', end: true },
  { to: '/dentist/appointments', label: 'Appointment', icon: '📅' },
];

const DentistLayout = () => <DashboardLayout navItems={navItems} title="Dentist" />;
export default DentistLayout;
