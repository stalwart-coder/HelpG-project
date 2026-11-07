import { useState, useEffect } from 'react';
import { ChevronLeft, Wallet, Clock, CheckCircle2, AlertTriangle, RefreshCcw, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, ErrorState, LoadingState, SkeletonPage } from '../../components/ui/PageState';
import Timeline from '../../components/Timeline';
import { formatINR } from '../../utils/format';
import { getBookingById } from '../../utils/bookingApi';

export default function RefundStatus({ refundId, onBack }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [refundData, setRefundData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      try {
        if (refundId) {
          const b = await getBookingById(refundId);
          if (!cancelled && b) {
            setRefundData({
              id: `ref-${b._id?.slice(-6) || '8291'}`,
              bookingId: b._id || refundId,
              amount: b.totalAmount || b.price || 350,
              status: b.status === 'cancelled' ? 'completed' : 'processing',
              method: 'UPI Escrow (Instant Reversal)',
              timeline: [
                { title: 'Refund initiated', time: new Date(b.updatedAt || Date.now()).toLocaleDateString(), done: true },
                { title: 'UPI bank processing', time: 'In Progress', done: true },
                { title: 'Credited to original source', time: 'Estimated 2 hours', done: b.status === 'cancelled' },
              ],
            });
            setStatus('ready');
            return;
          }
        }
      } catch {
        // Handled below
      }
      if (!cancelled) {
        setRefundData(null);
        setStatus('empty');
      }
    })();
    return () => { cancelled = true; };
  }, [refundId]);

  const refund = refundData;

  if (status === 'loading') return <SkeletonPage />;

  if (!refund) {
    return (
      <div className="p-5">
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back
        </button>
        <EmptyState title="No refund found" subtitle="This refund request does not exist." />
      </div>
    );
  }

  const statusConfig = {
    processing: { icon: Clock, bg: 'bg-amber-50', iconBg: 'bg-marigold/10', iconColor: 'text-marigold-deep', label: 'Processing' },
    completed: { icon: CheckCircle2, bg: 'bg-emerald-50', iconBg: 'bg-banyan/10', iconColor: 'text-banyan', label: 'Completed' },
    failed: { icon: AlertTriangle, bg: 'bg-rose-50', iconBg: 'bg-brick/10', iconColor: 'text-brick', label: 'Failed' },
  };
  const cfg = statusConfig[refund.status] || statusConfig.processing;
  const Icon = cfg.icon;

  return (
    <div className="p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <div className={`${cfg.bg} rounded-2xl p-5 mb-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
            <Icon size={24} className={cfg.iconColor} />
          </div>
          <div>
            <div className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft">Refund {cfg.label}</div>
            <div className="font-display text-2xl font-bold text-ink mt-0.5">₹{formatINR(refund.amount)}</div>
          </div>
        </div>

        <div className="bg-white/80 border border-line/50 rounded-xl p-3.5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] text-ink-soft font-mono uppercase">Total paid</div>
              <div className="font-semibold text-ink">₹{formatINR(refund.totalPaid)}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-soft font-mono uppercase">Platform fee</div>
              <div className="font-semibold text-ink">₹{formatINR(refund.platformFee)}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-soft font-mono uppercase">Refund method</div>
              <div className="font-semibold text-ink">{refund.method}</div>
            </div>
            <div>
              <div className="text-[10px] text-ink-soft font-mono uppercase">Booking</div>
              <div className="font-semibold text-ink">{refund.bookingId}</div>
            </div>
          </div>
        </div>
      </div>

      {refund.status === 'failed' && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-brick mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-[13px] text-ink mb-1">Action needed</div>
            <p className="text-xs text-ink-soft leading-relaxed">
              The refund could not be processed automatically. Our team is reviewing the issue.
              {refund.reason && <> Reason: {refund.reason}</>}
            </p>
            <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-brick hover:text-brick/80">
              Contact support <ExternalLink size={13} />
            </button>
          </div>
        </div>
      )}

      {refund.status === 'completed' && refund.completedAt && (
        <div className="bg-banyan/5 border border-banyan/20 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-banyan" />
          <div>
            <div className="font-semibold text-[13px] text-ink">Refund credited</div>
            <p className="text-xs text-ink-soft">Completed on {refund.completedAt}</p>
          </div>
        </div>
      )}

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2 font-mono">Refund timeline</div>
      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-5">
        <Timeline steps={refund.timeline} />
      </div>

      {refund.status === 'processing' && (
        <div className="bg-marigold/5 border border-marigold/20 rounded-2xl p-4 flex items-start gap-3">
          <RefreshCcw size={18} className="text-marigold-deep mt-0.5 shrink-0 animate-spin" />
          <div>
            <div className="font-semibold text-[13px] text-ink">Expected by {refund.expectedBy}</div>
            <p className="text-xs text-ink-soft">Refunds to HelpJi Wallet are usually instant once processed. UPI/card refunds take 1-3 business days.</p>
          </div>
        </div>
      )}
    </div>
  );
}

