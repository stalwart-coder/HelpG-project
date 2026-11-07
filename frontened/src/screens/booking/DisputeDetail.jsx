import { useState, useEffect } from 'react';
import { ChevronLeft, AlertTriangle, Clock, Shield, MessageCircle, FileText, ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, ErrorState, LoadingState, SkeletonPage } from '../../components/ui/PageState';
import Timeline from '../../components/Timeline';
import { DISPUTE_REASONS, DISPUTE_STATUS } from '../../data/bookingData';

export default function DisputeDetail({ disputeData, onBack, onSubmitMessage }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use provided disputeData or mock a default one
  const dispute = disputeData || {
    id: 'DSP-2025-001',
    reason: 'payment',
    status: 'investigating',
    bookingId: 'HJ-5921',
    amount: 385,
    description: 'I was charged for the full amount even though the helper cancelled on their end. I requested a full refund but only 90% was offered.',
    createdAt: '18 Jul 2025, 2:45 PM',
    updatedAt: '18 Jul 2025, 4:00 PM',
    messages: [
      { from: 'customer', text: 'I was charged Rs.385 but the helper cancelled. I want a full refund.', time: '18 Jul, 2:45 PM' },
      { from: 'support', text: 'Thank you for reaching out. We have received your dispute and a team member will review it shortly. Reference: DSP-2025-001', time: '18 Jul, 3:00 PM' },
      { from: 'support', text: 'We are reviewing the transaction and helper logs. We will update you within 24 hours.', time: '18 Jul, 4:00 PM' },
    ],
    timeline: [
      { label: 'Dispute opened', time: '18 Jul, 2:45 PM', state: 'done' },
      { label: 'Receipt acknowledged', time: '18 Jul, 3:00 PM', state: 'done' },
      { label: 'Under investigation', time: '18 Jul, 4:00 PM', state: 'current' },
      { label: 'Resolution', time: 'Expected within 48 hours', state: 'pending' },
    ],
  };

  useEffect(() => {
    const tid = setTimeout(() => setStatus('ready'), 350);
    return () => clearTimeout(tid);
  }, []);

  if (status === 'loading') return <SkeletonPage />;

  const reasonLabel = DISPUTE_REASONS.find((r) => r.id === dispute.reason)?.label || dispute.reason;
  const statusInfo = DISPUTE_STATUS.find((s) => s.id === dispute.status) || DISPUTE_STATUS[1];

  const handleSendMessage = () => {
    const msg = newMessage.trim();
    if (!msg || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmitMessage?.({ disputeId: dispute.id, message: msg });
      setNewMessage('');
      setSubmitting(false);
    }, 500);
  };

  return (
    <div className="p-5 pb-24">
      <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-ink mb-1">Dispute #{dispute.id}</h2>
          <p className="text-xs text-ink-soft">{reasonLabel} · {dispute.bookingId}</p>
        </div>
        <span className={`text-[11px] font-semibold px-3 py-1.5 rounded-full ${
          dispute.status === 'resolved' || dispute.status === 'closed' ? 'bg-emerald-50 text-banyan' :
          dispute.status === 'investigating' ? 'bg-amber-50 text-marigold-deep' :
          'bg-blue-50 text-blue-700'
        }`}>
          {statusInfo?.label || dispute.status}
        </span>
      </div>

      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-brick flex items-center justify-center shrink-0">
            <FileText size={18} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-ink-soft font-mono uppercase tracking-wide">Issue description</div>
            <p className="text-[13px] text-ink mt-1 leading-relaxed">{dispute.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-line text-xs text-ink-soft">
          <span>Opened: {dispute.createdAt}</span>
          <span>Updated: {dispute.updatedAt}</span>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2 font-mono">Status timeline</div>
      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
        <Timeline steps={dispute.timeline} />
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2 font-mono flex items-center justify-between">
        <span>Messages ({dispute.messages.length})</span>
        <span className="text-banyan text-[10px] font-normal">Support typically replies within 2 hours</span>
      </div>

      <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
        <div className="space-y-3 max-h-[320px] overflow-y-auto">
          {dispute.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'customer'
                  ? 'bg-ink text-white rounded-br-sm'
                  : 'bg-white border border-line text-ink rounded-bl-sm'
              }`}>
                <div className="text-[10px] font-mono font-semibold mb-1 opacity-70 uppercase">
                  {msg.from === 'customer' ? 'You' : 'Support'}
                </div>
                {msg.text}
                <div className="text-[10px] mt-1.5 opacity-60">{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-line">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
            placeholder="Type your message..."
            className="flex-1 px-3.5 py-2.5 bg-white border border-line rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-marigold/40"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || submitting}
            className="w-9 h-9 rounded-full bg-marigold text-ink flex items-center justify-center disabled:opacity-40"
          >
            {submitting ? (
              <Clock size={15} className="animate-spin" />
            ) : (
              <ArrowRight size={15} />
            )}
          </button>
        </div>
      </div>

      <div className="bg-marigold/5 border border-marigold/20 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={18} className="text-marigold-deep mt-0.5 shrink-0" />
        <div>
          <div className="font-semibold text-[13px] text-ink mb-1">Need immediate help?</div>
          <p className="text-xs text-ink-soft leading-relaxed">
            If this is urgent, contact our support team directly. They can escalate your dispute for faster resolution.
          </p>
          <button className="mt-2 text-xs font-semibold text-marigold-deep hover:text-marigold flex items-center gap-1">
            Contact support <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

