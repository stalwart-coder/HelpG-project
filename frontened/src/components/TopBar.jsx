/**
 * TopBar — HelpJi Navigation Header
 * Clean, full-width, high-contrast light and dark mode header.
 */
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { MapPin, ChevronDown, User, Briefcase, LogOut, Sparkles } from 'lucide-react';

export default function TopBar({ mode = 'customer', setMode, onExit }) {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isHelper = mode === 'helper';
  const displayName = user?.name?.split(' ')[0] || (isHelper ? 'Helper' : 'User');
  const initials = (user?.name || (isHelper ? 'H' : 'U'))[0].toUpperCase();

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b px-4 sm:px-6 lg:px-8 py-3.5
                 transition-colors duration-200"
      style={{
        background: 'var(--hj-paper-card)',
        borderColor: 'var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
    >
      <div className="max-w-5xl xl:max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* ── Brand & Locality ── */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 text-left group focus:outline-none"
            aria-label="HelpJi Home"
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center
                         font-extrabold text-lg text-white group-hover:scale-105 transition-transform"
              style={{ background: isHelper ? '#1CA89C' : '#F4831F' }}
            >
              <span style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.03em' }}>H</span>
            </div>

            <div>
              <div
                className="flex items-center gap-1"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: 800,
                  fontSize: '1.125rem',
                  color: 'var(--hj-ink)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}
              >
                HelpJi
                {isHelper && (
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold"
                    style={{ background: 'rgba(28,168,156,0.15)', color: '#1CA89C' }}
                  >
                    Partner
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Neighborhood locality selector */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer
                       transition-colors"
            style={{
              background: 'var(--hj-paper-warm)',
              border: '1px solid var(--hj-line)',
              color: 'var(--hj-ink-soft)',
              fontFamily: 'DM Sans, sans-serif',
            }}
          >
            <MapPin size={12} style={{ color: isHelper ? '#1CA89C' : '#F4831F' }} />
            <span className="font-medium truncate max-w-[180px]">
              {user?.location || 'Koramangala 4th Block, Bengaluru'}
            </span>
          </div>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSelector />
          <ThemeToggle />

          {/* Switch Mode Button (Quick Access) */}
          <button
            type="button"
            onClick={() => setMode(isHelper ? 'customer' : 'helper')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold
                       transition-all active:scale-95 cursor-pointer"
            style={{
              fontFamily: 'Sora, sans-serif',
              background: isHelper ? 'rgba(244,131,31,0.12)' : 'rgba(28,168,156,0.12)',
              color: isHelper ? '#F4831F' : '#1CA89C',
              border: `1.5px solid ${isHelper ? 'rgba(244,131,31,0.30)' : 'rgba(28,168,156,0.30)'}`,
            }}
          >
            <Briefcase size={13} />
            <span>{isHelper ? t('switchCustomer') : t('switchHelper')}</span>
          </button>

          {/* User Profile Avatar / Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-full
                         transition-all focus:outline-none cursor-pointer"
              style={{
                background: 'var(--hj-paper-warm)',
                border: '1px solid var(--hj-line)',
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ background: isHelper ? '#1CA89C' : '#F4831F' }}
              >
                {initials}
              </div>
              <span
                className="hidden sm:inline-block text-xs font-semibold truncate max-w-[90px]"
                style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--hj-ink)' }}
              >
                {displayName}
              </span>
              <ChevronDown size={12} style={{ color: 'var(--hj-ink-muted)' }} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl p-2 z-50 animate-fade-in"
                  style={{
                    background: 'var(--hj-paper-card)',
                    border: '1px solid var(--hj-line)',
                    boxShadow: 'var(--hj-shadow-float)',
                  }}
                >
                  <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--hj-line)' }}>
                    <div className="text-xs font-bold truncate" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
                      {user?.name || (isHelper ? 'Helper Partner' : 'Aarav Sharma')}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--hj-ink-muted)' }}>
                      {user?.email || (isHelper ? 'helper@helpji.com' : 'customer@helpji.com')}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        setMode(isHelper ? 'customer' : 'helper');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold
                                 transition-colors cursor-pointer text-left"
                      style={{
                        color: isHelper ? '#F4831F' : '#1CA89C',
                        background: isHelper ? 'rgba(244,131,31,0.08)' : 'rgba(28,168,156,0.08)',
                      }}
                    >
                      <Briefcase size={14} />
                      <span>
                        {isHelper ? t('switchCustomer') : t('switchHelper')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2
                                 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      <LogOut size={14} />
                      {t('signOut')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
