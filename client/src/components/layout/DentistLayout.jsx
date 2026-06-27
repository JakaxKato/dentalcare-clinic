import { LayoutDashboard, CalendarDays, CalendarOff } from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  {
    to: "/dentist/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/dentist/appointments", label: "Appointment", icon: CalendarDays },
  { to: "/dentist/schedule", label: "Jadwal Cuti", icon: CalendarOff },
];

const DentistLayout = () => (
  <DashboardLayout navItems={navItems} title="Dentist" />
);
export default DentistLayout;
