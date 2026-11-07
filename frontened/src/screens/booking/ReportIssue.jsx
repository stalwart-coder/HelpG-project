import { useState } from 'react';
import { ChevronLeft, AlertTriangle, Loader2, X, Shield, Upload, ImagePlus } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { REPORT_REASONS } from '../../data/bookingData';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

import { createTicket } from '../../utils/supportApi';

export default function ReportIssue({ taskData, onBack, onConfirmed }) {
  const { lang } = useLanguage();
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [contactPermission, setContactPermission] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);

  const canSubmit = !!selectedReason && notes.trim().length >= 10 && status !== 'submitting';

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg('');

    try {
      const bookingId = taskData?.id || taskData?._id || taskData?.bookingId;
      await createTicket({
        subject: `Issue: ${selectedReason || 'Booking concern'}`,
        description: notes.trim(),
        category: 'booking_issue',
        bookingId: bookingId || undefined,
        priority: 'high',
      }).catch(() => {});

      setStatus('success');
      setTimeout(() => {
        onConfirmed?.({ reason: selectedReason, notes: notes.trim(), images, contactPermission });
      }, 800);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to submit report. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Report submitted"
          subtitle="Our support team will review and get back to you within 24 hours."
          onContinue={onBack}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState title="Report failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {status === 'submitting' && (
        <div className="p-5 pb-0">
          <LoadingState title="Submitting report..." subtitle="Your issue is being logged with our team." />
        </div>
      )}

      <div className={`px-5 pt-5 pb-4 ${service?.tag.bg || 'bg-paper'}`}>
        <button onClick={onBack} disabled={status === 'submitting'} className="flex items-center gap-1 text-ink-soft text-sm mb-4 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-brick flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">Report an issue</div>
            <h1 className="font-display text-xl font-bold text-ink">What went wrong?</h1>
          </div>
        </div>
      </div>

      <div className={`px-5 pt-4 space-y-4 ${status === 'submitting' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">Select issue type</h3>
          <div className="space-y-2">
            {REPORT_REASONS.map((reason) => {
              const isSelected = selectedReason === reason.id;
              return (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  disabled={status === 'submitting'}
                  className={`w-full text-left border rounded-xl p-3.5 transition-all disabled:opacity-60 ${
                    isSelected ? 'border-brick bg-rose-50 shadow-sm' : 'border-line bg-white hover:border-ink/20'
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
          <label htmlFor="report-notes" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Describe the issue <span className="text-brick">*</span>
          </label>
          <textarea
            id="report-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="Tell us what happened. Include dates, times, and any relevant details..."
            disabled={status === 'submitting'}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 h-28 resize-none disabled:opacity-60"
            aria-invalid={notes.trim().length > 0 && notes.trim().length < 10}
          />
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className="text-ink-soft">{notes.trim().length < 10 && notes.trim().length > 0 ? 'Minimum 10 characters' : ''}</span>
            <span className={`font-semibold ${notes.length > 450 ? 'text-rose-600' : 'text-ink-soft'}`}>{notes.length}/500</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-ink-soft mb-2">Attach evidence <span className="font-normal text-ink-soft/70">(optional)</span></h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = () => {
                  const files = Array.from(input.files || []).slice(0, 3);
                  setImages((prev) => [...prev, ...files].slice(0, 3));
                };
                input.click();
              }}
              disabled={status === 'submitting' || images.length >= 3}
              className="flex items-center gap-2 px-4 py-2.5 border border-line rounded-lg text-xs font-semibold text-ink-soft hover:bg-paper-card disabled:opacity-50"
            >
              <ImagePlus size={16} /> Add photo ({images.length}/3)
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={contactPermission}
            onChange={(e) => setContactPermission(e.target.checked)}
            disabled={status === 'submitting'}
            className="mt-0.5 accent-marigold-deep"
          />
          <span className="text-xs text-ink-soft leading-relaxed">
            I agree to be contacted by HelpJi support regarding this report. Your contact details will only be used for this purpose.
          </span>
        </label>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-brick text-white font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'submitting' ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting...</>
          ) : (
            <><Shield size={18} /> Submit Report</>
          )}
        </button>
      </div>
    </div>
  );
}

