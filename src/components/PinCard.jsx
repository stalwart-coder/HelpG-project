import { MapPin, Clock, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../config/services';
import StatusChip from './StatusChip';

export default function PinCard({ task, actionLabel, onAction, actionDisabled, onCardClick }) {
  const { lang } = useLanguage();
  const service = SERVICES.find((s) => s.id === task.cat);
  const label = SERVICE_LABELS[lang]?.[task.cat] ?? SERVICE_LABELS.en[task.cat];

  // Show distanceKm if present, otherwise fall back to location text — never both
  const locationLine = task.distanceKm != null
    ? `${task.distanceKm} km away`
    : task.location || null;

  const clickable = !!onCardClick;
  const canRunAction = !!onAction && !actionDisabled;

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onCardClick : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick(); } } : undefined}
      className={`group bg-white border border-line rounded-2xl p-4 mb-3.5 shadow-card hover:shadow-card-hover hover:border-ink/10 transition-all duration-300 hover:-translate-y-0.5 ${clickable ? 'cursor-pointer' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md font-mono ${service?.tag.bg} ${service?.tag.text}`}
        >
          {label}
        </span>
        <StatusChip status={task.status} />
      </div>

      <h3 className="text-[15px] font-semibold text-ink mb-2 leading-snug">{task.title}</h3>

      <div className="flex gap-3.5 text-xs text-ink-soft mb-3.5 flex-wrap">
        {locationLine && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {locationLine}
          </span>
        )}
        {task.when && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> {task.when}
          </span>
        )}
        {task.helper && (
          <span className="flex items-center gap-1 text-ink font-medium">
            👤 {task.helper}
            {task.helperRating && (
              <span className="flex items-center gap-0.5 text-marigold-deep">
                <Star size={11} fill="currentColor" /> {task.helperRating}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 border-t border-line/70">
        <div>
          <div className="text-[10px] text-ink-soft font-mono uppercase tracking-wide">Price</div>
          <div className="text-[17px] font-bold text-ink font-mono">₹{task.price}</div>
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (canRunAction) onAction(); }}
            disabled={!canRunAction}
            className={`rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-200 active:scale-[.95] hover:shadow-soft ${
              !canRunAction
                ? 'bg-paper-card border border-line text-ink-soft cursor-not-allowed'
                : 'bg-ink text-white hover:bg-ink/90 hover:shadow-lift'
            }`}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
