import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, Send, MessageCircle, Clock, CheckCircle2, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getTicketById, replyToTicket } from '../../utils/supportApi';

const statusStyles = {
  open: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Open' },
  'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'In Progress' },
  awaiting: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500', label: 'Awaiting' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Resolved' },
  closed: { bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Closed' },
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
}

export default function TicketDetail({ ticket: initialTicket, onBack }) {
  const { t } = useLanguage();
  const [ticket, setTicket] = useState(initialTicket);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [draft, setDraft] = useState('');
  const [sendStatus, setSendStatus] = useState('idle'); // idle | sending | error
  const messagesEndRef = useRef(null);

  const load = useCallback(async () => {
    if (!initialTicket?._id && !initialTicket?.ticketId) return;
    const id = initialTicket._id ?? initialTicket.ticketId;
    setLoading(true);
    setLoadError('');
    try {
      const res = await getTicketById(id);
      const t = res?.ticket ?? res;
      setTicket(t);
      // Replies are stored in ticket.replies array
      const replies = t?.replies ?? [];
      setMessages(replies.map(r => ({
        id: r._id,
        text: r.content ?? r.text ?? '',
        time: r.createdAt,
        isSupport: r.isStaff ?? r.from === 'support',
      })));
    } catch (err) {
      setLoadError(err?.message || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  }, [initialTicket?._id, initialTicket?.ticketId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const draftTrim = draft.trim();
  const canSend = draftTrim.length > 0 && draftTrim.length <= 500 && sendStatus !== 'sending';

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    const id = ticket?._id ?? ticket?.ticketId;
    if (!id) return;
    setSendStatus('sending');
    const optimistic = {
      id: `opt-${Date.now()}`,
      text: draftTrim,
      time: new Date().toISOString(),
      isSupport: false,
    };
    setMessages(prev => [...prev, optimistic]);
    setDraft('');
    try {
      const res = await replyToTicket(id, draftTrim);
      // Update with server reply if available
      const saved = res?.reply;
      if (saved) {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? {
          id: saved._id,
          text: saved.content,
          time: saved.createdAt,
          isSupport: false,
        } : m));
      }
      setSendStatus('idle');
    } catch (err) {
      setSendStatus('error');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setTimeout(() => setSendStatus('idle'), 3000);
    }
  }, [canSend, draftTrim, ticket]);

  if (!initialTicket) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-5">
        <p className="text-ink-soft">Select a ticket to view details.</p>
      </div>
    );
  }

  const st = statusStyles[ticket?.status] ?? statusStyles.open;

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-line px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={onBack} className="p-1 -ml-1 text-ink-soft hover:text-ink">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold truncate">{ticket?.subject ?? ticket?.title ?? 'Support Ticket'}</h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-ink-soft">{ticket?.ticketId ?? ticket?._id}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </span>
            </div>
          </div>
          <button onClick={load} className="p-1 text-ink-soft hover:text-ink" aria-label="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-ink-soft">
          <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(ticket?.createdAt)}</span>
          <span className="capitalize">{ticket?.category ?? 'general'}</span>
          <span className="capitalize font-semibold">{ticket?.priority ?? 'medium'}</span>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-marigold" />
        </div>
      )}

      {loadError && !loading && (
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> {loadError}
          <button onClick={load} className="underline font-semibold ml-1">Retry</button>
        </div>
      )}

      {/* Messages */}
      {!loading && (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {/* Initial description */}
          {ticket?.description && (
            <div className="flex justify-end">
              <div className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-ink text-white">
                <p>{ticket.description}</p>
                <div className="text-[10px] mt-1 text-white/60">{formatTime(ticket.createdAt)}</div>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isSupport ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.isSupport
                  ? 'bg-paper-card border border-line text-ink rounded-bl-sm'
                  : 'bg-ink text-white rounded-br-sm'
              }`}>
                {msg.isSupport && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-marigold/20 text-marigold-deep flex items-center justify-center text-[9px] font-bold">HJ</div>
                    <span className="text-[10px] font-semibold text-marigold-deep">Support Team</span>
                  </div>
                )}
                <p>{msg.text}</p>
                <div className={`text-[10px] mt-1 ${msg.isSupport ? 'text-ink-soft' : 'text-white/60'}`}>
                  {formatTime(msg.time)}
                </div>
              </div>
            </div>
          ))}

          {sendStatus === 'error' && (
            <div className="flex justify-center">
              <span className="text-xs text-rose-500 flex items-center gap-1"><AlertTriangle size={12} /> Failed to send. Please try again.</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input */}
      {ticket?.status !== 'resolved' && ticket?.status !== 'closed' && (
        <div className="bg-white border-t border-line px-4 py-3 pb-6">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your reply..."
                rows={1}
                className="w-full px-3.5 py-2.5 border border-line rounded-2xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 resize-none"
                style={{ minHeight: '42px' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
              />
              <div className="text-[10px] text-ink-soft mt-1 text-right">{draft.length}/500</div>
            </div>
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-[42px] h-[42px] rounded-full bg-marigold text-ink flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-marigold-deep transition-colors active:scale-95"
              aria-label="Send reply"
            >
              {sendStatus === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      )}

      {(ticket?.status === 'resolved' || ticket?.status === 'closed') && (
        <div className="bg-paper-card border-t border-line px-4 py-4 pb-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-banyan" />
            <div>
              <div className="text-sm font-semibold text-ink">This ticket is {ticket.status}</div>
              <div className="text-xs text-ink-soft">If you need further assistance, please create a new ticket.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
