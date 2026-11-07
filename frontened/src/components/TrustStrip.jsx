/**
 * TrustStrip — HelpJi Community Trust Indicators
 * High-contrast, theme-adaptive trust stats (Tasks completed, ratings, match time).
 */
import { useLanguage } from '../i18n/LanguageContext';
import { ShieldCheck, Star, Zap } from 'lucide-react';

export default function TrustStrip() {
  const { t } = useLanguage();

  const items = [
    {
      icon: ShieldCheck,
      num: '4,800+',
      lbl: t('trustTasksDone') || 'Tasks Completed',
      accent: '#22A355',   // banyan green
      accentBg: 'rgba(34,163,85,0.12)',
    },
    {
      icon: Star,
      num: '4.9 ★',
      lbl: t('trustAvgRating') || 'Average Rating',
      accent: '#F4831F',   // saffron
      accentBg: 'rgba(244,131,31,0.12)',
    },
    {
      icon: Zap,
      num: '14 min',
      lbl: t('trustMatchTime') || 'Average Match ETA',
      accent: '#1CA89C',   // teal
      accentBg: 'rgba(28,168,156,0.12)',
    },
  ];

  return (
    <div
      className="rounded-2xl p-4 sm:p-6 mb-8"
      style={{
        background: 'var(--hj-paper-card)',
        border: '1px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const isLast = i === items.length - 1;
          return (
            <div
              key={i}
              className="text-center px-2 flex flex-col items-center justify-center"
              style={{
                borderRight: isLast ? 'none' : '1px solid var(--hj-line)',
              }}
            >
              {/* Icon in colored dot */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center mb-2.5"
                style={{ background: item.accentBg }}
              >
                <Icon size={16} style={{ color: item.accent }} />
              </div>

              {/* Number */}
              <div
                className="text-base sm:text-xl font-bold tracking-tight mb-1"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--hj-ink)',
                }}
              >
                {item.num}
              </div>

              {/* Label */}
              <div
                className="text-[11px] sm:text-xs font-medium line-clamp-1"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  color: 'var(--hj-ink-soft)',
                }}
              >
                {item.lbl}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
