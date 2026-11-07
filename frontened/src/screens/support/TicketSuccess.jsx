import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronLeft, Clock, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export default function TicketSuccess({ ticketData, onBack, onViewTicket }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const timer = setTimeout(() => setStatus('ready'), 600);
    return () => clearTimeout(timer);
  }, []);

  const ticketId = ticketData?.ticketId || ticketData?._id || 'TKT-SUBMITTED';

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
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
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-5">
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
            Ticket Submitted! 🎉
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Your support request has been received. We will get back to you within 24 hours.
          </p>
        </div>

        {/* Ticket ID card */}
        <div className="bg-paper-card border border-line rounded-xl p-6 shadow-card mb-5">
          <div className="text-center mb-4">
            <div className="text-[11px] text-ink-soft font-mono uppercase tracking-wide mb-1">Ticket ID</div>
            <div className="text-[22px] font-bold font-display text-ink font-mono">{ticketId}</div>
          </div>
          <div className="h-px bg-line my-4" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg shrink-0">
                {ticketData?.category === 'payment' ? '💰' :
                 ticketData?.category === 'booking' ? '📋' :
                 ticketData?.category === 'service' ? '⭐' :
                 ticketData?.category === 'account' ? '👤' :
                 ticketData?.category === 'helper' ? '🛠️' :
                 ticketData?.category === 'feedback' ? '💡' : '📝'}
              </span>
              <div>
                <div className="text-xs text-ink-soft font-semibold">Category</div>
                <div className="text-sm font-semibold text-ink capitalize">{ticketData?.category || 'General'}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock size={18} className="text-ink-soft mt-0.5" />
              <div>
                <div className="text-xs text-ink-soft font-semibold">Expected response time</div>
                <div className="text-sm font-semibold text-ink">Within 24 hours</div>
              </div>
            </div>
            {ticketData?.subject && (
              <div className="flex items-start gap-3">
                <MessageCircle size={18} className="text-ink-soft mt-0.5" />
                <div>
                  <div className="text-xs text-ink-soft font-semibold">Subject</div>
                  <div className="text-sm text-ink">{ticketData.subject}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-paper-card border border-line rounded-xl p-5 shadow-card mb-6">
          <h3 className="text-sm font-semibold text-ink mb-3">What happens next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-marigold/10 text-marigold-deep flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div>
                <div className="text-sm font-semibold text-ink">Our team reviews your ticket</div>
                <div className="text-xs text-ink-soft">We prioritize based on urgency</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-marigold/10 text-marigold-deep flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div>
                <div className="text-sm font-semibold text-ink">We may ask for more details</div>
                <div className="text-xs text-ink-soft">Check your notifications and email</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-marigold/10 text-marigold-deep flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <div>
                <div className="text-sm font-semibold text-ink">Issue resolved</div>
                <div className="text-xs text-ink-soft">We will notify you once resolved</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onViewTicket}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] flex items-center justify-center gap-2"
        >
          View ticket <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

