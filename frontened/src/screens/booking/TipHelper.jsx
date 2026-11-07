import { useState } from 'react';
import { ChevronLeft, Star, Heart, Loader2, CheckCircle2, Wallet } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { TIP_AMOUNTS, PRICE_BREAKDOWN } from '../../data/bookingData';
import { ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';
import { formatINR } from '../../utils/format';

export default function TipHelper({ taskData, onBack, onConfirmed }) {
  const { lang } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const helper = taskData?.helper || null;

  const customNum = Number(customAmount);
  const hasCustom = customAmount.trim() !== '' && Number.isFinite(customNum) && customNum > 0;
  const tipAmount = hasCustom ? customNum : (selectedAmount || 0);
  const canSubmit = tipAmount >= 5 && status !== 'processing';

  const handleConfirm = () => {
    if (!canSubmit) return;
    setStatus('processing');
    setErrorMsg('');
    try {
      setStatus('success');
      onSuccess?.({ amount: tipAmount });
    } catch (err) {
      setStatus('error');
      setErrorMsg('Unable to process tip. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Tip sent! 🎉"
          subtitle={`₹${formatINR(tipAmount)} will be added to ${helper?.name || 'your helper'}'s earnings.`}
          onContinue={onBack}
        />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState title="Tip failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} retryLabel="Try again" />
      </div>
    );
  }

  return (
    <div className="p-5">
      {status === 'processing' && (
        <div className="mb-4">
          <LoadingState title="Sending tip..." subtitle="Processing your appreciation." />
        </div>
      )}

      <button onClick={onBack} disabled={status === 'processing'} className="flex items-center gap-1 text-ink-soft text-sm mb-4 disabled:opacity-40">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="text-center mb-6 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-marigold/10 flex items-center justify-center mx-auto mb-3">
          <Heart size={32} className="text-marigold-deep" />
        </div>
        <h1 className="font-display text-[24px] font-bold text-ink mb-1">Tip your helper</h1>
        <p className="text-ink-soft text-[14px] max-w-xs mx-auto leading-relaxed">
          Show appreciation for{' '}
          <span className="font-semibold text-ink">{helper?.name || 'your helper'}</span>'s great service.
        </p>
      </div>

      {helper && (
        <div className="bg-paper-card border border-line rounded-xl p-3.5 flex items-center gap-3 mb-5 shadow-card">
          {helper.imageUrl ? (
            <img src={helper.imageUrl} alt={helper.name} className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-ink text-marigold flex items-center justify-center font-bold">{helper.initials}</div>
          )}
          <div className="flex-1">
            <div className="text-[14px] font-semibold text-ink">{helper.name}</div>
            <div className="flex items-center gap-1 text-xs text-marigold-deep">
              <Star size={12} fill="#C67E1F" /> {helper.rating} · {helper.tasks} tasks
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-4 ${status === 'processing' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">Quick tip amounts</h3>
          <div className="grid grid-cols-5 gap-2">
            {TIP_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt && !hasCustom;
              return (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  disabled={status === 'processing'}
                  className={`py-3 rounded-xl font-mono font-bold text-[15px] border transition-all disabled:opacity-60 ${
                    isSelected ? 'bg-marigold border-marigold text-ink shadow-card' : 'bg-white border-line text-ink hover:border-marigold/40'
                  }`}
                >
                  ₹{amt}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="tip-custom" className="text-xs font-semibold text-ink-soft mb-1.5 block">Or enter custom amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-soft">₹</span>
            <input
              id="tip-custom"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); if (e.target.value) setSelectedAmount(null); }}
              placeholder="Custom"
              type="number"
              min="0"
              disabled={status === 'processing'}
              className="w-full rounded-xl border border-line bg-white py-3.5 pl-10 pr-4 text-[16px] font-semibold text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60"
            />
          </div>
        </div>

        <div className="bg-paper-card border border-line rounded-xl p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-ink-soft">Tip amount</span>
            <span className="font-mono font-bold text-ink">₹{formatINR(tipAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-soft">Wallet balance after tip</span>
            <span className="font-mono font-semibold text-ink">
              ₹{formatINR(Math.max(0, 1250 - tipAmount))}
            </span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'processing' ? (
            <><Loader2 size={18} className="animate-spin" /> Sending...</>
          ) : (
            <><Heart size={18} /> Send ₹{formatINR(tipAmount)} Tip</>
          )}
        </button>
      </div>
    </div>
  );
}

