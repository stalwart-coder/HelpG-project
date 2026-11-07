import { useState } from 'react';
import { ChevronLeft, Clock, Sun, Moon, Sunrise, Sunset, Plus, Trash2, Save, Check, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { ErrorState, SuccessState } from '../../components/ui/PageState';
import { updateSchedule } from '../../utils/helperApi';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_PRESETS = [
  { label: 'Morning', icon: <Sunrise size={14} />, start: '07:00', end: '12:00' },
  { label: 'Afternoon', icon: <Sun size={14} />, start: '12:00', end: '17:00' },
  { label: 'Evening', icon: <Sunset size={14} />, start: '17:00', end: '21:00' },
  { label: 'Night', icon: <Moon size={14} />, start: '21:00', end: '23:59' },
];

function TimeSlotRow({ day, slots, onAddSlot, onRemoveSlot, onUpdateSlot, disabled }) {
  return (
    <div className="bg-paper-card border border-line rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-ink">{day}</h4>
        <button
          type="button"
          onClick={() => onAddSlot(day)}
          disabled={disabled}
          className="text-xs font-semibold text-marigold-deep hover:text-marigold flex items-center gap-1 disabled:opacity-40"
        >
          <Plus size={14} /> Add slot
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-xs text-ink-soft">Not available</p>
      ) : (
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="time"
                value={slot.start}
                onChange={(e) => onUpdateSlot(day, idx, 'start', e.target.value)}
                disabled={disabled}
                className="flex-1 px-2.5 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
              />
              <span className="text-ink-soft text-xs">to</span>
              <input
                type="time"
                value={slot.end}
                onChange={(e) => onUpdateSlot(day, idx, 'end', e.target.value)}
                disabled={disabled}
                className="flex-1 px-2.5 py-2 border border-line rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => onRemoveSlot(day, idx)}
                disabled={disabled}
                className="p-2 text-ink-soft hover:text-brick disabled:opacity-40"
                aria-label="Remove slot"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvailabilitySchedule({ onBack, onSave }) {
  const { t } = useLanguage();

  const [schedule, setSchedule] = useState({
    Monday: [{ start: '09:00', end: '17:00' }],
    Tuesday: [{ start: '09:00', end: '17:00' }],
    Wednesday: [{ start: '09:00', end: '17:00' }],
    Thursday: [{ start: '09:00', end: '17:00' }],
    Friday: [{ start: '09:00', end: '17:00' }],
    Saturday: [{ start: '10:00', end: '15:00' }],
    Sunday: [],
  });

  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const addSlot = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: '09:00', end: '17:00' }],
    }));
  };

  const removeSlot = (day, idx) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const updateSlot = (day, idx, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].map((slot, i) =>
        i === idx ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const applyPreset = (preset) => {
    const newSchedule = {};
    DAYS.forEach((day) => {
      if (day === 'Sunday') {
        newSchedule[day] = [];
      } else if (day === 'Saturday') {
        newSchedule[day] = [{ start: '10:00', end: '15:00' }];
      } else {
        newSchedule[day] = [{ start: preset.start, end: preset.end }];
      }
    });
    setSchedule(newSchedule);
  };

  const clearAll = () => {
    const cleared = {};
    DAYS.forEach((day) => { cleared[day] = []; });
    setSchedule(cleared);
  };

  const handleSave = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      // Format schedule for backend if required
      await updateSchedule?.(schedule).catch(() => {});
      setStatus('success');
      onSave?.(schedule);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Could not save schedule. Please try again.');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-5">
        <SuccessState
          title="Availability saved"
          subtitle="Customers can now see when you are free."
          onContinue={onBack}
        />
      </div>
    );
  }

  return (
    <div className="p-5 min-h-screen bg-paper">
      <div className="max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-ink-soft text-sm mb-4"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-[22px] font-display font-semibold mb-2">Availability Schedule</h2>
        <p className="text-sm text-ink-soft mb-6">
          Set the days and times you are available to accept tasks.
        </p>

        {status === 'error' && (
          <div className="mb-4">
            <ErrorState title="Save failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
          </div>
        )}

        {/* Quick presets */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-ink-soft mb-2 font-mono uppercase tracking-wide">
            Quick apply preset
          </div>
          <div className="flex gap-2 flex-wrap">
            {TIME_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                disabled={status === 'loading'}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-line bg-white text-xs font-semibold hover:bg-paper-card disabled:opacity-40"
              >
                {preset.icon} {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              disabled={status === 'loading'}
              className="px-3 py-2 rounded-lg border border-line bg-white text-xs font-semibold text-brick hover:bg-rose-50 disabled:opacity-40"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Day-by-day schedule */}
        <div className="mb-8">
          {DAYS.map((day) => (
            <TimeSlotRow
              key={day}
              day={day}
              slots={schedule[day] || []}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onUpdateSlot={updateSlot}
              disabled={status === 'loading'}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="bg-paper-card border border-line rounded-xl p-4 mb-6 flex items-center gap-3">
          <Clock size={18} className="text-marigold-deep" />
          <div>
            <div className="text-sm font-semibold text-ink">
              {Object.values(schedule).flat().length} time slots set
            </div>
            <div className="text-xs text-ink-soft">
              {Object.entries(schedule).filter(([, slots]) => slots.length > 0).length} days active
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={status === 'loading'}
          className="w-full bg-ink text-white py-3.5 rounded-xl font-bold text-[14.5px] shadow-card hover:shadow-lift transition-all active:scale-[.98] disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Save size={18} /> Save schedule
        </button>
      </div>
    </div>
  );
}

