import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronDown, Star, Check, Clock } from 'lucide-react';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { SERVICE_DETAILS, SERVICE_REVIEWS } from '../../data/serviceDetails';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonTaskDetail } from '../../components/ui/PageState';

export default function ServiceDetail({ category, onBack, onBook }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedTier, setSelectedTier] = useState(1);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | ready | error
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookedTier, setBookedTier] = useState(null);


  const service = SERVICES.find((s) => s.id === category);
  const detail = SERVICE_DETAILS[category];
  const reviews = SERVICE_REVIEWS[category] || [];
  const label = SERVICE_LABELS.en[category];

  useEffect(() => {
    setLoadStatus('loading');
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.04;
      if (shouldError) {
        setLoadStatus('error');
        setErrorMsg('We could not load this service right now.');
        return;
      }
      setLoadStatus('ready');
    }, 550);
    return () => clearTimeout(tid);
  }, [category, loadAttempt]);

  if (loadStatus === 'loading') {
    return <SkeletonTaskDetail />;
  }

  if (loadStatus === 'error') {
    return (
      <ErrorState
        title="Service unavailable"
        subtitle={errorMsg}
        onRetry={() => {
          setErrorMsg('');
          setLoadAttempt((n) => n + 1);
        }}
      />
    );
  }

  if (!service || !detail) {
    return (
      <EmptyState
        title="No service selected"
        subtitle="Choose a service from the home page to see plans, reviews, and booking options."
        cta={
          <button
            type="button"
            onClick={onBack}
            className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
          >
            Back to services
          </button>
        }
      />
    );
  }

  const selected = detail.tiers[selectedTier] || detail.tiers[0];

  const handleBook = () => {
    if (!selected) return;

    setStatus('loading');
    setErrorMsg('');

    setTimeout(() => {
      const shouldError = Math.random() < 0.08;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Booking failed. Please try again in a moment.');
        return;
      }

      setBookedTier(selectedTier);
      setStatus('success');
    }, 900);
  };

  if (status === 'success') {
    return (
      <SuccessState
        title="Booking request sent"
        subtitle="A helper will be notified and can confirm shortly."
        onContinue={() => {
          if (onBook) onBook(category, bookedTier ?? selectedTier);
          else onBack?.();
        }}
      />
    );
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Couldn’t book"
        subtitle={errorMsg}
        onRetry={handleBook}
        retryLabel="Try again"
      />
    );
  }

  return (
    <div className="pb-4">
      <div className={`px-5 pt-5 pb-8 ${service.tag.bg}`}>
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-5" disabled={status === 'loading'}>
          <ChevronLeft size={16} /> Back
        </button>

        <div className="text-5xl mb-4">{service.icon}</div>

        <span
          className={`text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md font-mono ${service.tag.bg} ${service.tag.text} border border-current/20 inline-block mb-3`}
        >
          {label}
        </span>

        <h1 className="font-display text-2xl font-bold text-ink mb-2">{detail.heroTitle}</h1>
        <p className="text-ink-soft text-sm leading-relaxed max-w-md">{detail.heroDesc}</p>

        <div className="mt-5 bg-white/80 border border-line rounded-2xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold font-mono">
                Est. service time
              </div>
              <div className="text-[14.5px] font-semibold mt-1">{selected?.eta || '—'}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold font-mono">
                Starting at
              </div>
              <div className="text-[14.5px] font-bold mt-1">₹{selected?.price ?? 0}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide font-mono mb-3">
          Choose a plan
        </h2>

        <div className="space-y-3 mb-7">
          {detail.tiers.map((tier, i) => (
            <button
              key={tier.name}
              onClick={() => setSelectedTier(i)}
              className={`w-full text-left border rounded-2xl p-4 transition-all ${
                selectedTier === i ? 'border-ink bg-paper-card shadow-card' : 'border-line bg-white'
              }`}
              disabled={status === 'loading'}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-[14.5px] text-ink">{tier.name}</h3>
                <div className="text-right">
                  <div className="font-mono font-bold text-ink text-[16px]">₹{tier.price}</div>
                </div>
              </div>
              <p className="text-xs text-ink-soft mb-2">{tier.desc}</p>
              <div className="flex items-center gap-1 text-[11px] text-ink-soft">
                <Clock size={11} /> {tier.eta}
              </div>
            </button>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide font-mono mb-3">
          What’s included
        </h2>

        <div className="space-y-2 mb-7">
          {detail.included.map((item) => (
            <div key={item} className="flex items-start gap-2 text-[13.5px] text-ink">
              <Check size={15} className="text-banyan mt-0.5 shrink-0" />
              {item}
            </div>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide font-mono mb-3">
          Reviews
        </h2>

        <div className="space-y-3 mb-7">
          {reviews.length === 0 ? (
            <div className="py-8 text-center text-ink-soft">No reviews yet for this service.</div>
          ) : (
            reviews.map((r) => (
              <div key={r.name} className="bg-paper-card border border-line rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13.5px] font-semibold text-ink">{r.name}</span>
                  <div className="flex gap-0.5 text-marigold-deep">
                    {Array.from({ length: r.rating }).map((_, idx) => (
                      <Star key={idx} size={11} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{r.text}</p>
              </div>
            ))
          )}
        </div>

        <h2 className="text-sm font-semibold text-ink-soft uppercase tracking-wide font-mono mb-3">FAQs</h2>
        <div className="space-y-2 mb-24">
          {detail.faqs.map((f, i) => (
            <div key={f.q} className="bg-paper-card border border-line rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                disabled={status === 'loading'}
              >
                <span className="text-[13px] font-medium text-ink pr-3">{f.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-ink-soft shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && <p className="px-4 pb-3.5 text-xs text-ink-soft leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 w-full max-w-[520px] lg:max-w-[1080px] px-5">
        <button
          onClick={handleBook}
          disabled={status === 'loading'}
          className="w-full bg-marigold text-ink font-bold text-[14.5px] py-4 rounded-2xl shadow-lift flex items-center justify-between px-6 disabled:opacity-60"
        >
          <span className="flex items-center gap-2">
            {status === 'loading' ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-ink animate-pulse" /> Booking…
              </span>
            ) : (
              <>Book — {selected?.name}</>
            )}
          </span>
          <span className="font-mono">₹{selected?.price ?? 0}</span>
        </button>
      </div>
    </div>
  );
}
