import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  ImagePlus,
  Loader2,
  LocateFixed,
  MapPin,
  UploadCloud,
  Wallet,
  X,
} from 'lucide-react';

import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_DESCS, SERVICE_LABELS } from '../../config/services';
import { createBooking } from '../../utils/bookingApi';
import { uploadDocument } from '../../utils/kycApi';
import UberLiveTracker from '../../components/tracking/UberLiveTracker';

function clampStr(s, maxLen) {
  const v = (s ?? '').toString();
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

function formatINR(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  try {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(num);
  } catch {
    return String(num);
  }
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-rose-600">
      <AlertTriangle size={14} /> {msg}
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
        {eyebrow}
      </div>
      <h3 className="mt-1 font-display text-[18px] font-bold leading-tight text-slate-900 dark:text-white">
        {title}
      </h3>
      {subtitle ? (
        <p className="mt-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">{subtitle}</p>
      ) : null}
    </div>
  );
}

function SelectorCard({ selected, onClick, icon, title, desc, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex min-h-[116px] w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        selected
          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/40'
      }`}
      aria-pressed={selected}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[24px] ${
          selected ? 'border-amber-500 bg-amber-500/20' : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800'
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold leading-snug text-slate-900 dark:text-white">{title}</span>
        <span className="mt-1 block text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">{desc}</span>
      </span>
      {selected ? (
        <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950">
          <CheckCircle2 size={15} />
        </span>
      ) : null}
    </button>
  );
}

function Segmented({ value, options, onChange, disabled }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            disabled={disabled}
            className={`rounded-lg border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
              selected
                ? 'border-ink bg-ink text-white shadow-[0_14px_34px_rgba(27,35,64,0.16)]'
                : 'border-line bg-white hover:border-ink/25'
            }`}
          >
            <span className="flex items-center gap-2">
              {opt.icon ? <span className={selected ? 'text-marigold' : 'text-ink-soft'}>{opt.icon}</span> : null}
              <span className="text-[13px] font-semibold">{opt.label}</span>
            </span>
            <span className={`mt-1 block text-[11.5px] ${selected ? 'text-white/70' : 'text-ink-soft'}`}>
              {opt.sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function PostTask({ presetCategory, onSubmitted, onBack }) {
  const { t, lang } = useLanguage();

  const [category, setCategory] = useState(presetCategory || SERVICES[0].id);
  const [duration, setDuration] = useState('onetime');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState([]);
  const [locationStatus, setLocationStatus] = useState('idle');

  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedTask, setSubmittedTask] = useState(null);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [showTracker, setShowTracker] = useState(false);

  const inputRef = useRef(null);

  const durations = useMemo(
    () => [
      { id: 'onetime', label: t('durationOneTime'), sub: 'A focused single visit', icon: <Clock3 size={14} /> },
      { id: '1day', label: t('duration1Day'), sub: 'Flexible within 24 hours', icon: <Calendar size={14} /> },
      { id: '2day', label: t('duration2Day'), sub: 'Best for larger requests', icon: <Calendar size={14} /> },
    ],
    [t],
  );

  const selectedService = SERVICES.find((s) => s.id === category);
  const selectedLabel = SERVICE_LABELS[lang]?.[category] ?? SERVICE_LABELS.en[category];
  const budgetNum = Number(budget);

  const fieldErrors = useMemo(() => {
    const errs = {};

    const dt = dateTime.trim();
    if (!dt) errs.dateTime = 'Please enter a valid date & time.';
    else if (dt.length < 5) errs.dateTime = 'Date & time looks too short.';

    const loc = location.trim();
    if (!loc) errs.location = 'Please enter your location.';
    else if (loc.length < 3) errs.location = 'Location looks too short.';

    if (budget.trim() === '') errs.budget = 'Budget is required.';
    else if (Number.isNaN(budgetNum)) errs.budget = 'Budget must be a number.';
    else if (budgetNum < 50) errs.budget = 'Minimum budget is Rs. 50.';
    else if (budgetNum > 50000) errs.budget = 'Maximum budget is Rs. 50,000.';

    if (notes.trim().length > 300) errs.notes = 'Notes must be under 300 characters.';

    return errs;
  }, [dateTime, location, budget, budgetNum, notes]);

  const canSubmit = Object.keys(fieldErrors).length === 0 && status !== 'loading';
  const remainingRequired = ['dateTime', 'location', 'budget'].filter((key) => fieldErrors[key]).length;

  const handlePickFiles = (files) => {
    const arr = Array.from(files || []);
    if (arr.length === 0) return;
    setImages((prev) => [...prev, ...arr].slice(0, 6));
  };

  const removeImageAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setCategory(presetCategory || SERVICES[0].id);
    setDuration('onetime');
    setDateTime('');
    setLocation('');
    setBudget('');
    setNotes('');
    setImages([]);
    setLocationStatus('idle');
    setErrorMsg('');
    setStatus('idle');
    setSubmittedTask(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      let uploadedImageUrls = [];
      if (images && images.length > 0) {
        for (const img of images) {
          if (img instanceof File) {
            try {
              const uploadRes = await uploadDocument('taskImage', img);
              if (uploadRes?.url) {
                uploadedImageUrls.push(uploadRes.url);
              }
            } catch (uploadErr) {
              console.warn('Image upload error:', uploadErr);
            }
          }
        }
      }

      const bookingData = {
        category,
        title: `${selectedLabel} — ${location.trim() || 'Location TBD'}`,
        description: notes.trim(),
        location: location.trim(),
        scheduledAt: new Date().toISOString(),
        duration,
        price: Number(budget),
        totalAmount: Number(budget),
        images: uploadedImageUrls,
      };

      const res = await createBooking(bookingData);
      const bookingPayload = res?.data || res || bookingData;
      setCreatedBooking(bookingPayload);
      setSubmittedTask({ category, duration, dateTime, location, budget: String(budget), notes, images, uploadedUrls: uploadedImageUrls });
      setStatus('success');
      setShowTracker(true);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Unable to post task right now. Please try again.');
    }
  };

  const handleUseLocation = () => {
    if (status === 'loading' || locationStatus === 'loading') return;

    if (!navigator.geolocation) {
      setLocationStatus('error');
      setErrorMsg('Location access is not available in this browser.');
      return;
    }

    setLocationStatus('loading');
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const lat = coords.latitude.toFixed(5);
        const lng = coords.longitude.toFixed(5);
        setLocation(`Current location (${lat}, ${lng})`);
        setLocationStatus('idle');
      },
      () => {
        setLocationStatus('error');
        setErrorMsg('Allow location access or type your address manually.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  };

  if (showTracker && createdBooking) {
    return (
      <UberLiveTracker
        booking={createdBooking}
        onClose={() => {
          setShowTracker(false);
          if (onSubmitted) onSubmitted(submittedTask);
          else onBack?.();
        }}
      />
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-[480px] flex flex-col items-center justify-center p-8 text-center bg-white rounded-3xl border border-line shadow-sm max-w-lg mx-auto my-10">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <h3 className="text-2xl font-bold font-display text-ink mb-2">Task posted successfully!</h3>
        <p className="text-sm text-ink-soft mb-6 max-w-sm">
          Nearby verified helpers are reviewing your request on their radar. Track them live right now.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={() => setShowTracker(true)}
            className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg cursor-pointer transition-all active:scale-98"
          >
            Launch Live Partner Radar
          </button>
          <button
            type="button"
            onClick={() => {
              if (onSubmitted) onSubmitted(submittedTask);
              else onBack?.();
            }}
            className="py-3.5 px-6 rounded-xl border border-line bg-paper-card text-ink font-semibold text-sm hover:bg-paper cursor-pointer"
          >
            View My Tasks
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return <ErrorState title="Post failed" subtitle={errorMsg} onRetry={handleSubmit} />;
  }

  return (
    <div className="bg-[#F7F7F4] px-5 py-5 lg:px-7">
      <div className="mx-auto max-w-[1040px]">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-[13px] font-semibold text-ink-soft shadow-sm transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          disabled={status === 'loading'}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="mb-6 border-b border-line pb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
                New request
              </div>
              <h2 className="mt-2 max-w-2xl font-display text-[30px] font-semibold leading-tight text-ink sm:text-[36px]">
                Tell helpers exactly what needs to get done.
              </h2>
              <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-soft">
                Clear timing, location, photos, and a fair budget help the right nearby helper accept faster.
              </p>
            </div>
            <div className="rounded-lg border border-line bg-white px-4 py-3 shadow-sm">
              <div className="text-[11px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
                Match readiness
              </div>
              <div className="mt-1 text-[18px] font-semibold text-ink">
                {remainingRequired === 0 ? 'Ready to post' : `${3 - remainingRequired}/3 required`}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="space-y-5">
            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Service"
                title="Choose the kind of help"
                subtitle="Pick the closest fit so your request reaches helpers with the right skills."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const selected = category === s.id;
                  const title = SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id];
                  const desc = SERVICE_DESCS[lang]?.[s.id] ?? SERVICE_DESCS.en[s.id];
                  return (
                    <SelectorCard
                      key={s.id}
                      selected={selected}
                      onClick={() => setCategory(s.id)}
                      icon={s.icon}
                      title={title}
                      desc={desc}
                      disabled={status === 'loading'}
                    />
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Schedule"
                title="When should this happen?"
                subtitle="Use natural timing if that is easier. Helpers will see this before accepting."
              />
              <Segmented
                value={duration}
                options={durations}
                onChange={setDuration}
                disabled={status === 'loading'}
              />
              <div className="mt-4">
                <label htmlFor="post-date-time" className="mb-2 block text-[12px] font-semibold text-ink-soft">
                  Preferred date and time
                </label>
                <div className="relative">
                  <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" size={17} />
                  <input
                    id="post-date-time"
                    value={dateTime}
                    onChange={(e) => setDateTime(clampStr(e.target.value, 80))}
                    placeholder="Tomorrow, 9:00 AM"
                    aria-invalid={!!fieldErrors.dateTime}
                    aria-describedby="post-date-time-error"
                    className="w-full rounded-lg border border-line bg-[#FBFBFA] py-4 pl-12 pr-4 text-[14px] text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-4 focus:ring-ink/5"
                    disabled={status === 'loading'}
                  />
                </div>
                <div id="post-date-time-error"><FieldError msg={fieldErrors.dateTime} /></div>
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Location"
                title="Where should the helper arrive?"
                subtitle="Add an area, landmark, or precise location. You can also use device location."
              />
              <div className="rounded-lg border border-line bg-[#FBFBFA] p-2">
                <div className="flex items-center gap-3 rounded-md bg-white px-3 py-3 shadow-sm">
                  <MapPin size={18} className="shrink-0 text-ink-soft" />
                  <input
                    id="post-location"
                    value={location}
                    onChange={(e) => setLocation(clampStr(e.target.value, 120))}
                    placeholder="Malviya Nagar, Jaipur"
                    aria-invalid={!!fieldErrors.location || locationStatus === 'error'}
                    aria-describedby="post-location-error"
                    aria-label="Task location"
                    className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="button"
                    disabled={status === 'loading' || locationStatus === 'loading'}
                    onClick={handleUseLocation}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {locationStatus === 'loading' ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <LocateFixed size={14} />
                    )}
                    {locationStatus === 'loading' ? 'Locating' : 'Use GPS'}
                  </button>
                </div>
              </div>
              <div className="mt-2 text-[12px] text-ink-soft">
                Tip: include gate number, building name, or pickup/drop instructions.
              </div>
              <div id="post-location-error">
                <FieldError msg={fieldErrors.location} />
                {locationStatus === 'error' && errorMsg ? <FieldError msg={errorMsg} /> : null}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Budget"
                title="Set a fair offer"
                subtitle="A realistic budget improves acceptance and reduces back-and-forth."
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-soft">
                      Rs.
                    </span>
                    <input
                      id="post-budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="400"
                      type="number"
                      min="0"
                      aria-invalid={!!fieldErrors.budget}
                      aria-describedby="post-budget-error"
                      aria-label="Task budget in rupees"
                      className="w-full rounded-lg border border-line bg-[#FBFBFA] py-4 pl-12 pr-4 text-[22px] font-semibold text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-4 focus:ring-ink/5"
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div id="post-budget-error"><FieldError msg={fieldErrors.budget} /></div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:w-[220px]">
                  {[250, 500, 900].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setBudget(String(amount))}
                      disabled={status === 'loading'}
                      className="rounded-lg border border-line bg-white px-3 py-3 text-[13px] font-semibold text-ink transition-colors hover:border-ink/25 hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>
              {budget.trim() !== '' ? (
                <div className="mt-3 rounded-lg bg-ink px-4 py-3 text-sm text-white">
                  Helpers will see an offer of <span className="font-semibold">Rs. {formatINR(budgetNum)}</span>.
                </div>
              ) : null}
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Details"
                title="Add the context helpers need"
                subtitle="Quantity, materials, access notes, and urgency all help helpers quote accurately."
              />
              <textarea
                id="post-notes"
                value={notes}
                onChange={(e) => setNotes(clampStr(e.target.value, 300))}
                placeholder="Example: 15 kurtas and 2 sarees. Pickup from tower B, need before evening."
                aria-invalid={!!fieldErrors.notes}
                aria-describedby="post-notes-error"
                aria-label="Task details"
                className="min-h-[132px] w-full resize-none rounded-lg border border-line bg-[#FBFBFA] px-4 py-4 text-[14px] leading-relaxed text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-4 focus:ring-ink/5"
                disabled={status === 'loading'}
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-[12px]">
                <span className="text-ink-soft">Optional, but strongly recommended.</span>
                <span className={`font-semibold ${notes.trim().length > 280 ? 'text-rose-600' : 'text-ink-soft'}`}>
                  {notes.trim().length}/300
                </span>
              </div>
              <div id="post-notes-error"><FieldError msg={fieldErrors.notes} /></div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm sm:p-6">
              <SectionHeader
                eyebrow="Photos"
                title="Upload reference images"
                subtitle="Photos help helpers understand size, condition, and required supplies."
              />
              <div
                className="rounded-lg border border-dashed border-ink/25 bg-[#FBFBFA] p-4 transition-colors hover:bg-white"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePickFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePickFiles(e.target.files)}
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={status === 'loading'}
                  className="flex w-full items-center gap-4 rounded-md bg-white p-4 text-left shadow-sm transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <UploadCloud size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink">Drop photos here or browse</span>
                    <span className="mt-1 block text-[12px] text-ink-soft">Up to 6 images. Clear, well-lit photos work best.</span>
                  </span>
                </button>

                {images.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((file, idx) => {
                      const url = URL.createObjectURL(file);
                      return (
                        <div key={`${file.name}-${idx}`} className="relative overflow-hidden rounded-lg border border-line bg-white">
                          <img
                            src={url}
                            alt={`Upload ${idx + 1}`}
                            className="h-[112px] w-full object-cover"
                            onLoad={() => URL.revokeObjectURL(url)}
                          />
                          <button
                            type="button"
                            disabled={status === 'loading'}
                            onClick={() => removeImageAt(idx)}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-white transition-colors hover:bg-ink disabled:opacity-60"
                            aria-label="Remove image"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </section>
          </main>

          <aside className="lg:sticky lg:top-5 lg:self-start">
            <div className="rounded-lg border border-line bg-white p-5 shadow-[0_18px_50px_rgba(27,35,64,0.08)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-marigold/25 text-[24px]">
                  {selectedService?.icon}
                </div>
                <div>
                  <div className="text-[12px] font-mono font-semibold uppercase tracking-wide text-ink-soft">
                    Request summary
                  </div>
                  <div className="text-[15px] font-semibold text-ink">{selectedLabel}</div>
                </div>
              </div>

              <div className="space-y-3 border-y border-line py-4">
                <div className="flex items-start gap-3 text-sm">
                  <Clock3 size={16} className="mt-0.5 text-ink-soft" />
                  <div>
                    <div className="font-semibold text-ink">{dateTime.trim() || 'Timing not set'}</div>
                    <div className="text-[12px] text-ink-soft">{durations.find((d) => d.id === duration)?.sub}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="mt-0.5 text-ink-soft" />
                  <div>
                    <div className="font-semibold text-ink">{location.trim() || 'Location not set'}</div>
                    <div className="text-[12px] text-ink-soft">Visible only after helper accepts.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Wallet size={16} className="mt-0.5 text-ink-soft" />
                  <div>
                    <div className="font-semibold text-ink">
                      {budget.trim() ? `Rs. ${formatINR(budgetNum)}` : 'Budget not set'}
                    </div>
                    <div className="text-[12px] text-ink-soft">{images.length} photo{images.length === 1 ? '' : 's'} attached</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit || status === 'loading'}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-5 py-4 text-[15px] font-bold text-white shadow-[0_18px_40px_rgba(27,35,64,0.22)] transition-transform active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Posting request
                  </>
                ) : (
                  <>
                    <ImagePlus size={18} /> {t('submitTask')}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={status === 'loading'}
                className="mt-3 w-full rounded-lg border border-line bg-white px-5 py-3 text-[13px] font-semibold text-ink-soft hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset form
              </button>

              <div className="mt-3 text-center text-[12px] leading-relaxed text-ink-soft">
                {canSubmit
                  ? 'Ready. We will notify matching helpers nearby.'
                  : 'Complete timing, location, and budget to post.'}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
