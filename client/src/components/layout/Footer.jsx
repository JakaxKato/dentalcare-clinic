import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import { CLINIC } from "../../config/clinic";
import { useClinic } from "../../context/ClinicContext";
import ToothIcon from "../common/ToothIcon";

const Footer = () => {
  const { settings } = useClinic();
  const brandName = settings.clinicName || CLINIC.shortName;
  const tagline =
    settings.tagline ||
    "Klinik gigi modern yang fokus pada kenyamanan, transparansi, dan hasil terbaik.";

  return (
    <footer className="mt-20 border-t border-stone-200/80 bg-stone-50 text-stone-600 dark:border-stone-800 dark:bg-stone-950">
      <div className="container-app grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        {/* Brand */}
        <div className="md:col-span-1">
          <div className="mb-3 flex items-center gap-2.5">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={brandName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-stone-950 shadow-sm">
                <ToothIcon className="h-4.5 w-4.5" strokeWidth={2.2} />
              </div>
            )}
            <span className="font-bold text-stone-950 dark:text-stone-50">
              {brandName}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-stone-500 dark:text-stone-400 max-w-[220px]">
            {tagline}
          </p>
        </div>

        {/* Nav links */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Navigasi
          </h4>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: "/", label: "Beranda" },
              { to: "/services", label: "Layanan" },
              { to: "/dentists", label: "Dokter" },
              { to: "/blog", label: "Artikel" },
              { to: "/contact", label: "Kontak" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-stone-500 hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-400 transition-colors"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Operating hours */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Jam Operasional
          </h4>
          <ul className="space-y-1.5 text-sm text-stone-500 dark:text-stone-400">
            {(settings.operatingHours || CLINIC.hours.lines.join("\n"))
              .split("\n")
              .filter(Boolean)
              .map((line) => (
                <li key={line}>{line}</li>
              ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
            Kontak
          </h4>
          <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
            {(settings.address || CLINIC.address.primary.line) && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <span>{settings.address || CLINIC.address.primary.line}</span>
              </li>
            )}
            {(settings.phone || CLINIC.phoneDisplay) && (
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <span>{settings.phone || CLINIC.phoneDisplay}</span>
              </li>
            )}
            {(settings.email || CLINIC.email) && (
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <span>{settings.email || CLINIC.email}</span>
              </li>
            )}
            {settings.instagram && (
              <li className="pt-1">
                <a
                  href={`https://instagram.com/${settings.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-stone-400 hover:text-brand-700 dark:hover:text-brand-400 transition-colors text-xs font-medium"
                >
                  Instagram {settings.instagram}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200/80 dark:border-stone-800">
        <div className="container-app py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
          <span>
            © {new Date().getFullYear()} {brandName}.{" "}
            {settings.footerNote || "All rights reserved."}
          </span>
          <span className="flex gap-4">
            <Link
              to="/contact"
              className="hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
            >
              Kontak
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
