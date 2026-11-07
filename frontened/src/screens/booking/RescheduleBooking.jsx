import { useState } from 'react';
import { ChevronLeft, Calendar, Clock3, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import { RESCHEDULE_PRESETS } from '../../data/bookingData';
import { ErrorState, LoadingState } from '../../components/ui/PageState';
import { formatINR } from '../../utils/format';

import { rescheduleBooking } from '../../utils/bookingApi';

export default function RescheduleBooking({ taskData, onBack, onConfirmed }) {
  const { lang } = useLanguage();
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customDate, setCustomDate] = useState('');
  const [customTime, setCustomTime] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle'); // idle | processing | error
  const [errorMsg, setErrorMsg] = useState('');

  const category = taskData?.category;
  const label = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const service = SERVICES.find((s) => s.id === category);
  const helper = taskData?.helper || null;

  const isCustom = selectedPreset === 'custom';
  const hasDateTime = !isCustom || (customDate.trim() && customTime.trim());
  const canSubmit = !!selectedPreset && hasDateTime && status !== 'processing';

  const handleConfirm = async () => {
    if (!canSubmit) return;
    setStatus('processing');
    setErrorMsg('');

    try {
      const bookingId = taskData?.id || taskData?._id || taskData?.bookingId;
      let newScheduledAt = new Date().toISOString();
      if (isCustom && customDate && customTime) {
        newScheduledAt = new Date(`${customDate}T${customTime}`).toISOString();
      }

      if (bookingId) {
        await rescheduleBooking(bookingId, newScheduledAt, notes.trim()).catch(() => {});
      }

      setStatus('idle');
      onConfirmed?.({
        preset: selectedPreset,
        customDate: isCustom ? customDate.trim() : null,
        customTime: isCustom ? customTime.trim() : null,
        notes: notes.trim(),
        newScheduledAt,
      });
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to reschedule. Please try again.');
    }
  };

  if (status === 'error') {
    return (
      <div className="p-5">
        <ErrorState
          title="Reschedule failed"
          subtitle={errorMsg}
          onRetry={() => setStatus('idle')}
          retryLabel="Try again"
        />
      </div>
    );
  }


  const selectedPresetData = RESCHEDULE_PRESETS.find((p) => p.id === selectedPreset);

  return (
    <div className="pb-6">
      {status === 'processing' && (
        <div className="p-5 pb-0">
          <LoadingState title="Rescheduling your booking..." subtitle="Notifying the helper about the new time." />
        </div>
      )}

      <div className={`px-5 pt-5 pb-5 ${service?.tag.bg || 'bg-paper'}`}>
        <button
          onClick={onBack}
          disabled={status === 'processing'}
          className="flex items-center gap-1 text-ink-soft text-sm mb-5 disabled:opacity-40"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-marigold/10 text-marigold-deep flex items-center justify-center">
            <Calendar size={20} />
          </div>
          <div>
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
              Reschedule
            </div>
            <h1 className="font-display text-xl font-bold text-ink">Pick a new time</h1>
          </div>
        </div>
      </div>

      <div className={`px-5 pt-4 space-y-5 ${status === 'processing' ? 'opacity-40 pointer-events-none' : ''}`}>
        {helper && (
          <div className="bg-paper-card border border-line rounded-xl p-3.5 shadow-card flex items-center gap-3">
            {helper.imageUrl ? (
              <img src={helper.imageUrl} alt={helper.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-ink text-marigold flex items-center justify-center font-bold text-sm">
                {helper.initials}
              </div>
            )}
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-ink">{helper.name}</div>
              <div className="text-[11px] text-ink-soft">Current: {taskData?.dateTime || 'Today'}</div>
            </div>
            <span className="text-[11px] text-banyan font-semibold">{helper.distance}</span>
          </div>
        )}

        <div>
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wide text-ink-soft mb-3">
            Suggested times
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {RESCHEDULE_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  disabled={status === 'processing'}
                  className={`relative text-left border rounded-xl p-3.5 transition-all disabled:opacity-60 ${
                    isSelected
                      ? 'border-ink bg-paper-card shadow-card'
                      : 'border-line bg-white hover:border-ink/20'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-2.5 top-2.5">
                      <CheckCircle2 size={16} className="text-ink" />
                    </span>
                  )}
                  <div className="font-semibold text-[13.5px] text-ink">{preset.label}</div>
                  <div className="text-[11px] text-ink-soft mt-0.5">{preset.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {isCustom && (
          <div className="bg-paper-card border border-line rounded-2xl p-4 shadow-card space-y-3 animate-fade-in">
            <div>
              <label htmlFor="reschedule-date" className="block text-xs font-semibold text-ink-soft mb-1.5">
                New date
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  id="reschedule-date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  placeholder="e.g. 22 Aug, Saturday"
                  disabled={status === 'processing'}
                  className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-4 text-[14px] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60"
                />
              </div>
            </div>
            <div>
              <label htmlFor="reschedule-time" className="block text-xs font-semibold text-ink-soft mb-1.5">
                New time
              </label>
              <div className="relative">
                <Clock3 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
                <input
                  id="reschedule-time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  disabled={status === 'processing'}
                  className="w-full rounded-lg border border-line bg-white py-3 pl-10 pr-4 text-[14px] text-ink outline-none focus:border-ink focus:ring-2 focus:ring-ink/5 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}

        {selectedPreset && selectedPreset !== 'custom' && (
          <div className="bg-banyan/5 border border-banyan/20 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold text-banyan mb-1">
              <CheckCircle2 size={16} />
              {selectedPresetData?.label} selected
            </div>
            <p className="text-xs text-ink-soft">
              The helper will be notified of the new schedule. You can chat if they need adjustments.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="reschedule-notes" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Message for helper <span className="font-normal text-ink-soft/70">(optional)</span>
          </label>
          <textarea
            id="reschedule-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Let the helper know why you're rescheduling..."
            disabled={status === 'processing'}
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 h-20 resize-none disabled:opacity-60"
          />
          <div className="text-right text-[11px] text-ink-soft mt-1">{notes.length}/200</div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink font-bold text-[15px] py-4 rounded-2xl shadow-lift flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
        >
          {status === 'processing' ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Rescheduling...
            </>
          ) : (
            <>
              <Calendar size={18} /> Confirm New Schedule
            </>
          )}
        </button>
      </div>
    </div>
  );
}

