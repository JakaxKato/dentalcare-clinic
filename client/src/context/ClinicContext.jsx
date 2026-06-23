import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { clinicSettingsService } from '../services';
import { CLINIC } from '../config/clinic';

const DEFAULTS = {
  clinicName: CLINIC.shortName,
  tagline: CLINIC.tagline,
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#f59e0b',
  accentColor: '#facc15',
  address: CLINIC.address.primary.line,
  mapEmbedUrl: CLINIC.mapEmbedSrc,
  phone: CLINIC.phoneDisplay,
  email: CLINIC.email,
  whatsapp: CLINIC.whatsappNumber,
  instagram: '',
  operatingHours: CLINIC.hours.lines.join('\n'),
  footerNote: '',
};

const ClinicContext = createContext({
  settings: DEFAULTS,
  loading: true,
  refresh: async () => {},
  applySettings: () => {},
});

const parseHex = (hex) => {
  if (!hex) return null;
  let value = hex.replace('#', '');
  if (value.length === 3) value = value.split('').map((char) => char + char).join('');
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

const mix = (source, target, weight) =>
  source.map((value, index) => Math.round(value + (target[index] - value) * weight));

const rgbValue = (rgb) => rgb.join(' ');

const setPalette = (root, name, hex, baseShade) => {
  const base = parseHex(hex);
  if (!base) return;
  const white = [255, 255, 255];
  const black = [0, 0, 0];
  const palette =
    baseShade === 600
      ? {
          50: mix(base, white, 0.93),
          100: mix(base, white, 0.84),
          200: mix(base, white, 0.7),
          300: mix(base, white, 0.5),
          400: mix(base, white, 0.28),
          500: mix(base, white, 0.12),
          600: base,
          700: mix(base, black, 0.15),
          800: mix(base, black, 0.3),
          900: mix(base, black, 0.45),
        }
      : {
          400: mix(base, white, 0.16),
          500: base,
          600: mix(base, black, 0.18),
        };

  Object.entries(palette).forEach(([shade, value]) => {
    root.style.setProperty(`--color-${name}-${shade}`, rgbValue(value));
  });
};

const applyDocumentSettings = (settings) => {
  const root = document.documentElement;
  setPalette(root, 'brand', settings.primaryColor, 600);
  setPalette(root, 'accent', settings.accentColor, 500);

  document.title = `${settings.clinicName} - ${settings.tagline || 'Klinik Gigi'}`;

  let favicon = document.querySelector("link[rel~='icon']");
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.href = settings.faviconUrl || '/tooth.svg';

  let themeColor = document.querySelector("meta[name='theme-color']");
  if (!themeColor) {
    themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    document.head.appendChild(themeColor);
  }
  themeColor.content = settings.primaryColor || DEFAULTS.primaryColor;
};

const readCachedSettings = () => {
  try {
    const cached = localStorage.getItem('dc_clinic_settings');
    return cached ? { ...DEFAULTS, ...JSON.parse(cached) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
};

export const ClinicProvider = ({ children }) => {
  const [settings, setSettings] = useState(readCachedSettings);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((nextSettings) => {
    const merged = { ...DEFAULTS, ...nextSettings };
    setSettings(merged);
    localStorage.setItem('dc_clinic_settings', JSON.stringify(merged));
    applyDocumentSettings(merged);
    return merged;
  }, []);

  const refresh = useCallback(async () => {
    try {
      applySettings(await clinicSettingsService.get());
    } catch {
      // Cached/default settings are already active.
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    applyDocumentSettings(settings);
    refresh();
    // Initial synchronization only; refresh and settings are stable at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ClinicContext.Provider value={{ settings, loading, refresh, applySettings }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => useContext(ClinicContext);

export default ClinicContext;
