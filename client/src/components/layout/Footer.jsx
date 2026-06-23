import { Link } from 'react-router-dom';
import { Camera, Mail, MapPin, Phone } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import { useClinic } from '../../context/ClinicContext';
import ToothIcon from '../common/ToothIcon';

const Footer = () => {
  const { settings } = useClinic();
  const brandName = settings.clinicName || CLINIC.shortName;
  const tagline =
    settings.tagline ||
    'Klinik gigi modern yang fokus pada kenyamanan, transparansi, dan hasil estetik untuk seluruh keluarga.';

  return (
    <footer className="mt-16 border-t border-brand-100 bg-gradient-to-br from-white via-brand-50/80 to-white text-slate-600 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container-app grid grid-cols-1 gap-8 py-12 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-300 text-slate-950 shadow-sm shadow-brand-900/10">
                <ToothIcon className="h-5 w-5" strokeWidth={2} />
              </div>
            )}
            <span className="text-lg font-extrabold text-slate-950 dark:text-white">{brandName}</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{tagline}</p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Navigasi</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand-700">Beranda</Link></li>
            <li><Link to="/services" className="hover:text-brand-700">Layanan</Link></li>
            <li><Link to="/dentists" className="hover:text-brand-700">Dokter</Link></li>
            <li><Link to="/blog" className="hover:text-brand-700">Artikel</Link></li>
            <li><Link to="/contact" className="hover:text-brand-700">Kontak</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Jam Operasional</h4>
          <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
            {(settings.operatingHours || CLINIC.hours.lines.join('\n'))
              .split('\n')
              .filter(Boolean)
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-950 dark:text-white">Kontak</h4>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            {(settings.address || CLINIC.address.primary.line) && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-700 dark:text-brand-300" />
                <span>{settings.address || CLINIC.address.primary.line}</span>
              </li>
            )}
            {(settings.phone || CLINIC.phoneDisplay) && (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-brand-700 dark:text-brand-300" />
                <span>{settings.phone || CLINIC.phoneDisplay}</span>
              </li>
            )}
            {(settings.email || CLINIC.email) && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-brand-700 dark:text-brand-300" />
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
                  className="hover:text-brand-700 dark:hover:text-white"
                >
                  <Camera className="h-5 w-5" />
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-brand-100 dark:border-slate-800">
        <div className="container-app py-4 text-center text-xs text-slate-500">
          Copyright {new Date().getFullYear()} {brandName}. {settings.footerNote || 'All rights reserved.'}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
