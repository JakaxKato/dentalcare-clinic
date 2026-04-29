import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CLINIC } from '../../config/clinic';

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
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'dentist' ? '/dentist/dashboard' : '/patient/dashboard';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="container-app flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
            🦷
          </div>
          <span className="font-extrabold text-lg text-slate-800">{CLINIC.shortName}</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-700 hover:bg-slate-50'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <Link to={dashboardPath} className="text-sm font-medium text-slate-700 hover:text-brand-700">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-brand-700">Masuk</Link>
              <Link to="/appointment" className="btn-primary text-sm">Book Appointment</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          <span className="text-2xl">{open ? '✕' : '☰'}</span>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="container-app py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2">
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
