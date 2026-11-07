import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, Send, Paperclip, Phone, Image, Loader2, Info, CheckCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/apiClient';
import { getAiStatus, getChatSuggestion } from '../../utils/aiApi';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const cannedReplies = [
  'I am on my way.',
  'Please share the location.',
  'Will reach in 10 minutes.',
  'Got it, thank you!',
  'Can you please clarify?',
  'Noted. I will handle it.',
];

// ── Socket connection (lazily initialized) ───────────────────────────────────
let socketInstance = null;
function getSocket(token) {
  if (socketInstance && socketInstance.connected) return socketInstance;
  // Dynamically import socket.io-client to avoid loading it if chat never opened
  if (typeof window !== 'undefined' && window.io) {
    socketInstance = window.io(API_BASE, {
      auth: { token },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
}

export default function ChatConversation({ conversation, onBack }) {
  const { t } = useLanguage();
  const { user, accessToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sendStatus, setSendStatus] = useState('idle');
  const [loadStatus, setLoadStatus] = useState('loading');
  const [showCanned, setShowCanned] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const conversationId = conversation?._id || conversation?.id;

  const draftTrim = draft.trim();
  const canSend = draftTrim.length > 0 && draftTrim.length <= 500 && sendStatus !== 'sending';

  // ── Load messages from REST API ─────────────────────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    setLoadStatus('loading');
    setMessages([]);

    api.get(`/chat/conversations/${conversationId}/messages?limit=50`)
      .then((res) => {
        const msgs = res.data?.messages || res.data || [];
        setMessages(msgs);
        setLoadStatus('ready');
      })
      .catch(() => {
        setLoadStatus('error');
      });
  }, [conversationId]);

  // ── Socket.IO real-time ─────────────────────────────────────────────────
  useEffect(() => {
    if (!conversationId || !accessToken) return;

    // Try to connect socket
    const socket = getSocket(accessToken);
    if (!socket) return;
    socketRef.current = socket;

    // Join the conversation room
    socket.emit('conversation:join', conversationId);

    // Listen for new messages
    const handleNewMessage = (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // Avoid duplicate if we optimistically added it
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
      }
    };

    // Listen for typing updates
    const handleTypingUpdate = ({ userId: typingUserId, isTyping: typing }) => {
      if (typingUserId !== user?._id) {
        setIsTyping(typing);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:update', handleTypingUpdate);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:update', handleTypingUpdate);
      socket.emit('conversation:leave', conversationId);
    };
  }, [conversationId, accessToken, user?._id]);

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Mark messages as read when conversation opens ───────────────────────
  useEffect(() => {
    if (!conversationId || !socketRef.current) return;
    socketRef.current.emit('messages:read', { conversationId });
  }, [conversationId, messages.length]);

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    if (!canSend || !conversationId) return;

    setSendStatus('sending');
    const content = draftTrim;
    setDraft('');
    setShowCanned(false);
    setAiSuggestion(null);

    // Optimistic UI update
    const optimisticMsg = {
      _id: `optimistic-${Date.now()}`,
      conversationId,
      senderId: { _id: user?._id, name: user?.name },
      content,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    if (socketRef.current?.connected) {
      // Send via Socket.IO
      socketRef.current.emit('message:send', { conversationId, content }, (ack) => {
        if (ack?.error) {
          console.error('Message send failed:', ack.error);
        }
        // Replace optimistic message with real one (via message:new event)
        setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
        setSendStatus('idle');
      });
    } else {
      // Fallback: REST API
      api.post(`/chat/conversations/${conversationId}/messages`, { content })
        .then((res) => {
          const msg = res.data?.message || res.data;
          setMessages((prev) => [
            ...prev.filter((m) => m._id !== optimisticMsg._id),
            msg,
          ]);
        })
        .catch(() => {
          // Remove optimistic message on failure
          setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
        })
        .finally(() => setSendStatus('idle'));
    }

    // Stop typing indicator
    socketRef.current?.emit('typing:stop', { conversationId });
    clearTimeout(typingTimerRef.current);
  }, [canSend, conversationId, draftTrim, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Typing indicator ────────────────────────────────────────────────────
  const handleDraftChange = (e) => {
    setDraft(e.target.value);
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit('typing:start', { conversationId });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socketRef.current?.emit('typing:stop', { conversationId });
      }, 2000);
    }
  };

  // ── AI Chat Suggestion (for helpers) ───────────────────────────────────
  useEffect(() => {
    if (!messages.length || user?.role !== 'helper') return;
    const last = messages[messages.length - 1];
    const lastSenderId = last?.senderId?._id || last?.senderId;
    const isFromOther = lastSenderId?.toString() !== user?._id?.toString();
    if (!isFromOther || !last?.content) return;

    // Get AI suggestion for reply
    getChatSuggestion(
      conversation?.title || 'Service request',
      last.content,
      conversation?.category || ''
    ).then(({ suggestion }) => {
      if (suggestion) setAiSuggestion(suggestion);
    });
  }, [messages, user, conversation]);

  const handleCannedReply = (text) => {
    setDraft(text);
    setShowCanned(false);
    inputRef.current?.focus();
  };

  // ── Helpers for message rendering ───────────────────────────────────────
  const getMessageSenderId = (msg) => {
    return msg?.senderId?._id?.toString() || msg?.senderId?.toString();
  };

  const isOwnMessage = (msg) => getMessageSenderId(msg) === user?._id?.toString();

  if (!conversation) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-5">
        <p className="text-ink-soft">Select a conversation to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-line px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 -ml-1 text-ink-soft hover:text-ink">
            <ChevronLeft size={20} />
          </button>

          {conversation.imageUrl ? (
            <img src={conversation.imageUrl} alt={conversation.name} className="w-[42px] h-[42px] rounded-full object-cover" />
          ) : (
            <div className="w-[42px] h-[42px] rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-sm font-display">
              {conversation.initials || conversation.name?.[0] || '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold truncate">{conversation.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                conversation.status === 'online' ? 'bg-banyan' : conversation.status === 'away' ? 'bg-marigold' : 'bg-line'
              }`} />
              <span className="text-[11px] text-ink-soft capitalize">
                {isTyping ? 'typing...' : (conversation.status || 'offline')}
                {conversation.taskId && ` · #${conversation.taskId}`}
              </span>
            </div>
          </div>

          <button className="p-2 text-ink-soft hover:text-ink rounded-full hover:bg-paper" aria-label="Call">
            <Phone size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Task info banner */}
        {(conversation.taskId || conversation.category) && (
          <div className="bg-paper-card border border-line rounded-xl p-3 flex items-center gap-2 mb-2">
            <Info size={14} className="text-marigold-deep shrink-0" />
            <span className="text-xs text-ink-soft">
              {conversation.taskId && <>Task <strong>#{conversation.taskId}</strong> · </>}
              {conversation.category}
            </span>
          </div>
        )}

        {loadStatus === 'loading' && (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-marigold-deep" />
          </div>
        )}

        {loadStatus === 'error' && (
          <div className="text-center py-8 text-sm text-brick">
            Failed to load messages. Please try again.
          </div>
        )}

        {loadStatus === 'ready' && messages.length === 0 && (
          <div className="text-center py-8 text-sm text-ink-soft">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg) => {
          const own = isOwnMessage(msg);
          return (
            <div key={msg._id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  own
                    ? 'bg-ink text-white rounded-br-sm' + (msg.isOptimistic ? ' opacity-70' : '')
                    : 'bg-paper-card border border-line text-ink rounded-bl-sm'
                }`}
              >
                <p>{msg.content || msg.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${own ? 'text-white/60' : 'text-ink-soft'}`}>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt || msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {own && (
                    msg.isRead ? (
                      <CheckCheck size={12} className="text-blue-400" />
                    ) : (
                      <CheckCheck size={12} />
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-paper-card border border-line rounded-2xl px-4 py-2.5 rounded-bl-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-ink-soft/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {sendStatus === 'sending' && (
          <div className="flex justify-end">
            <div className="bg-ink/80 text-white px-3.5 py-2 rounded-2xl text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Sending...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div className="bg-marigold/10 border-t border-marigold/20 px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-soft">AI suggestion:</span>
            <button
              onClick={() => { handleCannedReply(aiSuggestion); setAiSuggestion(null); }}
              className="text-xs text-marigold-deep font-semibold truncate flex-1 text-left"
            >
              {aiSuggestion}
            </button>
            <button onClick={() => setAiSuggestion(null)} className="text-ink-soft text-xs shrink-0">✕</button>
          </div>
        </div>
      )}

      {/* Canned replies */}
      {showCanned && (
        <div className="bg-white border-t border-line px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cannedReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => handleCannedReply(reply)}
                className="shrink-0 px-3.5 py-2 rounded-full border border-line text-xs font-semibold hover:bg-paper-card whitespace-nowrap"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-line px-4 py-3 pb-6">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowCanned(!showCanned)}
            className="p-2.5 text-ink-soft hover:text-ink rounded-full hover:bg-paper shrink-0"
            aria-label="Quick replies"
          >
            <Image size={18} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={handleDraftChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-3.5 py-2.5 border border-line rounded-2xl text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 resize-none max-h-[120px]"
              style={{ minHeight: '42px' }}
            />
            <div className="flex justify-between mt-1 px-1">
              <span className={`text-[10px] ${draft.length > 450 ? 'text-brick' : 'text-ink-soft'}`}>
                {draft.length}/500
              </span>
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-[42px] h-[42px] rounded-full bg-marigold text-ink flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-marigold-deep transition-colors active:scale-95"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
