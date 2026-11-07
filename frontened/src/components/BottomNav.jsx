/**
 * BottomNav — HelpJi Role-Aware Navigation
 * Customer: Saffron accent · Helper: Teal accent
 * Mobile-first & desktop floating dock with clear active states.
 */
import { useLanguage } from '../i18n/LanguageContext';
import { Home, ClipboardList, PlusCircle, Wallet, User, Compass, Briefcase, TrendingUp } from 'lucide-react';

export default function BottomNav({ mode, screen, setScreen }) {
  const { t } = useLanguage();

  const isHelper   = mode === 'helper';
  const roleColor  = isHelper ? '#1CA89C' : '#F4831F';
  const roleLight  = isHelper ? 'rgba(28,168,156,0.15)' : 'rgba(244,131,31,0.15)';

  const customerTabs = [
    { id: 'home',    icon: Home,          label: t('navHome') || 'Home' },
    { id: 'tasks',   icon: ClipboardList, label: t('navMyTasks') || 'My Tasks' },
    { id: 'post',    icon: PlusCircle,    label: t('navPost') || 'Post Task', highlight: true },
    { id: 'wallet',  icon: Wallet,        label: t('navPayments') || 'Wallet' },
    { id: 'profile', icon: User,          label: t('navProfile') || 'Profile' },
  ];

  const helperTabs = [
    { id: 'home',     icon: Compass,    label: t('navNearby') || 'Radar' },
    { id: 'bookings', icon: Briefcase,  label: t('navBookings') || 'Bookings' },
    { id: 'earnings', icon: TrendingUp, label: t('navEarnings') || 'Earnings' },
    { id: 'profile',  icon: User,       label: t('navProfile') || 'Profile' },
  ];

  const tabs = isHelper ? helperTabs : customerTabs;

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 sm:bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[560px] lg:max-w-[680px]
                 backdrop-blur-xl border px-3 pt-2 pb-3.5 sm:pb-2.5 sm:rounded-2xl z-[60]
                 transition-all duration-200"
      style={{
        background: 'var(--hj-paper-card)',
        borderColor: 'var(--hj-line)',
        boxShadow: 'var(--hj-shadow-float)',
      }}
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = screen === tab.id;
          const Icon = tab.icon;

          /* Highlighted center tab (Post Task) */
          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                type="button"
                id={`nav-${tab.id}`}
                onClick={() => setScreen(tab.id)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className="flex flex-col items-center -mt-6 group focus:outline-none cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center
                             shadow-lg group-hover:scale-105 group-active:scale-95
                             transition-all duration-200"
                  style={{ background: roleColor }}
                >
                  <Icon size={22} strokeWidth={2.5} color="white" />
                </div>
                <span
                  className="text-[10px] font-bold mt-1"
                  style={{ fontFamily: 'Sora, sans-serif', color: roleColor }}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-${tab.id}`}
              onClick={() => setScreen(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="flex-1 flex flex-col items-center gap-0.5 py-1 px-1 rounded-xl
                         transition-all duration-200 focus:outline-none group cursor-pointer"
            >
              <div
                className="p-1.5 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? roleLight : 'transparent',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 2}
                  style={{ color: isActive ? roleColor : 'var(--hj-ink-muted)' }}
                />
              </div>
              <span
                className="text-[10px] leading-none"
                style={{
                  fontFamily: 'Sora, sans-serif',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? roleColor : 'var(--hj-ink-muted)',
                  letterSpacing: '-0.01em',
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
