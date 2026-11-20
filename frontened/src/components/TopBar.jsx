/**
 * TopBar — HelpJi Navigation Header
 * Clean, full-width, high-contrast light and dark mode header.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { formatLocation } from '../utils/format';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { getUnreadCount } from '../utils/notificationApi';
import {
  MapPin,
  ChevronDown,
  Briefcase,
  LogOut,
  Bell,
  MessageSquare,
  LifeBuoy,
  ShieldAlert,
} from 'lucide-react';

export default function TopBar({ mode = 'customer', setMode, onExit }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isHelper = mode === 'helper';
  const displayName = user?.name?.split(' ')[0] || (isHelper ? 'Helper' : 'User');
  const initials = (user?.name || (isHelper ? 'H' : 'U'))[0].toUpperCase();

  useEffect(() => {
    let active = true;
    getUnreadCount()
      .then((data) => {
        if (active) setUnreadNotifications(data?.count || 0);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
              {formatLocation(user?.locality || user?.location)}
            </span>
          </div>
        </div>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Emergency SOS Button */}
          <button
            type="button"
            onClick={() => navigate('/sos')}
            title="Emergency SOS & Safety"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <ShieldAlert size={14} />
            <span className="hidden sm:inline">SOS</span>
          </button>

          {/* Live Chat Drawer / Inbox Button */}
          <button
            type="button"
            onClick={() => navigate(isHelper ? '/helper/chat' : '/customer/chat')}
            title="Chat & Messages"
            className="p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            style={{ border: '1px solid var(--hj-line)' }}
            aria-label="Messages"
          >
            <MessageSquare size={16} />
          </button>

          {/* Notifications Button */}
          <button
            type="button"
            onClick={() => navigate(isHelper ? '/helper/notifications' : '/customer/notifications')}
            title="Notifications"
            className="relative p-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            style={{ border: '1px solid var(--hj-line)' }}
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          <LanguageSelector />
          <ThemeToggle />

          {/* Role Status Badge (Enforced Role - No Arbitrary Switching) */}
          <div
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{
              fontFamily: 'Sora, sans-serif',
              background: isHelper ? 'rgba(28,168,156,0.12)' : 'rgba(244,131,31,0.12)',
              color: isHelper ? '#1CA89C' : '#F4831F',
              border: `1.5px solid ${isHelper ? 'rgba(28,168,156,0.30)' : 'rgba(244,131,31,0.30)'}`,
            }}
          >
            <Briefcase size={13} />
            <span>{isHelper ? '🛠️ Helper Partner' : '🙋 Customer'}</span>
          </div>

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
                        navigate(isHelper ? '/helper/profile' : '/customer/profile');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      style={{ color: 'var(--hj-ink)' }}
                    >
                      <span>👤 {t('navProfile') || 'My Profile'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate(isHelper ? '/helper/support' : '/customer/support');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      style={{ color: 'var(--hj-ink)' }}
                    >
                      <LifeBuoy size={14} className="text-emerald-500" />
                      <span>Support & Help Tickets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate(isHelper ? '/helper/chat' : '/customer/chat');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      style={{ color: 'var(--hj-ink)' }}
                    >
                      <MessageSquare size={14} className="text-blue-500" />
                      <span>Messages & Chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/sos');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 text-left transition-colors"
                    >
                      <ShieldAlert size={14} />
                      <span>Emergency SOS</span>
                    </button>

                    <div className="my-1 border-t" style={{ borderColor: 'var(--hj-line)' }} />

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
