import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X, ArrowRight } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import ThemeToggle from '../ThemeToggle';
import { useLanguage } from '../../i18n/LanguageContext';
import { matchServiceFromQuery } from '../../utils/search';

export default function Navbar({ onGetStarted, onBecomeHelper, onSelectService }) {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = () => {
    if (searching) return;
    setSearching(true);
    const serviceId = matchServiceFromQuery(query);
    setTimeout(() => {
      setSearching(false);
      setMobileOpen(false);
      if (serviceId) {
        onSelectService?.(serviceId);
      } else {
        onGetStarted();
      }
    }, 300);
  };

  const becomeHelper = () => {
    setMobileOpen(false);
    onBecomeHelper?.();
  };

  const getStarted = () => {
    setMobileOpen(false);
    onGetStarted?.();
  };

  return (
    <header
      className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800/80' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={getStarted}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
            H
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-display font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              HelpJi
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400/90 mt-0.5">
              Kaam ka Bharosa
            </div>
          </div>
        </div>

        {/* Global Search (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl px-4 py-2 flex-1 max-w-md focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
          <MapPin size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">Koramangala, Bengaluru</span>
          <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
          <Search size={15} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('searchPlaceholder')}
            className="bg-transparent text-xs text-slate-900 dark:text-slate-100 outline-none flex-1 min-w-0 placeholder:text-slate-400"
            disabled={searching}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 uppercase tracking-wider shrink-0 disabled:opacity-50"
          >
            {searching ? '…' : t('findBtn')}
          </button>
        </div>

        {/* Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            onClick={becomeHelper}
            className="text-xs font-bold text-slate-700 dark:text-slate-200 px-3.5 py-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
          >
            {t('becomeHelperNav')}
          </button>
          <button
            type="button"
            onClick={getStarted}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <span>{t('signInNav')}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />
          <button 
            type="button" 
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
            onClick={() => setMobileOpen((o) => !o)} 
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 flex flex-col gap-3 shadow-xl animate-fade-in-down">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('searchPlaceholder')}
              className="bg-transparent text-sm outline-none flex-1 text-slate-900 dark:text-white"
              disabled={searching}
            />
          </div>
          <button 
            type="button" 
            onClick={becomeHelper} 
            className="text-left text-sm font-semibold text-slate-700 dark:text-slate-300 py-2 border-b border-slate-100 dark:border-slate-800"
          >
            🛠️ {t('becomeHelperNav')}
          </button>
          <button 
            type="button" 
            onClick={getStarted} 
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm py-3 rounded-xl shadow-sm text-center"
          >
            {t('signInNav')}
          </button>
        </div>
      )}
    </header>
  );
}
