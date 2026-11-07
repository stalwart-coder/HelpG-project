import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, Banknote, Smartphone, Clock, Download, Share2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function WithdrawSuccess({ data, onBack, onDone }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 600);
    return () => clearTimeout(timer);
  }, []);

  const { account, amount } = data || {};
  const netAmount = amount - Math.round(amount * 0.02);
  const refId = `WTHD${Date.now().toString(36).toUpperCase()}`;
  const estimatedTime = account?.type === 'upi' ? '5-10 minutes' : '12-24 hours';

  if (status === 'loading') {
    return (
      <div className="p-5 min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-banyan/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle2 size={32} className="text-banyan" />
          </div>
          <div className="h-5 w-48 bg-line/60 rounded-md animate-skeleton-pulse mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-6"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {/* Success header */}
        <div className="bg-gradient-to-br from-banyan to-emerald-700 text-white rounded-2xl p-8 shadow-lift mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={44} className="text-white" />
          </div>
          <h2 className="text-[24px] font-display font-bold mb-2">
            Withdrawal Initiated! 🎉
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Your withdrawal request has been submitted successfully.
          </p>
        </div>

        {/* Amount display */}
        <div className="bg-paper-card border border-line rounded-xl p-6 shadow-card mb-5 text-center">
          <div className="text-[11px] text-ink-soft font-mono uppercase tracking-wide mb-1">Amount Transferred</div>
          <div className="text-[36px] font-bold font-display text-banyan mb-2">
            ₹{netAmount.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-ink-soft">
            <span>Fee: ₹{Math.round(amount * 0.02).toLocaleString('en-IN')}</span>
            <span>·</span>
            <span>Gross: ₹{amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Transaction details */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-6">
          <h3 className="text-sm font-semibold text-ink mb-3">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">Reference ID</span>
              <span className="font-mono text-xs font-semibold text-ink">{refId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">Status</span>
              <span className="text-marigold-deep font-semibold flex items-center gap-1">
                <Clock size={14} /> Processing
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-soft">Estimated arrival</span>
              <span className="font-semibold text-ink">{estimatedTime}</span>
            </div>
            <div className="h-px bg-line" />
            <div className="flex items-center gap-3 pt-1">
              <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                account?.type === 'bank' ? 'bg-banyan/10 text-banyan' : 'bg-marigold/10 text-marigold-deep'
              }`}>
                {account?.type === 'bank' ? <Banknote size={18} /> : <Smartphone size={18} />}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">{account?.label}</div>
                <div className="text-xs text-ink-soft">{account?.account}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => {
              const text = `HelpJi Withdrawal\nAmount: ₹${netAmount}\nRef: ${refId}\nStatus: Processing\nETA: ${estimatedTime}`;
              navigator.clipboard?.writeText(text);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-line font-semibold text-sm hover:bg-paper-card transition-colors"
          >
            <Download size={16} /> Receipt
          </button>
          <button
            onClick={() => {
              const text = `I just withdrew ₹${netAmount} from HelpJi! 🎉`;
              navigator.clipboard?.writeText(text);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border border-line font-semibold text-sm hover:bg-paper-card transition-colors"
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        <button
          onClick={onDone}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98]"
        >
          Back to wallet
        </button>
      </div>
    </div>
  );
}

