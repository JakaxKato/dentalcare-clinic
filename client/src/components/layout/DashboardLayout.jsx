import { useState, isValidElement } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useClinic } from "../../context/ClinicContext";
import { CLINIC } from "../../config/clinic";
import ToothIcon from "../common/ToothIcon";
import ThemeToggle from "../common/ThemeToggle";

const renderIcon = (icon) => {
  if (icon == null) return null;
  if (isValidElement(icon)) return icon;
  if (
    typeof icon === "function" ||
    (typeof icon === "object" && icon !== null && "$$typeof" in icon)
  ) {
    const Icon = icon;
    return <Icon className="w-5 h-5" />;
  }
  return <span className="text-lg">{icon}</span>;
};

const DashboardLayout = ({ navItems = [], title = "Dashboard" }) => {
  const { user, logout } = useAuth();
  const { settings } = useClinic();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0c0a09] flex">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transform transition-transform ${
          sidebarOpen ? "transtone-x-0" : "-transtone-x-full"
        } lg:transtone-x-0 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-stone-100 dark:border-stone-800">
          <Link to="/" className="flex items-center gap-2">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.clinicName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-stone-950 flex items-center justify-center">
                <ToothIcon className="w-4 h-4" strokeWidth={2} />
              </div>
            )}
            <span className="font-bold text-stone-900 dark:text-stone-50">
              {settings.clinicName || CLINIC.shortName}
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase text-stone-400 dark:text-stone-500 mb-2">
            {title}
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                }`
              }
            >
              {renderIcon(item.icon)}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 flex items-center justify-center font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-ghost text-sm justify-start"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-stone-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-100 dark:border-stone-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100 hidden sm:block">
            {title}
          </h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Lihat Website
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
