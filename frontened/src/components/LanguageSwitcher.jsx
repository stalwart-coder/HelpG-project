import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { LANGUAGES } from '../i18n/translations';

export default function LanguageSwitcher({ variant = 'dark' }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
          variant === 'dark' ? 'bg-white/10 text-white' : 'bg-paper-card border border-line text-ink'
        }`}
      >
        <span aria-hidden>🌐</span>
        {current?.label}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-paper-card text-ink rounded-lg shadow-lift border border-line py-1.5 w-36 z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2 text-sm hover:bg-paper ${
                l.code === lang ? 'font-semibold text-marigold-deep' : ''
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
