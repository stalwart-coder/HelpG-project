import { useMemo, useState } from 'react';
import { ChevronLeft, MapPin, Clock, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICE_LABELS } from '../../config/services';
import Timeline from '../../components/Timeline';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

export default function BookingDetail({ booking, onBack, onUpdateStatus }) {
  const { lang, t } = useLanguage();

  const [action, setAction] = useState('idle'); // idle|loading|success|error
  const [errorMsg, setErrorMsg] = useState('');

  const resolvedBooking = booking;

  const label =
    resolvedBooking && (SERVICE_LABELS[lang]?.[resolvedBooking.cat] ?? SERVICE_LABELS.en[resolvedBooking.cat]);

  const steps = useMemo(() => {
    if (!resolvedBooking) return [];
    return [
      { label: t('stepPosted') || 'Task accepted', time: resolvedBooking.when || '—', state: 'done' },
      {
        label: 'On the way',
        time: '',
        state:
          resolvedBooking.status === 'progress'
            ? 'current'
            : resolvedBooking.status === 'done'
              ? 'done'
              : 'pending',
      },
      {
        label: t('stepInProgress') || 'Task in progress',
        time: '',
        state: resolvedBooking.status === 'done' ? 'done' : 'pending',
      },
      {
        label: t('stepCompleted') || 'Completed & paid',
        time: '',
        state: resolvedBooking.status === 'done' ? 'done' : 'pending',
      },
    ];
  }, [resolvedBooking, t]);

  if (!resolvedBooking) {
    return (
      <div className="p-5">
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back
        </button>
        <EmptyState title="No booking selected" subtitle="Return to your bookings and pick one." />
      </div>
    );
  }

  return (
    <div className="p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      {action === 'loading' && (
        <div className="mb-4">
          <LoadingState title="Marking completed…" subtitle="Notifying the customer." />
        </div>
      )}
      {action === 'success' && (
        <div className="mb-4">
          <SuccessState
            title="Booking completed"
            subtitle="Payment will be released after confirmation."
            onContinue={() => setAction('idle')}
          />
        </div>
      )}
      {action === 'error' && (
        <div className="mb-4">
          <ErrorState
            title="Couldn’t update status"
            subtitle={errorMsg}
            onRetry={() => {
              setAction('idle');
              setErrorMsg('');
            }}
          />
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-lg font-display font-semibold">{label}</h2>
          <p className="text-ink-soft text-[13px]">#{resolvedBooking.id}</p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            resolvedBooking.status === 'open'
              ? 'bg-emerald-50 text-banyan'
              : resolvedBooking.status === 'progress'
                ? 'bg-amber-50 text-marigold-deep'
                : 'bg-gray-100 text-ink-soft'
          }`}
        >
          {resolvedBooking.status === 'open'
            ? 'Open'
            : resolvedBooking.status === 'progress'
              ? 'In progress'
              : 'Completed'}
        </span>
      </div>

      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4 space-y-3">
        <h3 className="text-[14.5px] font-semibold">{resolvedBooking.title}</h3>
        {resolvedBooking.location && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <MapPin size={14} /> {resolvedBooking.location}
          </div>
        )}
        {resolvedBooking.when && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <Clock size={14} /> {resolvedBooking.when}
          </div>
        )}
        {resolvedBooking.customer && (
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <User size={14} /> {resolvedBooking.customer.name}
            {resolvedBooking.customer.rating && (
              <span className="text-marigold-deep text-xs font-semibold ml-1">★ {resolvedBooking.customer.rating}</span>
            )}
          </div>
        )}
        <div className="pt-2 border-t border-line flex items-center justify-between">
          <span className="text-xs text-ink-soft font-mono uppercase">Your earning</span>
          <span className="font-mono font-bold text-[16px]">₹{resolvedBooking.price}</span>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2 font-mono">Status timeline</div>
      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
        <Timeline steps={steps} />
      </div>

      {resolvedBooking.status === 'progress' && (
        <button
          disabled={action === 'loading'}
          onClick={() => {
            setAction('loading');
            setErrorMsg('');
            setTimeout(() => {
              const shouldError = Math.random() < 0.08;
              if (shouldError) {
                setAction('error');
                setErrorMsg('Customer confirmation failed. Please try again.');
                return;
              }
              onUpdateStatus?.(resolvedBooking.id, 'done');
              setAction('success');
            }, 900);
          }}
          className="w-full bg-banyan text-white py-3.5 rounded-[10px] font-bold text-[14px] mt-2 disabled:opacity-60"
        >
          {action === 'loading' ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin" /> Updating
            </span>
          ) : (
            'Mark as completed'
          )}
        </button>
      )}
    </div>
  );
}

