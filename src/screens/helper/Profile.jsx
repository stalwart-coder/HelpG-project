import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import HelperMini from '../../components/HelperMini';
import { helperProfile } from '../../data/mockData';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function EditSkillsModal({ profile, onSave, onClose }) {
  const [selectedSkills, setSelectedSkills] = useState(profile.skills);
  const [selectedRadius, setSelectedRadius] = useState(profile.radiusKm);
  const [area, setArea] = useState(profile.area);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const { lang } = useLanguage();

  const areaTrim = area.trim();
  const errors = {
    skills: selectedSkills.length === 0 ? 'Select at least one service skill.' : '',
    area:
      !areaTrim
        ? 'Service area is required.'
        : areaTrim.length < 3
          ? 'Service area must be at least 3 characters.'
          : '',
  };
  const canSave = !errors.skills && !errors.area && status !== 'loading';

  const toggleSkill = (id) => {
    if (status === 'loading') return;
    setSelectedSkills((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  };

  const handleSave = () => {
    if (!canSave) return;
    setStatus('loading');
    setErrorMsg('');
    setTimeout(() => {
      const shouldError = Math.random() < 0.08;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Could not save helper profile right now. Please try again.');
        return;
      }
      onSave({ skills: selectedSkills, radius: selectedRadius, area: areaTrim });
      setStatus('success');
    }, 800);
  };

  const resetForm = () => {
    setSelectedSkills(profile.skills);
    setSelectedRadius(profile.radiusKm);
    setArea(profile.area);
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[17px]">Edit skills and radius</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-paper-card disabled:opacity-40"
            disabled={status === 'loading'}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {status === 'success' ? (
          <SuccessState
            title="Helper profile updated"
            subtitle="Your availability details are ready for matching."
            onContinue={onClose}
          />
        ) : status === 'error' ? (
          <ErrorState title="Save failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            noValidate
          >
            {status === 'loading' ? (
              <LoadingState title="Saving profile..." subtitle="Updating your helper matching settings." />
            ) : null}

            <fieldset className="mb-6" aria-describedby="helper-skills-error">
              <legend className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide">
                Skills
              </legend>
              <div className="flex gap-2 flex-wrap">
                {SERVICES.map((s) => {
                  const active = selectedSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSkill(s.id)}
                      disabled={status === 'loading'}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all disabled:opacity-60 ${
                        active
                          ? 'bg-marigold border-marigold text-ink font-semibold'
                          : 'bg-white border-line text-ink hover:bg-paper-card'
                      }`}
                    >
                      {s.icon} {SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}
                    </button>
                  );
                })}
              </div>
              {errors.skills ? (
                <div id="helper-skills-error" className="mt-2 flex items-center gap-1 text-xs text-rose-600">
                  <AlertTriangle size={14} /> {errors.skills}
                </div>
              ) : null}
            </fieldset>

            <div className="mb-6">
              <label htmlFor="helper-radius" className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide block">
                Service radius
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="helper-radius"
                  type="range"
                  min={1}
                  max={10}
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  disabled={status === 'loading'}
                  className="flex-1 accent-marigold-deep disabled:opacity-60"
                />
                <span className="font-mono font-bold text-[16px] min-w-[48px] text-right">
                  {selectedRadius} km
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="helper-area" className="block text-xs font-semibold text-ink-soft mb-1.5">
                Primary service area
              </label>
              <input
                id="helper-area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                disabled={status === 'loading'}
                aria-invalid={!!errors.area}
                aria-describedby="helper-area-error"
                className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60"
                placeholder="e.g. Malviya Nagar, Jaipur"
              />
              {errors.area ? (
                <div id="helper-area-error" className="mt-1 flex items-center gap-1 text-xs text-rose-600">
                  <AlertTriangle size={14} /> {errors.area}
                </div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!canSave}
              className="w-full bg-marigold text-ink py-3.5 rounded-xl font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </span>
              ) : (
                'Save changes'
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={status === 'loading'}
              className="mt-3 w-full border border-line rounded-xl py-3 font-semibold text-sm hover:bg-paper-card disabled:opacity-40"
            >
              Reset
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HelperProfile() {
  const { t, lang } = useLanguage();
  const [profile, setProfile] = useState(helperProfile);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.04;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Could not load your helper profile.');
        return;
      }
      setStatus('ready');
    }, 600);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  const handleSave = ({ skills, radius, area }) => {
    setProfile((p) => ({ ...p, skills, radiusKm: radius, area }));
  };

  if (status === 'loading') {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>
        <LoadingState title="Loading helper profile..." subtitle="Fetching your skills and work area." />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>
        <ErrorState
          title="Profile unavailable"
          subtitle={errorMsg}
          onRetry={() => {
            setStatus('loading');
            setErrorMsg('');
            setLoadAttempt((n) => n + 1);
          }}
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <EmptyState
        title="No helper profile"
        subtitle="Add your skills and service radius to start receiving tasks."
        cta={
          <button
            type="button"
            onClick={() => setProfile({ ...helperProfile, skills: [], radiusKm: 3 })}
            className="mt-4 bg-marigold text-ink px-5 py-3 rounded-lg font-semibold text-sm"
          >
            Create profile
          </button>
        }
      />
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>

      <HelperMini
        name={profile.name}
        initials={profile.initials}
        verified="ID Verified"
        rating={profile.rating}
        taskCount={profile.completedTasks}
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>
          <div className="font-bold text-ink mt-1">{profile.rating}</div>
        </div>
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>
          <div className="font-bold text-ink mt-1">{profile.completedTasks}</div>
        </div>
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Radius</div>
          <div className="font-bold text-ink mt-1">{profile.radiusKm} km</div>
        </div>
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        {t('skillsLabel')}
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {SERVICES.map((s) => {
          const active = profile.skills.includes(s.id);
          return (
            <div
              key={s.id}
              className={`px-3.5 py-2 rounded-full text-[13px] border ${
                active ? 'bg-marigold border-marigold text-ink font-semibold' : 'bg-white border-line text-ink'
              }`}
            >
              {SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}
            </div>
          );
        })}
      </div>

      <div className="bg-paper-card border border-line rounded-card p-5 shadow-card mb-4">
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('area')}</h4>
          <div className="text-right">{profile.area}</div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('memberSince')}</h4>
          <div>{profile.memberSince}</div>
        </div>
        <div className="flex justify-between items-center py-3">
          <h4 className="text-[13.5px] font-semibold">Phone</h4>
          <div>{profile.phone}</div>
        </div>
      </div>

      {profile.reviews && profile.reviews.length > 0 ? (
        <>
          <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
            Reviews from customers
          </div>
          <div className="space-y-3 mb-4">
            {profile.reviews.map((r) => (
              <div key={r.name} className="bg-paper-card border border-line rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13.5px] font-semibold text-ink">{r.name}</span>
                  <div className="text-marigold-deep text-xs">
                    {'*'.repeat(r.rating)}{'-'.repeat(5 - r.rating)}
                  </div>
                </div>
                <p className="text-xs text-ink-soft leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState title="No reviews yet" subtitle="Completed tasks and customer reviews will appear here." />
      )}

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full border border-line rounded-lg py-3 font-semibold text-sm hover:bg-paper-card transition-colors"
      >
        {t('editSkills')}
      </button>

      {editing && (
        <EditSkillsModal
          profile={profile}
          onSave={handleSave}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
