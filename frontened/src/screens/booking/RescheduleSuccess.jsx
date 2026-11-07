import { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, Clock3, User, Home } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { RESCHEDULE_PRESETS } from '../../data/bookingData';

export default function RescheduleSuccess({ taskData, rescheduleResult, onGoHome }) {
  const { lang } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);
  const helper = taskData?.helper || null;

  const presetData = RESCHEDULE_PRESETS.find((p) => p.id === rescheduleResult?.preset);
  const newTimeDisplay = rescheduleResult?.preset === 'custom'
    ? `${rescheduleResult.customDate || ''} ${rescheduleResult.customTime || ''}`
    : presetData?.label || 'Rescheduled';

  useEffect(() => {
    const tid = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-10 pb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-marigold/10 flex items-center justify-center mb-5 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-marigold flex items-center justify-center">
            <CheckCircle2 size={36} className="text-ink" />
          </div>
        </div>

        <h1 className="font-display text-[26px] font-bold text-ink mb-2 animate-fade-in-up">
          Rescheduled! 🗓️
        </h1>
        <p className="text-ink-soft text-[14px] max-w-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Your {label?.toLowerCase()} booking has been moved to a new time.
        </p>
      </div>

      {showContent && (
        <div className="px-5 pb-6 space-y-4 animate-fade-in-up">
          <div className="bg-paper-card border border-line rounded-2xl p-5 shadow-card">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-marigold" />
              Updated schedule
            </h3>

            <div className="space-y-3 mb-4 pb-4 border-b border-line">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-full bg-marigold/10 text-marigold-deep flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <div className="font-semibold text-ink text-[13.5px]">{newTimeDisplay}</div>
                  <div className="text-[11px] text-ink-soft">New date & time</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-9 h-9 rounded-full bg-paper text-ink-soft flex items-center justify-center">
                  <Clock3 size={16} />
                </div>
                <div>
                  <div className="font-semibold text-ink text-[13.5px]">{taskData?.dateTime || 'Original time'}</div>
                  <div className="text-[11px] text-ink-soft strikethrough opacity-60">Previous time</div>
                </div>
              </div>
            </div>

            {helper && (
              <div className="flex items-center gap-3">
                {helper.imageUrl ? (
                  <img src={helper.imageUrl} alt={helper.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-sm">
                    {helper.initials}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-ink">{helper.name}</div>
                  <div className="text-[11px] text-banyan">Has been notified of the change</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-marigold/5 border border-marigold/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-marigold-deep mb-1">
              <CheckCircle2 size={16} />
              What happens next?
            </div>
            <ol className="text-xs text-ink-soft space-y-1.5 mt-2 ml-5 list-decimal">
              <li>The helper has been notified of the new schedule</li>
              <li>They will confirm or suggest an alternative time</li>
              <li>You can chat if any adjustments are needed</li>
              <li>Everything else stays the same — price, location, and service</li>
            </ol>
          </div>

          <button
            onClick={onGoHome}
            className="w-full bg-ink text-white font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 active:scale-[0.98] transition-transform hover:bg-ink/90"
          >
            <Home size={18} /> Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

