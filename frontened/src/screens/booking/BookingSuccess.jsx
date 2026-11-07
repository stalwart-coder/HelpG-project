import { useState, useEffect } from 'react';
import { CheckCircle2, MapPin, Clock, User, ArrowRight, Home } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { formatINR } from '../../utils/format';

export default function BookingSuccess({ taskData, paymentMethod, onGoHome }) {
  const { lang } = useLanguage();
  const [showContent, setShowContent] = useState(false);

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);
  const helper = taskData?.helper || null;

  useEffect(() => {
    const tid = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-10 pb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-banyan/10 flex items-center justify-center mb-5 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-banyan flex items-center justify-center">
            <CheckCircle2 size={36} className="text-white" />
          </div>
        </div>

        <h1 className="font-display text-[26px] font-bold text-ink mb-2 animate-fade-in-up">
          Booking Confirmed! 🎉
        </h1>
        <p className="text-ink-soft text-[14px] max-w-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Your {label?.toLowerCase()} task has been posted. A helper will be matched shortly.
        </p>
      </div>

      {showContent && (
        <div className="px-5 pb-6 space-y-4 animate-fade-in-up">
          <div className="bg-paper-card border border-line rounded-2xl p-5 shadow-card">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-banyan" />
              Your helper
            </h3>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line">
              {helper?.avatar ? (
                <img src={helper.avatar} alt={helper.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-marigold/30" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display text-lg">
                  {helper?.name?.[0] || '⚡'}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[15px] text-ink">{helper?.name || 'Live Radar Active'}</div>
                <div className="flex items-center gap-2 text-xs text-ink-soft mt-0.5">
                  <span className="text-marigold-deep">★ {helper?.rating || 4.9}</span>
                  <span>·</span>
                  <span>{helper ? `${helper.completedTasks || 0} tasks done` : 'Dispatched to nearby helpers'}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-banyan mt-1">
                  <MapPin size={11} /> {helper?.locality || 'Local Neighborhood'} · ETA {helper?.etaMinutes ? `${helper.etaMinutes} min` : '~10 min'}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-sm">
                <Clock size={15} className="mt-0.5 text-ink-soft shrink-0" />
                <div>
                  <div className="font-medium text-ink text-[13px]">{taskData?.dateTime || 'Today'}</div>
                  <div className="text-[11px] text-ink-soft">{taskData?.duration === 'onetime' ? 'One-time visit' : 'Flexible timing'}</div>
                </div>
              </div>
              {taskData?.location && (
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin size={15} className="mt-0.5 text-ink-soft shrink-0" />
                  <div className="text-[13px] text-ink">{taskData.location}</div>
                </div>
              )}
              <div className="flex items-start gap-2.5 text-sm">
                <User size={15} className="mt-0.5 text-ink-soft shrink-0" />
                <div className="text-[13px] text-ink">{service?.icon} {label}</div>
              </div>
            </div>
          </div>

          <div className="bg-banyan/5 border border-banyan/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-banyan mb-1">
              <CheckCircle2 size={16} />
              What happens next?
            </div>
            <ol className="text-xs text-ink-soft space-y-1.5 mt-2 ml-5 list-decimal">
              <li>Nearby verified helpers will see your request</li>
              <li>You'll get a notification when a helper accepts</li>
              <li>Chat with helper and track their arrival in real-time</li>
              <li>Pay after the task is completed to your satisfaction</li>
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

