/**
 * PinCard (TaskCard) — HelpJi Live Neighborhood Activity Card
 * Modern, high-information-density card with customer avatars, distance beacons, and pricing.
 */
import { MapPin, Clock, Star, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../config/services';

export default function PinCard({ task, onSelect }) {
  const { lang } = useLanguage();

  const catKey = typeof task.category === 'object'
    ? (task.category?.slug || task.category?.category)
    : (task.cat || task.category);

  const label = SERVICE_LABELS[lang]?.[catKey]
    ?? SERVICE_LABELS.en?.[catKey]
    ?? (typeof catKey === 'string' ? catKey : 'Task');

  const customerName = task.customer?.name || 'Local Resident';
  const customerRating = task.customer?.rating || 4.8;
  const initials = customerName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const locationLine = task.distanceKm != null
    ? `${task.distanceKm} km away`
    : task.location || 'Nearby';

  const isNearby = task.distanceKm != null && task.distanceKm <= 2;
  const clickable = !!onSelect;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => onSelect(task.id) : undefined}
      onKeyDown={clickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(task.id); }
      } : undefined}
      className={`
        group relative rounded-2xl p-5 flex flex-col justify-between
        transition-all duration-200
        ${clickable ? 'cursor-pointer hover:-translate-y-1' : ''}
      `}
      style={{
        background: 'var(--hj-paper-card)',
        border: '1.5px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.borderColor = '#F4831F';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(244,131,31,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.borderColor = 'var(--hj-line)';
          e.currentTarget.style.boxShadow = 'var(--hj-shadow-card)';
        }
      }}
    >
      {/* ── Top Header Row ── */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          {/* Category Chip */}
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold"
              style={{
                background: 'rgba(244,131,31,0.12)',
                color: '#F4831F',
                fontFamily: 'Sora, sans-serif',
              }}
            >
              {label}
            </span>

            {isNearby && (
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider"
                style={{
                  background: 'rgba(28,168,156,0.15)',
                  color: '#1CA89C',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                ⚡ Nearby
              </span>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#22C55E' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold">Open</span>
          </div>
        </div>

        {/* ── Task Title ── */}
        <h3
          className="text-base sm:text-lg font-bold leading-snug mb-2.5 group-hover:text-saffron-500 transition-colors"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
        >
          {task.title}
        </h3>

        {/* ── Location & Time Details ── */}
        <div className="space-y-1.5 mb-4 text-xs" style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
          <div className="flex items-center gap-1.5">
            <MapPin size={13} style={{ color: '#F4831F' }} className="shrink-0" />
            <span className="font-medium text-[var(--hj-ink-soft)]">
              {locationLine} {task.location ? `• ${task.location}` : ''}
            </span>
          </div>

          {task.when && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} style={{ color: 'var(--hj-ink-muted)' }} className="shrink-0" />
              <span style={{ color: 'var(--hj-ink-muted)' }}>
                {task.when} {task.completionTime ? `(${task.completionTime})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer: Customer Info & Price CTA ── */}
      <div
        className="pt-3.5 border-t flex items-center justify-between gap-2"
        style={{ borderColor: 'var(--hj-line)' }}
      >
        {/* Customer / Resident Profile */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #F4831F 0%, #E06A08 100%)' }}
          >
            {initials}
          </div>
          <div>
            <div className="text-xs font-bold truncate max-w-[110px]" style={{ color: 'var(--hj-ink)' }}>
              {customerName}
            </div>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--hj-ink-muted)' }}>
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span>{customerRating}</span>
              <span>• Verified</span>
            </div>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <div className="text-[10px]" style={{ color: 'var(--hj-ink-muted)' }}>Payout</div>
            <div
              className="text-lg font-black tracking-tight"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--hj-ink)' }}
            >
              ₹{task.price || 299}
            </div>
          </div>

          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center
                       group-hover:bg-saffron-500 group-hover:text-white transition-all"
            style={{
              background: 'var(--hj-paper-warm)',
              border: '1px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
          >
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
