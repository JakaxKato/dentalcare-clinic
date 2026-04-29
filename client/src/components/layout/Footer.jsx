import { Link } from 'react-router-dom';
import { CLINIC } from '../../config/clinic';

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 mt-16">
    <div className="container-app py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">🦷</div>
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
          <li>📍 {CLINIC.address.primary.line}</li>
          <li>📍 {CLINIC.address.secondary.line}</li>
          <li>📞 {CLINIC.phoneDisplay}</li>
          <li>📧 {CLINIC.email}</li>
          <li className="flex gap-3 pt-2">
            <a href="#" aria-label="Instagram" className="hover:text-white">Instagram</a>
            <a href="#" aria-label="Facebook" className="hover:text-white">Facebook</a>
            <a href="#" aria-label="TikTok" className="hover:text-white">TikTok</a>
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
