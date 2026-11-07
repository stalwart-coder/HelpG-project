import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function LanguageSelector({ variant = 'compact', className = '' }) {
  const { lang, setLang, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold 
                   bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 
                   border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/70 
                   dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs"
        aria-expanded={isOpen}
        aria-label="Select Language"
      >
        <Globe size={14} className="text-amber-600 dark:text-amber-400" />
        <span>{currentLang.native}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-1.5 animate-scale-in">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700/60 mb-1">
            Choose Language
          </div>
          {languages.map((l) => {
            const isSelected = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
              >
                <div className="flex flex-col">
                  <span>{l.native}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">{l.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-amber-600 dark:text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
