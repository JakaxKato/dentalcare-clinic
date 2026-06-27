import {
  LayoutDashboard,
  CalendarDays,
  CalendarOff,
  Receipt,
  Stethoscope,
  Wrench,
  Users,
  Newspaper,
  Star,
  Settings,
} from "lucide-react";
import DashboardLayout from "./DashboardLayout";

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  { to: "/admin/appointments", label: "Appointment", icon: CalendarDays },
  { to: "/admin/invoices", label: "Invoice", icon: Receipt },
  { to: "/admin/dentists", label: "Dokter", icon: Stethoscope },
  { to: "/admin/leaves", label: "Cuti Dokter", icon: CalendarOff },
  { to: "/admin/services", label: "Layanan", icon: Wrench },
  { to: "/admin/patients", label: "Pasien", icon: Users },
  { to: "/admin/articles", label: "Artikel", icon: Newspaper },
  { to: "/admin/testimonials", label: "Testimoni", icon: Star },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
];

const AdminLayout = () => <DashboardLayout navItems={navItems} title="Admin" />;
export default AdminLayout;
