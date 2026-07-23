import { useState } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

const INITIAL_MESSAGES = [
  { from: 'helper', text: 'Namaste, I am leaving from Girdhar Marg now. I should reach in 12 minutes.' },
  { from: 'helper', text: 'Please keep society gate approval ready if needed.' },
];

function ChatModal({ name, initials, imageUrl, onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const draftTrim = draft.trim();
  const draftError =
    draftTrim.length > 240
      ? 'Message must be under 240 characters.'
      : '';
  const canSend = !!draftTrim && !draftError && status !== 'loading';

  const send = () => {
    if (!canSend) {
      setStatus('error');
      setErrorMsg(draftError || 'Type a message before sending.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    setMessages((m) => [...m, { from: 'customer', text: draftTrim }]);
    setDraft('');
    setTimeout(() => {
      setStatus('success');
      setMessages((m) => [...m, { from: 'helper', text: 'Noted. I will call once I reach the gate.' }]);
    }, 900);
  };

  const resetForm = () => {
    setDraft('');
    setStatus('idle');
    setErrorMsg('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl flex flex-col" style={{ height: '70vh' }}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-sm font-display flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1">
            <div className="text-[14px] font-semibold">{name}</div>
            <div className="text-[11px] text-banyan font-medium">Online now</div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-card" aria-label="Close chat">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" aria-live="polite">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.from === 'customer'
                    ? 'bg-ink text-white rounded-br-sm'
                    : 'bg-paper-card border border-line text-ink rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <form
          className="px-4 py-3 border-t border-line pb-6"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          noValidate
        >
          <label htmlFor="chat-message" className="sr-only">Message to helper</label>
          <div className="flex items-center gap-2">
            <input
              id="chat-message"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                if (status === 'error') {
                  setStatus('idle');
                  setErrorMsg('');
                }
              }}
              onKeyDown={handleKey}
              placeholder="Type a message..."
              aria-invalid={!!(draftError || errorMsg)}
              aria-describedby="chat-message-status"
              className="flex-1 px-3.5 py-2.5 border border-line rounded-full text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40"
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="w-10 h-10 rounded-full bg-marigold text-ink flex items-center justify-center disabled:opacity-40"
              aria-label="Send message"
            >
              {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
          <div id="chat-message-status" className={`mt-2 text-xs ${draftError || errorMsg ? 'text-rose-600' : 'text-ink-soft'}`} aria-live="polite">
            {status === 'loading' ? 'Sending message...' : status === 'success' ? 'Message sent.' : errorMsg || draftError || `${draft.length}/240`}
          </div>
          <button type="button" onClick={resetForm} className="mt-1 text-xs font-semibold text-ink-soft hover:text-ink">
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}

export default function HelperMini({ name, initials, imageUrl, verified, rating, taskCount, subline, showChat }) {
  const { t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
    <div className="flex items-center gap-3 bg-paper-card border border-line rounded-card p-3.5 mb-5 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 group">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-[46px] h-[46px] rounded-full object-cover flex-shrink-0 ring-2 ring-transparent group-hover:ring-marigold/30 transition-all duration-300" />
        ) : (
          <div className="w-[46px] h-[46px] rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
            {initials}
          </div>
        )}
        <div className="flex-1">
          <h4 className="text-[14.5px] font-semibold mb-0.5">
            {name}
            {verified && <span className="inline-flex items-center gap-1 text-[10.5px] text-banyan font-semibold ml-1.5 bg-banyan/10 px-2 py-0.5 rounded-full">{verified}</span>}
          </h4>
          {rating != null ? (
            <div className="text-xs text-marigold-deep flex items-center gap-1">
              <span>★</span> {rating} stars ({taskCount} tasks)
            </div>
          ) : (
            <div className="text-xs text-ink-soft">{subline}</div>
          )}
        </div>
        {showChat && (
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="px-3.5 py-2.5 border border-line rounded-lg text-[13px] font-semibold hover:bg-paper-card transition-all duration-200 active:scale-95 hover:shadow-soft"
          >
            {t('chatBtn')}
          </button>
        )}
      </div>

      {chatOpen && (
        <ChatModal name={name} initials={initials} imageUrl={imageUrl} onClose={() => setChatOpen(false)} />
      )}
    </>
  );
}
