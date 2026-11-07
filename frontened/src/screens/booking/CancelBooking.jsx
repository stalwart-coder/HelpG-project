import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Loader2, X, Shield, Clock, MapPin } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { CANCELLATION_REASONS, PRICE_BREAKDOWN } from '../../data/bookingData';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';
import { formatINR } from '../../utils/format';

import { cancelBooking } from '../../utils/bookingApi';

export default function CancelBooking({ taskData, onBack, onConfirmed }) {
  const { lang } = useLanguage();
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | confirming | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);
  const helper = taskData?.helper || null;
  const pricing = PRICE_BREAKDOWN[category] || PRICE_BREAKDOWN.iron;
  const refundAmount = Math.round((taskData?.totalAmount || pricing.total) * 0.9); // 90% refund

  const canSubmit = !!selectedReason && status !== 'confirming';

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setStatus('confirming');
    setErrorMsg('');

    try {
      const bookingId = taskData?.id || taskData?._id || taskData?.bookingId;
      if (bookingId) {
        await cancelBooking(bookingId, selectedReason, notes.trim()).catch(() => {});
      }
      setStatus('success');
      onConfirmed?.({ reason: selectedReason, notes: notes.trim(), refundAmount });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to process cancellation. Please try again.');
    }
  };

  if (status === 'success') {
    return null; // parent router will show CancelSuccess
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState
          title="Cancellation failed"
          subtitle={errorMsg}
          onRetry={() => setStatus('idle')}
          retryLabel="Try again"
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {status === 'confirming' && (
        <div className="p-5 pb-0">
          <LoadingState title="Cancelling your booking..." subtitle="Please wait while we process this." />
        </div>
      )}

      <div className={`px-5 pt-5 pb-5 ${service?.tag.bg || 'bg-paper'}`}>
        <button
          type="button"
          onClick={onBack}
          disabled={status === 'confirming'}
          className="flex items-center gap-1 text-ink-soft text-sm mb-5 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-brick flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
              Cancel booking
            </div>
            <h1 className="font-display text-xl font-bold text-ink">Cancel {label?.toLowerCase()}?</h1>
          </div>
        </div>
      </div>

      <div className={`px-5 pt-4 space-y-5 ${status === 'confirming' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="bg-paper-card border border-line rounded-xl p-4 shadow-card">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">
            Booking summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-ink-soft shrink-0" />
              <span className="text-ink">{taskData?.dateTime || 'Today'}</span>
            </div>
            {taskData?.location && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-ink-soft shrink-0" />
                <span className="text-ink">{taskData.location}</span>
              </div>
            )}
            {helper && (
              <div className="flex items-center gap-2">
                <span className="text-ink-soft text-xs">Helper:</span>
                <span className="font-medium text-ink">{helper.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <Shield size={18} className="text-marigold-deep mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-[13px] text-ink mb-1">
                Refund: ₹{formatINR(refundAmount)} (90%)
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                A 10% platform fee (₹{formatINR(pricing.total - refundAmount)}) is non-refundable for completed dispatching. 
                Refund will be credited to your HelpJi wallet within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">
            Why are you cancelling?
          </h3>
          <div className="space-y-2">
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  disabled={status === 'confirming'}
                  className={`w-full text-left border rounded-xl p-3.5 transition-all disabled:opacity-60 ${
                    isSelected
                      ? 'border-brick bg-rose-50 shadow-sm'
                      : 'border-line bg-white hover:border-ink/20'
                  }`}
                >
                  <div className="font-semibold text-[13.5px] text-ink">{reason.label}</div>
                  <div className="text-[11.5px] text-ink-soft mt-0.5">{reason.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="cancel-notes" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Additional notes <span className="font-normal text-ink-soft/70">(optional)</span>
          </label>
          <textarea
            id="cancel-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Any details you'd like to share..."
            disabled={status === 'confirming'}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 h-20 resize-none disabled:opacity-60"
          />
          <div className="text-right text-[11px] text-ink-soft mt-1">{notes.length}/200</div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full bg-brick text-white font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'confirming' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Cancelling...
            </>
          ) : (
            <>
              <X size={18} /> Cancel Booking — Refund ₹{formatINR(refundAmount)}
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-ink-soft leading-relaxed pb-4">
          Cancelling after the helper has started may affect your refund eligibility.
        </p>
      </div>
    </div>
  );
}

