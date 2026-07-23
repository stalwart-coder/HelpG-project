import { useState, useEffect } from 'react';
import { Search, MapPin, Menu, X } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher';
import { matchServiceFromQuery } from '../../utils/search';

export default function Navbar({ onGetStarted, onBecomeHelper, onSelectService }) {
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
    <div
      className={`sticky top-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-white/60 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-10 h-[68px] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display text-xl font-bold text-ink shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-marigold" />
          HelpJi
        </div>

        <div className="hidden md:flex items-center gap-1.5 bg-paper-card border border-line rounded-full px-4 py-2 flex-1 max-w-md">
          <MapPin size={15} className="text-ink-soft shrink-0" />
          <span className="text-[13px] text-ink-soft truncate">Malviya Nagar, Jaipur</span>
          <div className="w-px h-4 bg-line mx-1" />
          <Search size={15} className="text-ink-soft shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search 'ironing near me'"
            className="bg-transparent text-[13px] outline-none flex-1 min-w-0 placeholder:text-ink-soft/60"
            disabled={searching}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching}
            className="text-[12px] font-semibold text-marigold-deep shrink-0 disabled:opacity-50"
          >
            {searching ? '…' : 'Search'}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 shrink-0">
          <LanguageSwitcherLight />
          <button
            type="button"
            onClick={becomeHelper}
            className="text-[13.5px] font-semibold text-ink px-3 py-2 hover:text-marigold-deep transition-colors"
          >
            Become a Helper
          </button>
          <button
            type="button"
            onClick={getStarted}
            className="bg-ink text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-all hover:shadow-lift active:scale-[.97]"
          >
            Get Started
          </button>
        </div>

        <button type="button" className="md:hidden p-2" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-white px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-paper-card border border-line rounded-full px-4 py-2">
            <Search size={15} className="text-ink-soft shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search services…"
              className="bg-transparent text-sm outline-none flex-1"
              disabled={searching}
            />
          </div>
          <button type="button" onClick={becomeHelper} className="text-left text-sm font-semibold py-2">
            Become a Helper
          </button>
          <button type="button" onClick={getStarted} className="bg-ink text-white text-sm font-semibold py-3 rounded-full">
            Get Started
          </button>
        </div>
      )}
    </div>
  );
}

function LanguageSwitcherLight() {
  return <LanguageSwitcher variant="light" />;
}
