import { useState, useRef } from 'react';
import { ChevronLeft, Send, AlertTriangle, Paperclip, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { createTicket } from '../../utils/supportApi';

const CATEGORIES = [
  { id: 'booking', label: 'Booking Issue', icon: '📋' },
  { id: 'payment', label: 'Payment / Refund', icon: '💰' },
  { id: 'service', label: 'Service Quality', icon: '⭐' },
  { id: 'account', label: 'Account Issue', icon: '👤' },
  { id: 'helper', label: 'Helper Related', icon: '🛠️' },
  { id: 'feedback', label: 'Feedback / Suggestion', icon: '💡' },
  { id: 'other', label: 'Other', icon: '📝' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', desc: 'Minor issue or question' },
  { id: 'medium', label: 'Medium', desc: 'Needs attention soon' },
  { id: 'high', label: 'High', desc: 'Important, please help' },
  { id: 'urgent', label: 'Urgent', desc: 'Immediate help needed' },
];

export default function CreateTicket({ onBack, onSubmit }) {
  const { t } = useLanguage();
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [taskId, setTaskId] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const descTrim = description.trim();
  const subTrim = subject.trim();

  // Validation
  const errors = {};
  if (!category) errors.category = 'Please select a category.';
  if (!subTrim) errors.subject = 'Subject is required.';
  else if (subTrim.length < 5) errors.subject = 'Subject must be at least 5 characters.';
  else if (subTrim.length > 100) errors.subject = 'Subject must be under 100 characters.';
  if (!descTrim) errors.description = 'Description is required.';
  else if (descTrim.length < 20) errors.description = 'Please provide at least 20 characters describing the issue.';
  else if (descTrim.length > 1000) errors.description = 'Description must be under 1000 characters.';

  const canSubmit = Object.keys(errors).length === 0 && status !== 'loading';

  const fileInputRef = useRef(null);

  const handleAttach = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: `${Math.round(f.size / 1024)} KB`,
      file: f,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const ticket = await createTicket({
        subject: subTrim,
        description: descTrim,
        category: category || 'general',
        priority,
        bookingId: taskId.trim() || undefined,
      });

      onSubmit?.(ticket);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not submit ticket. Please try again.');
    }
  };

  const resetForm = () => {
    setCategory('');
    setPriority('medium');
    setSubject('');
    setDescription('');
    setAttachments([]);
    setTaskId('');
    setStatus('idle');
    setErrorMsg('');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-5">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-marigold-deep mx-auto mb-4" />
          <h3 className="text-[16px] font-semibold mb-1">Submitting your ticket...</h3>
          <p className="text-sm text-ink-soft">Our support team will review it shortly.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-paper p-5 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-brick" />
          </div>
          <h3 className="text-[16px] font-semibold mb-1">Submission failed</h3>
          <p className="text-sm text-ink-soft mb-4">{errorMsg}</p>
          <button
            onClick={() => setStatus('idle')}
            className="bg-ink text-white px-6 py-3 rounded-xl font-semibold text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <div className="max-w-lg mx-auto px-5 pt-4 pb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
        >
          <ChevronLeft size={16} /> Back to tickets
        </button>

        <h2 className="text-[22px] font-display font-semibold mb-1">Create Support Ticket</h2>
        <p className="text-sm text-ink-soft mb-6">
          Describe your issue and we will get back to you within 24 hours.
        </p>

        {/* Category selection */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
            Category <span className="text-brick">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border text-left transition-all ${
                  category === cat.id
                    ? 'border-ink bg-ink/5 shadow-soft'
                    : 'border-line bg-white hover:border-ink/20'
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-xs font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <div className="mt-1 flex items-center gap-1 text-xs text-rose-600">
              <AlertTriangle size={13} /> {errors.category}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
            Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPriority(p.id)}
                className={`px-3 py-2.5 rounded-xl border text-center transition-all ${
                  priority === p.id
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-white text-ink hover:border-ink/20'
                }`}
              >
                <div className="text-[11px] font-semibold">{p.label}</div>
                <div className={`text-[9px] mt-0.5 ${priority === p.id ? 'text-white/70' : 'text-ink-soft'}`}>
                  {p.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Related task (optional) */}
        <div className="mb-4">
          <label htmlFor="ticket-task" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Related task ID <span className="font-normal text-ink-soft/70">(optional)</span>
          </label>
          <input
            id="ticket-task"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
            placeholder="e.g. HJ-5821"
            className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white font-mono focus:outline-none focus:ring-2 focus:ring-marigold/40"
          />
        </div>

        {/* Subject */}
        <div className="mb-4">
          <label htmlFor="ticket-subject" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Subject <span className="text-brick">*</span>
          </label>
          <input
            id="ticket-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary of your issue"
            maxLength={100}
            aria-invalid={!!errors.subject}
            className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40"
          />
          <div className="flex justify-between mt-1">
            {errors.subject && (
              <div className="flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.subject}
              </div>
            )}
            <span className="text-[11px] text-ink-soft ml-auto">{subject.length}/100</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label htmlFor="ticket-desc" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Description <span className="text-brick">*</span>
          </label>
          <textarea
            id="ticket-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail. Include any relevant information that will help us resolve it faster."
            rows={5}
            maxLength={1000}
            aria-invalid={!!errors.description}
            className="w-full px-3.5 py-3 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 resize-none"
          />
          <div className="flex justify-between mt-1">
            {errors.description && (
              <div className="flex items-center gap-1 text-xs text-rose-600">
                <AlertTriangle size={13} /> {errors.description}
              </div>
            )}
            <span className="text-[11px] text-ink-soft ml-auto">{description.length}/1000</span>
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-soft">Attachments</span>
            <button
              type="button"
              onClick={handleAttach}
              className="text-xs font-semibold text-marigold-deep flex items-center gap-1 hover:text-marigold"
            >
              <Paperclip size={14} /> Add file
            </button>
          </div>
          {attachments.length > 0 ? (
            <div className="space-y-1.5">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-paper-card border border-line rounded-lg px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-ink-soft" />
                    <span className="text-sm text-ink">{file.name}</span>
                    <span className="text-[10px] text-ink-soft">{file.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-ink-soft hover:text-brick"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-soft">Screenshots, receipts, or photos help us understand the issue.</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Send size={18} /> Submit Ticket
        </button>
        <button
          type="button"
          onClick={resetForm}
          className="w-full mt-3 py-3 rounded-xl border border-line font-semibold text-sm text-ink-soft hover:bg-paper-card transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

