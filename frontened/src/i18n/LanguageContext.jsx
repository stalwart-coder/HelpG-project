import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations, LANGUAGES } from './translations';

const LanguageContext = createContext(null);

const LOCALE_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
  es: 'es-ES',
  gu: 'gu-IN',
  bn: 'bn-IN',
};

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const saved = localStorage.getItem('helpji_lang');
      if (saved && ['en', 'hi', 'mr', 'es', 'gu', 'bn'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem('helpji_lang', newLang);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations.en[key] ?? key;
  }, [lang]);

  // ── Locale-Aware Formatters ───────────────────────────────────────────────
  const activeLocale = LOCALE_MAP[lang] || 'en-IN';

  const formatCurrency = useCallback((amount) => {
    const num = Number(amount) || 0;
    try {
      return new Intl.NumberFormat(activeLocale, {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(num);
    } catch {
      return `₹${num.toLocaleString()}`;
    }
  }, [activeLocale]);

  const formatNumber = useCallback((val) => {
    const num = Number(val) || 0;
    try {
      return new Intl.NumberFormat(activeLocale).format(num);
    } catch {
      return num.toString();
    }
  }, [activeLocale]);

  const formatDate = useCallback((date, options = {}) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    try {
      return new Intl.DateTimeFormat(activeLocale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
      }).format(d);
    } catch {
      return d.toLocaleDateString();
    }
  }, [activeLocale]);

  const formatTime = useCallback((date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    try {
      return new Intl.DateTimeFormat(activeLocale, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(d);
    } catch {
      return d.toLocaleTimeString();
    }
  }, [activeLocale]);

  const formatRelativeTime = useCallback((date) => {
    if (!date) return '—';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '—';
    const diffSeconds = Math.round((d.getTime() - Date.now()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(activeLocale, { numeric: 'auto' });

    if (Math.abs(diffSeconds) < 60) return rtf.format(diffSeconds, 'second');
    const diffMinutes = Math.round(diffSeconds / 60);
    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute');
    const diffHours = Math.round(diffMinutes / 60);
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
    const diffDays = Math.round(diffHours / 24);
    return rtf.format(diffDays, 'day');
  }, [activeLocale]);

  const value = useMemo(() => ({
    lang,
    setLang,
    t,
    languages: LANGUAGES,
    formatCurrency,
    formatNumber,
    formatDate,
    formatTime,
    formatRelativeTime,
  }), [lang, setLang, t, formatCurrency, formatNumber, formatDate, formatTime, formatRelativeTime]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
