import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { CLINIC } from '../../config/clinic';
import ToothIcon from '../common/ToothIcon';

const Instagram = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.77l-.44 2.9h-2.33V22c4.78-.79 8.43-4.94 8.43-9.94z" />
  </svg>
);

const TikTok = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.83a8.16 8.16 0 0 0 4.77 1.52V6.91a4.85 4.85 0 0 1-1.84-.22z" />
  </svg>
);

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 mt-16">
    <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center">
            <ToothIcon className="w-5 h-5" strokeWidth={2} />
          </div>
          <span className="font-extrabold text-lg text-white">{CLINIC.shortName}</span>
        </div>
        <p className="text-sm leading-relaxed text-slate-400">
          Klinik gigi modern yang fokus pada kenyamanan, transparansi, dan hasil estetik untuk seluruh keluarga.
        </p>
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
          {CLINIC.hours.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-white text-sm font-semibold mb-3">Kontak</h4>
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-400" />
            <span>{CLINIC.address.primary.line}</span>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-400" />
            <span>{CLINIC.address.secondary.line}</span>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="w-4 h-4 flex-shrink-0 text-brand-400" />
            <span>{CLINIC.phoneDisplay}</span>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0 text-brand-400" />
            <span>{CLINIC.email}</span>
          </li>
          <li className="flex gap-3 pt-2">
            <a href="#" aria-label="Instagram" className="hover:text-white"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="Facebook" className="hover:text-white"><Facebook className="w-5 h-5" /></a>
            <a href="#" aria-label="TikTok" className="hover:text-white"><TikTok className="w-5 h-5" /></a>
          </li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-800">
      <div className="container-app py-4 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} {CLINIC.name} — All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
