/**
 * CategoryGrid — HelpJi Service Discovery Grid
 * Modern, interactive service cards with starting prices & ETAs.
 */
import { useLanguage } from '../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS, SERVICE_DESCS } from '../config/services';
import { ArrowRight, Clock, Zap } from 'lucide-react';

const SERVICE_META = {
  iron:     { startPrice: 199, eta: '15 min', badge: 'Fastest Match' },
  cleaning: { startPrice: 499, eta: '30 min', badge: 'Top Rated' },
  vehicle:  { startPrice: 299, eta: '20 min', badge: 'Doorstep' },
  groceries:{ startPrice: 99,  eta: '15 min', badge: 'Instant Run' },
  guard:    { startPrice: 799, eta: '1 hr',   badge: 'Verified' },
  event:    { startPrice: 999, eta: 'Same day',badge: 'Pro Helpers' },
};

export default function CategoryGrid({ onSelect }) {
  const { lang } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {SERVICES.map((s) => {
        const label = SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id] ?? s.name;
        const desc = SERVICE_DESCS[lang]?.[s.id] ?? SERVICE_DESCS.en[s.id] ?? s.desc;
        const meta = SERVICE_META[s.id] || { startPrice: 199, eta: '20 min', badge: 'Available' };

        return (
          <div
            key={s.id}
            onClick={() => onSelect(s.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(s.id)}
            className="group relative rounded-2xl p-4 sm:p-5 cursor-pointer
                       transition-all duration-200 hover:-translate-y-1
                       active:scale-[0.99] flex flex-col justify-between"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1px solid var(--hj-line)',
              boxShadow: 'var(--hj-shadow-card)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#F4831F';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(244,131,31,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--hj-line)';
              e.currentTarget.style.boxShadow = 'var(--hj-shadow-card)';
            }}
          >
            <div>
              {/* Header row: Icon + Badge + Arrow */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                  {s.icon}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded-[6px] text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: 'rgba(244,131,31,0.12)',
                      color: '#F4831F',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {meta.badge}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center
                               group-hover:bg-saffron-500 group-hover:text-white transition-colors"
                    style={{ background: 'var(--hj-paper-warm)', color: 'var(--hj-ink-soft)' }}
                  >
                    <ArrowRight size={13} />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <h3
                className="text-base font-bold mb-1 leading-snug group-hover:text-saffron-500 transition-colors"
                style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
              >
                {label}
              </h3>
              <p
                className="text-xs line-clamp-2 mb-4"
                style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}
              >
                {desc}
              </p>
            </div>

            {/* Footer row: ETA + Starting Price */}
            <div
              className="pt-3 border-t flex items-center justify-between text-xs font-semibold"
              style={{ borderColor: 'var(--hj-line)' }}
            >
              <div className="flex items-center gap-1.5" style={{ color: 'var(--hj-ink-muted)' }}>
                <Clock size={12} style={{ color: '#F4831F' }} />
                <span>ETA · {meta.eta}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-normal" style={{ color: 'var(--hj-ink-muted)' }}>From</span>
                <span
                  className="font-bold text-sm"
                  style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--hj-ink)' }}
                >
                  ₹{meta.startPrice}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
