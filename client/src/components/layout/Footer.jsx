import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';
import ToothIcon from '../common/ToothIcon';

const Instagram = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Footer = () => {
  const { settings } = useClinic();
  const brandName = settings.clinicName || CLINIC.shortName;
  const tagline =
    settings.tagline ||
    'Klinik gigi modern yang fokus pada kenyamanan, transparansi, dan hasil estetik untuk seluruh keluarga.';

  return (
    <footer className="bg-slate-900 text-slate-300 mt-16">
    <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center">
              <ToothIcon className="w-5 h-5" strokeWidth={2} />
            </div>
          )}
          <span className="font-extrabold text-lg text-white">{brandName}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">{tagline}</p>
      </div>

      <div>
        <h4 className="text-white text-sm font-semibold mb-3">Navigasi</h4>
        <ul className="space-y-2 text-sm">
          <li><Link to="/" className="hover:text-white">Beranda</Link></li>
          <li><Link to="/services" className="hover:text-white">Layanan</Link></li>
          <li><Link to="/dentists" className="hover:text-white">Dokter</Link></li>
          <li><Link to="/blog" className="hover:text-white">Artikel</Link></li>
          <li><Link to="/contact" className="hover:text-white">Kontak</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-white text-sm font-semibold mb-3">Jam Operasional</h4>
        <ul className="space-y-1.5 text-sm text-slate-400">
          {(settings.operatingHours || CLINIC.hours.lines.join('\n'))
            .split('\n')
            .filter(Boolean)
            .map((line) => (
              <li key={line}>{line}</li>
            ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white text-sm font-semibold mb-3">Kontak</h4>
        <ul className="space-y-2 text-sm text-slate-400">
          {(settings.address || CLINIC.address.primary.line) && (
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-400" />
              <span>{settings.address || CLINIC.address.primary.line}</span>
            </li>
          )}
          {(settings.phone || CLINIC.phoneDisplay) && (
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 flex-shrink-0 text-brand-400" />
              <span>{settings.phone || CLINIC.phoneDisplay}</span>
            </li>
          )}
          {(settings.email || CLINIC.email) && (
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0 text-brand-400" />
              <span>{settings.email || CLINIC.email}</span>
            </li>
          )}
          {settings.instagram && (
            <li className="flex gap-3 pt-2">
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="hover:text-white"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-800">
      <div className="container-app py-4 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} {brandName} — {settings.footerNote || 'All rights reserved.'}
      </div>
    </div>
    </footer>
  );
};

export default Footer;
