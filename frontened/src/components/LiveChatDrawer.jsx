import { useState, useEffect, useRef } from 'react';
import {
  X, Send, Phone, ShieldCheck, CheckCheck, Sparkles,
  Paperclip, Image as ImageIcon, MapPin, Smile, Clock
} from 'lucide-react';

export default function LiveChatDrawer({
  isOpen,
  onClose,
  helper = { name: 'Ramesh Choudhary', phone: '98290 41763', rating: 4.9 },
  customer = { name: 'Aarav Sharma' },
  taskId = 'HJ-9821',
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'helper',
      text: 'Namaste Aarav ji! I have accepted your task and started heading to your location.',
      time: 'Just now',
    },
    {
      id: 2,
      sender: 'helper',
      text: 'Navigating via 80 Feet Road. I will be at your doorstep in around 3-4 minutes.',
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isHelperTyping, setIsHelperTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickReplies = [
    '📍 I am at the main gate',
    '📞 Please call when you arrive',
    '🏢 Flat 402, 4th floor (lift working)',
    '⏱️ How many minutes will you take?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isHelperTyping]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      sender: 'customer',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!textToSend) setInputText('');

    // Simulate realistic auto-reply from Helper
    setIsHelperTyping(true);
    setTimeout(() => {
      setIsHelperTyping(false);
      let replyText = 'Got it! I am right around the corner, reaching in 2 mins 👍';
      if (text.toLowerCase().includes('gate') || text.toLowerCase().includes('flat')) {
        replyText = 'Noted! Coming directly up to Flat 402.';
      } else if (text.toLowerCase().includes('minute') || text.toLowerCase().includes('time')) {
        replyText = 'GPS shows 2 mins remaining. Just crossing the Koramangala signal!';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'helper',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg h-[85vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-float transition-all"
        style={{
          background: 'var(--hj-paper-card)',
          border: '1.5px solid var(--hj-line)',
        }}
      >
        {/* ── Chat Header ── */}
        <div
          className="p-4 sm:p-5 flex items-center justify-between border-b"
          style={{ borderColor: 'var(--hj-line)', background: 'var(--hj-paper-warm)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-base shrink-0 shadow-sm"
              style={{ background: '#1CA89C' }}
            >
              {helper.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm" style={{ color: 'var(--hj-ink)' }}>
                <span>{helper.name}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-[#1CA89C] bg-[#1CA89C]/10 flex items-center gap-0.5">
                  <ShieldCheck size={10} /> Verified Helper
                </span>
              </div>
              <div className="text-[11px] flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active on Live Navigation • Task {taskId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${helper.phone || '9829041763'}`}
              className="p-2.5 rounded-xl text-white bg-[#1CA89C] transition-transform active:scale-95 shadow-sm"
              title="Call Helper"
            >
              <Phone size={16} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl text-[var(--hj-ink-muted)] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Message Stream ── */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3" style={{ background: 'var(--hj-paper)' }}>
          <div className="text-center my-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-medium text-[var(--hj-ink-muted)] bg-[var(--hj-paper-card)] border border-[var(--hj-line)]">
              🔒 End-to-End Safe Chat for Order {taskId}
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.sender === 'customer';
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-[#F4831F] text-white rounded-br-none shadow-sm'
                      : 'rounded-bl-none'
                  }`}
                  style={
                    !isMe
                      ? {
                          background: 'var(--hj-paper-card)',
                          color: 'var(--hj-ink)',
                          border: '1px solid var(--hj-line)',
                        }
                      : {}
                  }
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-[var(--hj-ink-muted)] mt-1 px-1 flex items-center gap-1 font-mono">
                  {m.time} {isMe && <CheckCheck size={12} className="text-[#F4831F]" />}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isHelperTyping && (
            <div className="flex items-center gap-1.5 p-3 rounded-2xl max-w-[120px] bg-[var(--hj-paper-card)] border border-[var(--hj-line)] animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1CA89C] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1CA89C] animate-bounce delay-100" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1CA89C] animate-bounce delay-200" />
              <span className="text-[10px] text-[var(--hj-ink-muted)] ml-1">Typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Response Chips ── */}
        <div
          className="px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto no-scrollbar"
          style={{ background: 'var(--hj-paper-card)', borderColor: 'var(--hj-line)' }}
        >
          {quickReplies.map((chip, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer shrink-0"
              style={{
                background: 'var(--hj-paper-warm)',
                border: '1px solid var(--hj-line)',
                color: 'var(--hj-ink-soft)',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Chat Input Footer ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 sm:p-4 border-t flex items-center gap-2"
          style={{ background: 'var(--hj-paper-warm)', borderColor: 'var(--hj-line)' }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to your helper..."
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm outline-none transition-all"
            style={{
              background: 'var(--hj-paper-card)',
              border: '1.5px solid var(--hj-line)',
              color: 'var(--hj-ink)',
            }}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl text-white font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-40 shadow-md"
            style={{ background: '#F4831F' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
