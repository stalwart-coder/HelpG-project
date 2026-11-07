import { useState, useMemo } from 'react';
import { ChevronLeft, MapPin, Clock, User, Shield, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { PRICE_BREAKDOWN } from '../../data/bookingData';
import { ErrorState, LoadingState } from '../../components/ui/PageState';
import { formatINR } from '../../utils/format';

export default function BookingReview({ taskData, onBack, onConfirm }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = taskData?.category;
  const service = SERVICES.find((s) => s.id === category);
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const pricing = PRICE_BREAKDOWN[category] || PRICE_BREAKDOWN.iron;

  if (!taskData) {
    return (
      <div className="p-5">
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="bg-paper-card border border-line rounded-card p-6 shadow-card text-center">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold text-[15px] mb-1">No booking data</h3>
          <p className="text-sm text-ink-soft">Start by selecting a service and posting a task.</p>
        </div>
      </div>
    );
  }

  const handleConfirm = () => {
    setStatus('loading');
    setErrorMsg('');
    try {
      setStatus('idle');
      onConfirm?.();
    } catch (err) {
      setStatus('error');
      setErrorMsg('Unable to process your booking. Please try again.');
    }
  };

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState
          title="Booking failed"
          subtitle={errorMsg}
          onRetry={() => setStatus('idle')}
          retryLabel="Go back"
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {status === 'loading' && (
        <div className="p-5 pb-0">
          <LoadingState title="Confirming your booking..." subtitle="Reserving your helper and finalizing details." />
        </div>
      )}

      <div className={`px-5 pt-5 pb-6 ${service?.tag.bg || 'bg-paper'}`}>
        <button
          type="button"
          onClick={onBack}
          disabled={status === 'loading'}
          className="flex items-center gap-1 text-ink-soft text-sm mb-5 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{service?.icon || '📌'}</span>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
              Review your booking
            </div>
            <h1 className="font-display text-xl font-bold text-ink">{label}</h1>
          </div>
        </div>

        <div className="bg-white/80 border border-line rounded-2xl p-4 shadow-card">
          {taskData?.helper ? (
            <div className="flex items-center gap-3">
              {taskData.helper.avatar ? (
                <img src={taskData.helper.avatar} alt={taskData.helper.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display">
                  {taskData.helper.name?.[0] || 'H'}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-[14px] text-ink">{taskData.helper.name}</div>
                <div className="flex items-center gap-2 text-xs text-ink-soft mt-0.5">
                  <span className="text-marigold-deep">★ {taskData.helper.rating || 4.9}</span>
                  <span>·</span>
                  <span className="text-banyan">{taskData.helper.locality || 'Nearby'}</span>
                </div>
              </div>
              <div className="bg-banyan/10 text-banyan text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Shield size={11} /> Verified Partner
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl">
                ⚡
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[14px] text-ink">Instant Radar Dispatch</div>
                <div className="text-xs text-ink-soft mt-0.5">
                  Closest verified local partner will accept within minutes of confirmation.
                </div>
              </div>
              <div className="bg-emerald-500/10 text-emerald-600 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full">
                ● Live Dispatch
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pt-5 space-y-4">
        <div className="bg-paper-card border border-line rounded-card p-4 shadow-card">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">
            Task details
          </h3>
          <div className="space-y-3">
            {taskData.dateTime && (
              <div className="flex items-start gap-3 text-sm">
                <Clock size={16} className="mt-0.5 text-ink-soft shrink-0" />
                <div>
                  <div className="font-medium text-ink">{taskData.dateTime}</div>
                  <div className="text-[11px] text-ink-soft">
                    {taskData.duration === 'onetime' ? 'One-time visit' : taskData.duration === '1day' ? 'Within 24 hours' : 'Best for larger requests'}
                  </div>
                </div>
              </div>
            )}
            {taskData.location && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="mt-0.5 text-ink-soft shrink-0" />
                <div>
                  <div className="font-medium text-ink">{taskData.location}</div>
                  <div className="text-[11px] text-ink-soft">Helper will see full address after acceptance</div>
                </div>
              </div>
            )}
            {taskData.notes && (
              <div className="flex items-start gap-3 text-sm">
                <User size={16} className="mt-0.5 text-ink-soft shrink-0" />
                <div className="font-medium text-ink text-sm leading-relaxed">{taskData.notes}</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-paper-card border border-line rounded-card p-4 shadow-card">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">
            Price breakdown
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Service fee</span>
              <span className="font-medium">₹{formatINR(pricing.base)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Platform fee</span>
              <span className="font-medium">₹{formatINR(pricing.platformFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-soft">Tax (GST)</span>
              <span className="font-medium">₹{formatINR(pricing.tax)}</span>
            </div>
            <div className="border-t border-line pt-2.5 flex justify-between text-sm">
              <span className="font-semibold text-ink">Total</span>
              <span className="font-bold text-[17px] font-mono text-ink">₹{formatINR(pricing.total)}</span>
            </div>
          </div>
          <div className="mt-3 bg-banyan/5 border border-banyan/20 rounded-lg px-3 py-2 text-[11px] text-banyan flex items-center gap-1.5">
            <Shield size={12} />
            Service guarantee included. Pay only after the task is completed.
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={status === 'loading'}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} /> Continue to Payment — ₹{formatINR(pricing.total)}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

