import { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCcw, Shield, Clock, Wallet, Home } from 'lucide-react';
import { formatINR } from '../../utils/format';

export default function CancelSuccess({ taskData, cancellationResult, onGoHome, onReschedule }) {
  const [showContent, setShowContent] = useState(false);

  const refundAmount = taskData?.refundAmount || 0;
  const category = taskData?.category;

  useEffect(() => {
    const tid = setTimeout(() => setShowContent(true), 600);
    return () => clearTimeout(tid);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-10 pb-6 text-center">
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-5 animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-brick flex items-center justify-center">
            <CheckCircle2 size={36} className="text-white" />
          </div>
        </div>

        <h1 className="font-display text-[26px] font-bold text-ink mb-2 animate-fade-in-up">
          Booking Cancelled
        </h1>
        <p className="text-ink-soft text-[14px] max-w-sm leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Your booking has been cancelled successfully. We hope to serve you again soon.
        </p>
      </div>

      {showContent && (
        <div className="px-5 pb-6 space-y-4 animate-fade-in-up">
          <div className="bg-paper-card border border-line rounded-2xl p-5 shadow-card">
            <div className="flex items-center gap-3 pb-4 border-b border-line mb-4">
              <div className="w-10 h-10 rounded-xl bg-banyan/10 text-banyan flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <div className="text-xs text-ink-soft font-mono uppercase tracking-wide">Refund status</div>
                <div className="font-bold text-[18px] text-ink mt-0.5">₹{formatINR(refundAmount)}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-sm">
                <Shield size={15} className="mt-0.5 text-banyan shrink-0" />
                <div>
                  <div className="font-medium text-ink text-[13px]">90% refund approved</div>
                  <div className="text-[11px] text-ink-soft">10% platform fee retained for dispatch processing</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Clock size={15} className="mt-0.5 text-marigold-deep shrink-0" />
                <div>
                  <div className="font-medium text-ink text-[13px]">Credit within 24 hours</div>
                  <div className="text-[11px] text-ink-soft">Refund will be added to your HelpJi wallet</div>
                </div>
              </div>
              {cancellationResult?.reason && (
                <div className="mt-2 bg-paper rounded-lg px-3 py-2 text-xs text-ink-soft">
                  Reason: {cancellationResult.reason}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            {onReschedule && (
              <button
                onClick={onReschedule}
                className="flex-1 bg-marigold text-ink font-bold text-[14px] py-3.5 rounded-2xl shadow-card flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              >
                <RefreshCcw size={16} /> Reschedule
              </button>
            )}
            <button
              onClick={onGoHome}
              className="flex-1 bg-ink text-white font-bold text-[14px] py-3.5 rounded-2xl shadow-lift flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              <Home size={16} /> Go Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

