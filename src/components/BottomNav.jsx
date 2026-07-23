import { useLanguage } from '../i18n/LanguageContext';

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>
  ),
  board: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M8 2v4M16 2v4M3 10h18" /></svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3 8-8" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M3 10h18M16 15h2" /></svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
  ),
};

export default function BottomNav({ mode, screen, setScreen }) {
  const { t } = useLanguage();

  const tabs =
    mode === 'customer'
      ? [
          { id: 'home', icon: 'home', label: t('navHome') },
          { id: 'tasks', icon: 'tasks', label: t('navMyTasks') },
          { id: 'post', icon: 'board', label: t('navPost') },
          { id: 'wallet', icon: 'wallet', label: t('navPayments') },
          { id: 'profile', icon: 'profile', label: t('navProfile') },
        ]
      : [
          { id: 'home', icon: 'home', label: t('navNearby') },
          { id: 'bookings', icon: 'tasks', label: t('navBookings') },
          { id: 'earnings', icon: 'wallet', label: t('navEarnings') },
          { id: 'profile', icon: 'profile', label: t('navProfile') },
        ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] lg:max-w-[1080px] bg-white border-t border-line flex px-1.5 pt-2.5 pb-3.5 shadow-[0_-6px_20px_rgba(27,35,64,0.08)] z-[60]">
      {tabs.map((tab) => {
        const isActive = screen === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setScreen(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-0.5 rounded-lg text-[10.5px] font-semibold transition-all duration-200 ${
              isActive ? 'text-marigold-deep scale-105' : 'text-ink-soft hover:text-ink/70'
            }`}
          >
            <span className={`w-[21px] h-[21px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
              {ICONS[tab.icon]}
            </span>
            <span className={`transition-all duration-200 ${isActive ? 'font-bold' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
