import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC } from '../../config/clinic';
import ToothIcon from '../common/ToothIcon';
import ThemeToggle from '../common/ThemeToggle';

const links = [
  { to: '/', label: 'Beranda' },
  { to: '/about', label: 'Tentang' },
  { to: '/services', label: 'Layanan' },
  { to: '/dentists', label: 'Dokter' },
  { to: '/blog', label: 'Artikel' },
  { to: '/contact', label: 'Kontak' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { settings } = useClinic();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const brandName = settings.clinicName || CLINIC.shortName;
  const logo = settings.logoUrl;

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'dentist' ? '/dentist/dashboard' : '/patient/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/70 bg-white/82 shadow-sm shadow-brand-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="container-app flex h-[72px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={brandName} className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-300 text-slate-950 shadow-sm shadow-brand-900/10">
              <ToothIcon className="w-5 h-5" strokeWidth={2} />
            </div>
          )}
          <span className="text-lg font-extrabold text-slate-950 dark:text-slate-100">{brandName}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-100 text-slate-950 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-slate-700 hover:text-brand-700 dark:text-slate-200">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-700 dark:text-slate-200">Masuk</Link>
              <Link to="/appointment" className="btn-primary text-sm">Book Appointment</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white/95 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950">
          <div className="container-app py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-3 py-2 text-sm font-semibold ${
                    isActive
                      ? 'bg-brand-100 text-slate-950 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'text-slate-700 hover:bg-brand-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <ThemeToggle className="w-full" />
              {user ? (
                <>
                  <Link onClick={() => setOpen(false)} to={dashboardPath} className="btn-secondary text-sm">
                    Dashboard
                  </Link>
                  <button onClick={() => { setOpen(false); handleLogout(); }} className="btn-ghost text-sm">Logout</button>
                </>
              ) : (
                <>
                  <Link onClick={() => setOpen(false)} to="/login" className="btn-secondary text-sm">Masuk</Link>
                  <Link onClick={() => setOpen(false)} to="/appointment" className="btn-primary text-sm">
                    Book Appointment
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
