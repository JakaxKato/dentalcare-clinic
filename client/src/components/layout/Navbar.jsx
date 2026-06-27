import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useClinic } from "../../context/ClinicContext";
import { CLINIC } from "../../config/clinic";
import ToothIcon from "../common/ToothIcon";
import ThemeToggle from "../common/ThemeToggle";

const links = [
  { to: "/", label: "Beranda" },
  { to: "/about", label: "Tentang" },
  { to: "/services", label: "Layanan" },
  { to: "/dentists", label: "Dokter" },
  { to: "/blog", label: "Artikel" },
  { to: "/contact", label: "Kontak" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useClinic();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const brandName = settings.clinicName || CLINIC.shortName;
  const logo = settings.logoUrl;

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "dentist"
        ? "/dentist/dashboard"
        : "/patient/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/[0.85] shadow-sm shadow-stone-900/[0.04] backdrop-blur-2xl dark:border-white/10 dark:bg-stone-950/[0.88]">
      <div className="container-app flex h-[68px] items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          {logo ? (
            <img
              src={logo}
              alt={brandName}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-stone-950 shadow-sm shadow-brand-700/20">
              <ToothIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
            </div>
          )}
          <span className="text-base font-bold text-stone-950 dark:text-stone-50">
            {brandName}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-brand-700 font-semibold dark:text-brand-400"
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/70 dark:text-stone-400 dark:hover:text-stone-100 dark:hover:bg-stone-800/60"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to={dashboardPath}
                className="text-sm font-medium text-stone-600 hover:text-brand-700 dark:text-stone-300 dark:hover:text-brand-400 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="btn-ghost text-sm px-4 py-2"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 transition-colors"
              >
                Masuk
              </Link>
              <Link to="/appointment" className="btn-primary text-sm px-5 py-2">
                Book Sekarang
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 lg:hidden transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`border-t border-stone-100 bg-white/[0.98] backdrop-blur-xl lg:hidden dark:border-stone-800 dark:bg-stone-950/[0.98] transition-all duration-300 ${
          open
            ? "max-h-screen opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="container-app py-3 flex flex-col gap-0.5">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-brand-700 bg-brand-50 font-semibold dark:text-brand-400 dark:bg-brand-950/30"
                    : "text-stone-600 hover:bg-stone-50 dark:text-stone-300 dark:hover:bg-stone-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="pt-2 mt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-2">
            <ThemeToggle className="w-full" />
            {user ? (
              <>
                <Link
                  onClick={() => setOpen(false)}
                  to={dashboardPath}
                  className="btn-secondary text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="btn-ghost text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  onClick={() => setOpen(false)}
                  to="/login"
                  className="btn-secondary text-sm"
                >
                  Masuk
                </Link>
                <Link
                  onClick={() => setOpen(false)}
                  to="/appointment"
                  className="btn-primary text-sm"
                >
                  Book Appointment
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
