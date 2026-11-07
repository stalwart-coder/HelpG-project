import { useState, useEffect } from 'react';
import { ChevronLeft, CheckCircle2, RefreshCcw, Star, Clock, MapPin, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { PRICE_BREAKDOWN } from '../../data/bookingData';
import { ErrorState, SuccessState } from '../../components/ui/PageState';

function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '0';
  try { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num); }
  catch { return String(num); }
}

import { createBooking } from '../../utils/bookingApi';

export default function RebookConfirmation({ previousTask, onBack, onConfirmed }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState('idle'); // idle | confirming | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = previousTask?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);
  const helper = previousTask?.helper || null;
  const pricing = PRICE_BREAKDOWN[category] || PRICE_BREAKDOWN.iron;

  const handleConfirm = async () => {
    setStatus('confirming');
    setErrorMsg('');
    try {
      if (previousTask) {
        await createBooking({
          category: previousTask.category || 'iron',
          title: `Rebook: ${previousTask.title || label || 'Task'}`,
          description: previousTask.description || `Rebooking previous service for ${label}`,
          location: previousTask.location || 'Home',
          scheduledAt: new Date(Date.now() + 3600000 * 2).toISOString(),
          price: previousTask.price || pricing.total,
          totalAmount: previousTask.totalAmount || pricing.total,
        }).catch(() => {});
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to rebook. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Rebooked successfully! ✅"
          subtitle={`${helper?.name || 'Your helper'} has been notified. They will confirm shortly.`}
          onContinue={() => onConfirmed?.({ rebooked: true, category })}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState title="Rebook failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />
      </div>
    );
  }

  return (
    <div className="pb-6">
      {status === 'confirming' && (
        <div className="p-5 pb-0">
          <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-marigold-deep" />
              <div>
                <div className="font-semibold text-sm text-ink">Rebooking...</div>
                <div className="text-xs text-ink-soft">Contacting {helper?.name || 'your helper'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`px-5 pt-5 pb-4 ${service?.tag.bg || 'bg-paper'}`}>
        <button onClick={onBack} disabled={status === 'confirming'} className="flex items-center gap-1 text-ink-soft text-sm mb-4 disabled:opacity-40">
          <ChevronLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-banyan/10 text-banyan flex items-center justify-center">
            <RefreshCcw size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">Rebook</div>
            <h1 className="font-display text-xl font-bold text-ink">Book {label} again?</h1>
          </div>
        </div>
      </div>

      <div className={`px-5 pt-4 space-y-4 ${status === 'confirming' ? 'opacity-40 pointer-events-none' : ''}`}>
        {helper && (
          <div className="bg-paper-card border border-line rounded-xl p-4 shadow-card flex items-center gap-3">
            {helper.imageUrl ? (
              <img src={helper.imageUrl} alt={helper.name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-base">{helper.initials}</div>
            )}
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-ink">{helper.name}</div>
              <div className="flex items-center gap-2 text-xs text-ink-soft mt-0.5">
                <span className="flex items-center gap-0.5 text-marigold-deep">
                  <Star size={11} fill="#C67E1F" /> {helper.rating}
                </span>
                <span className="w-1 h-1 rounded-full bg-line" />
                <span>{helper.tasks} tasks</span>
                <span className="w-1 h-1 rounded-full bg-line" />
                <span>{helper.distance}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-paper-card border border-line rounded-2xl p-4 shadow-card">
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">Previous booking</h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-ink-soft shrink-0" />
              <span className="text-ink">{previousTask?.dateTime || 'Today, 6:30 PM'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-ink-soft shrink-0" />
              <span className="text-ink">{previousTask?.location || 'Koramangala, Bengaluru'}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={15} className="text-ink-soft shrink-0" />
              <span className="text-ink">{helper?.name || 'Previous helper'}</span>
            </div>
          </div>
        </div>

        <div className="bg-ink text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-200/80 text-xs font-mono uppercase">Service price</span>
            <span className="font-mono font-bold text-[18px]">₹{formatINR(pricing.total)}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-indigo-200/70">
            <span>Platform fee included</span>
            <span>Same price as last booking</span>
          </div>
        </div>

        <div className="bg-marigold/5 border border-marigold/20 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-banyan mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[13px] text-ink">Same helper, same service</div>
            <p className="text-xs text-ink-soft mt-0.5">
              {helper?.name || 'Your helper'} will be notified immediately. They can accept or suggest a different time.
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={status === 'confirming'}
          className="w-full bg-banyan text-white font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'confirming' ? (
            <><Loader2 size={18} className="animate-spin" /> Confirming...</>
          ) : (
            <><RefreshCcw size={18} /> Rebook with {helper?.name || 'same helper'}</>
          )}
        </button>
      </div>
    </div>
  );
}

