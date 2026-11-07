/**
 * HelperMini — HelpJi helper card with inline chat
 * Trust Snapshot variant: teal avatar ring, rating, verified badge
 * Chat modal uses HelpJi ink/paper color system
 */
import { useState } from 'react';
import { Loader2, Send, X, BadgeCheck, Star, MessageSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const INITIAL_MESSAGES = [
  { from: 'helper', text: 'Namaste, I am leaving from Girdhar Marg now. I should reach in 12 minutes.' },
  { from: 'helper', text: 'Please keep society gate approval ready if needed.' },
];

function ChatModal({ name, initials, imageUrl, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft]       = useState('');
  const [status, setStatus]     = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const draftTrim  = draft.trim();
  const draftError = draftTrim.length > 240 ? 'Message must be under 240 characters.' : '';
  const canSend    = !!draftTrim && !draftError && status !== 'loading';

  const send = () => {
    if (!canSend) { setStatus('error'); setErrorMsg(draftError || 'Type a message first.'); return; }
    setStatus('loading'); setErrorMsg('');
    setMessages((m) => [...m, { from: 'customer', text: draftTrim }]);
    setDraft('');
    setTimeout(() => {
      setStatus('success');
      setMessages((m) => [...m, { from: 'helper', text: 'Noted. I will call once I reach the gate.' }]);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center" style={{ background: 'rgba(26,26,46,0.55)' }}>
      <div
        className="w-full max-w-[520px] flex flex-col"
        style={{
          height: '70vh',
          background: 'var(--hj-paper-card)',
          borderRadius: '20px 20px 0 0',
          border: '1px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-float)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid var(--hj-line)' }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0" style={{ border: '2px solid #1CA89C' }} />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shrink-0"
              style={{ background: '#1CA89C', fontFamily: 'Sora, sans-serif', border: '2px solid #1CA89C' }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="text-[14px] font-semibold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
              {name}
            </div>
            <div className="flex items-center gap-1 text-[11px]" style={{ color: '#22C55E' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#22C55E' }} />
              Online now
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--hj-ink-muted)' }}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[78%] px-4 py-2.5 text-sm leading-relaxed"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  background: msg.from === 'customer' ? 'var(--hj-ink)' : 'var(--hj-line)',
                  color: msg.from === 'customer' ? 'white' : 'var(--hj-ink)',
                  borderRadius: msg.from === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                }}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Compose */}
        <form
          className="px-4 py-3"
          style={{ borderTop: '1px solid var(--hj-line)', paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          onSubmit={(e) => { e.preventDefault(); send(); }}
          noValidate
        >
          <label htmlFor="chat-message" className="sr-only">Message to helper</label>
          <div className="flex items-center gap-2">
            <input
              id="chat-message"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); if (status === 'error') { setStatus('idle'); setErrorMsg(''); } }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message…"
              className="flex-1 px-4 py-2.5 text-sm rounded-full outline-none"
              style={{
                fontFamily: 'DM Sans, sans-serif',
                background: 'var(--hj-line)',
                color: 'var(--hj-ink)',
                border: '1.5px solid transparent',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#1CA89C'; }}
              onBlur={(e) => { e.target.style.borderColor = 'transparent'; }}
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="w-10 h-10 rounded-full flex items-center justify-center
                         disabled:opacity-40 transition-all active:scale-95"
              style={{ background: '#1CA89C', color: 'white' }}
              aria-label="Send message"
            >
              {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          {(draftError || errorMsg) && (
            <div className="mt-1.5 text-xs" style={{ color: '#EF4444' }}>
              {draftError || errorMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ── HelperMini card — compact trust snapshot ── */
export default function HelperMini({ name, initials, imageUrl, verified, rating, taskCount, subline, showChat }) {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);

  const initial = (initials || name?.[0] || 'H').toUpperCase();

  return (
    <>
      <div
        className="flex items-center gap-3 rounded-2xl p-4 mb-5 transition-all duration-200
                   hover:-translate-y-0.5 group"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1px solid var(--hj-line)',
          boxShadow: 'var(--hj-shadow-card)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--hj-shadow-raised)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--hj-shadow-card)'; }}
      >
        {/* Avatar */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover shrink-0"
            style={{ border: '2px solid #1CA89C' }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
            style={{
              background: '#1CA89C',
              fontFamily: 'Sora, sans-serif',
              border: '2px solid #1CA89C',
              boxShadow: '0 0 0 3px rgba(28,168,156,0.15)',
            }}
          >
            {initial}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4
              className="text-[14.5px] font-semibold truncate"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}
            >
              {name}
            </h4>
            {verified && (
              <BadgeCheck size={15} style={{ color: '#1CA89C', flexShrink: 0 }} />
            )}
          </div>

          {rating != null ? (
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1 text-[12px] font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#F4831F' }}
              >
                <Star size={11} fill="currentColor" /> {rating}
              </span>
              {taskCount != null && (
                <span className="text-[11px]" style={{ color: 'var(--hj-ink-muted)' }}>
                  {taskCount} tasks done
                </span>
              )}
            </div>
          ) : (
            <div className="text-[12px]" style={{ color: 'var(--hj-ink-muted)' }}>{subline}</div>
          )}
        </div>

        {/* Chat button */}
        {showChat && (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px]
                       text-[13px] font-semibold active:scale-95 transition-all shrink-0"
            style={{
              fontFamily: 'Sora, sans-serif',
              background: 'rgba(28,168,156,0.10)',
              color: '#1CA89C',
              border: '1px solid rgba(28,168,156,0.25)',
            }}
          >
            <MessageSquare size={13} />
            {t('chatBtn')}
          </button>
        )}
      </div>

      {chatOpen && (
        <ChatModal
          name={name}
          initials={initial}
          imageUrl={imageUrl}
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  );
}
