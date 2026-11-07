import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS } from '../../config/services';
import HelperMini from '../../components/HelperMini';
import { EmptyState, ErrorState, LoadingState, SuccessState } from '../../components/ui/PageState';

function EditSkillsModal({ profile, onSave, onClose }) {
  const [selectedSkills, setSelectedSkills] = useState(profile.skills || []);
  const [selectedRadius, setSelectedRadius] = useState(profile.radiusKm || 5);
  const [area, setArea] = useState(profile.area || '');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { lang } = useLanguage();

  const areaTrim = area.trim();
  const errors = {
    skills: selectedSkills.length === 0 ? 'Select at least one service skill.' : '',
    area: !areaTrim ? 'Service area is required.' : areaTrim.length < 3 ? 'Service area must be at least 3 characters.' : '',
  };
  const canSave = !errors.skills && !errors.area && status !== 'loading';

  const toggleSkill = (id) => {
    if (status === 'loading') return;
    setSelectedSkills((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await onSave({ skills: selectedSkills, radius: selectedRadius, area: areaTrim });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Could not save helper profile.');
    }
  };

  const resetForm = () => {
    setSelectedSkills(profile.skills || []);
    setSelectedRadius(profile.radiusKm || 5);
    setArea(profile.area || '');
    setStatus('idle');
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[520px] bg-white rounded-t-3xl p-6 pb-10 shadow-lift">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-[17px]">Edit skills and radius</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-paper-card disabled:opacity-40" disabled={status === 'loading'} aria-label="Close"><X size={18} /></button>
        </div>
        {status === 'success' ? (
          <SuccessState title="Helper profile updated" subtitle="Your availability details are ready for matching." onContinue={onClose} />
        ) : status === 'error' ? (
          <ErrorState title="Save failed" subtitle={errorMsg} onRetry={() => setStatus('idle')} />
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} noValidate>
            {status === 'loading' && <LoadingState title="Saving profile..." subtitle="Updating your helper matching settings." />}
            <fieldset className="mb-6">
              <legend className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide">Skills</legend>
              <div className="flex gap-2 flex-wrap">
                {SERVICES.map((s) => {
                  const active = selectedSkills.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSkill(s.id)} disabled={status === 'loading'}
                      className={`px-4 py-2 rounded-full text-[13px] border transition-all disabled:opacity-60 ${active ? 'bg-marigold border-marigold text-ink font-semibold' : 'bg-white border-line text-ink hover:bg-paper-card'}`}>
                      {s.icon} {SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}
                    </button>
                  );
                })}
              </div>
              {errors.skills && <div className="mt-2 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle size={14} /> {errors.skills}</div>}
            </fieldset>
            <div className="mb-6">
              <label className="text-xs font-semibold text-ink-soft mb-3 font-mono uppercase tracking-wide block">Service radius</label>
              <div className="flex items-center gap-4">
                <input type="range" min={1} max={10} value={selectedRadius} onChange={(e) => setSelectedRadius(Number(e.target.value))} disabled={status === 'loading'} className="flex-1 accent-marigold-deep disabled:opacity-60" />
                <span className="font-mono font-bold text-[16px] min-w-[48px] text-right">{selectedRadius} km</span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-ink-soft mb-1.5">Primary service area</label>
              <input value={area} onChange={(e) => setArea(e.target.value)} disabled={status === 'loading'} className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 disabled:opacity-60" placeholder="e.g. Malviya Nagar, Jaipur" />
              {errors.area && <div className="mt-1 flex items-center gap-1 text-xs text-rose-600"><AlertTriangle size={14} /> {errors.area}</div>}
            </div>
            <button type="submit" disabled={!canSave} className="w-full bg-marigold text-ink py-3.5 rounded-xl font-bold text-[14.5px] disabled:opacity-40 disabled:cursor-not-allowed">
              {status === 'loading' ? <span className="inline-flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Saving...</span> : 'Save changes'}
            </button>
            <button type="button" onClick={resetForm} disabled={status === 'loading'} className="mt-3 w-full border border-line rounded-xl py-3 font-semibold text-sm hover:bg-paper-card disabled:opacity-40">Reset</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function HelperProfile({
  profileData,
  availability,
  schedule,
  serviceAreas,
  loading,
  error,
  activeTasks = [],
  onUpdateProfile,
  onUpdateSchedule,
  onAddServiceArea,
  onRemoveServiceArea,
  onRetry,
}) {
  const { t, lang } = useLanguage();
  const [editing, setEditing] = useState(false);

  const displayProfile = useMemo(() => {
    if (!profileData) return null;
    const user = profileData.user || {};
    const prof = profileData.profile || {};
    const totalJobs = (prof.totalCompletedJobs || 0) + (prof.totalRejectedJobs || 0);
    const acceptanceRate = totalJobs > 0 ? Math.round(((prof.totalCompletedJobs || 0) / totalJobs) * 100) : 100;
    const skillList = Array.isArray(prof.skills)
      ? prof.skills.map((s) => (typeof s === 'object' && s.categoryId) ? s.categoryId.toString() : s)
      : [];
    return {
      name: user.name || 'Helper',
      initials: user.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'HP',
      phone: user.phone || '\u2014',
      email: user.email || '\u2014',
      avatar: user.avatar || '',
      rating: prof.averageRating || 0,
      completedTasks: prof.totalCompletedJobs || 0,
      totalEarnings: prof.totalEarnings || 0,
      acceptanceRate,
      skills: skillList,
      experienceYears: prof.experienceYears || 0,
      languages: prof.languages || [],
      kycStatus: prof.kycStatus || 'pending',
      memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '\u2014',
      isAvailable: availability?.isAvailable ?? prof.isAvailable ?? false,
    };
  }, [profileData, availability]);

  if (loading && !displayProfile) {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>
        <LoadingState title="Loading helper profile..." subtitle="Fetching your skills and work area." />
      </div>
    );
  }

  if (error && !displayProfile) {
    return (
      <div className="p-5">
        <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>
        <ErrorState title="Profile unavailable" subtitle={error} onRetry={onRetry} />
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <EmptyState title="No helper profile" subtitle="Add your skills and service radius to start receiving tasks."
        cta={<button type="button" className="mt-4 bg-marigold text-ink px-5 py-3 rounded-lg font-semibold text-sm">Create profile</button>}
      />
    );
  }

  return (
    <div className="p-5">
      <h2 className="text-lg font-display font-semibold mb-4">{t('helperProfileHeading')}</h2>
      <HelperMini name={displayProfile.name} initials={displayProfile.initials}
        verified={displayProfile.kycStatus === 'verified' ? 'ID Verified' : 'KYC Pending'}
        rating={displayProfile.rating} taskCount={displayProfile.completedTasks} />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>
          <div className="font-bold text-ink mt-1">{displayProfile.rating.toFixed(1)}</div>
        </div>
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>
          <div className="font-bold text-ink mt-1">{displayProfile.completedTasks}</div>
        </div>
        <div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Accept</div>
          <div className="font-bold text-ink mt-1">{displayProfile.acceptanceRate}%</div>
        </div>
      </div>

      {/* ── Active Tasks in Progress / Assigned to Helper ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active & Assigned Tasks</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-500">
            {activeTasks?.filter((t) => ['confirmed', 'in_progress'].includes(t.status))?.length || 0} In Progress
          </span>
        </div>

        {activeTasks && activeTasks.filter((t) => ['confirmed', 'in_progress'].includes(t.status)).length > 0 ? (
          <div className="space-y-3">
            {activeTasks
              .filter((t) => ['confirmed', 'in_progress'].includes(t.status))
              .map((t) => (
                <div
                  key={t._id || t.id}
                  className="rounded-2xl p-4 border border-line bg-paper-card shadow-card"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 uppercase">
                          {t.status === 'in_progress' ? '● In Progress' : '✓ Accepted'}
                        </span>
                        <span className="text-xs text-ink-muted">
                          {t.category || 'Task'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-ink">{t.title}</h4>
                      <p className="text-xs text-ink-soft mt-0.5 flex items-center gap-1">
                        <span>📍 {t.location || 'Local Area'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-base text-ink">₹{t.price || t.totalAmount}</div>
                      <div className="text-[10px] text-emerald-600 font-semibold">Ready to fulfill</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                    <span className="text-xs text-ink-soft">
                      Customer: {t.customer?.name || 'Local Resident'}
                    </span>
                    <a
                      href="/helper/bookings"
                      className="text-xs font-bold text-marigold-deep hover:underline flex items-center gap-1"
                    >
                      Open Task Tracking →
                    </a>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="rounded-2xl p-4 border border-dashed border-line bg-paper-card/50 text-center">
            <p className="text-xs text-ink-soft">
              No active jobs in progress right now. Head over to the <a href="/helper/home" className="text-marigold-deep font-semibold underline">Radar</a> to accept nearby neighborhood tasks.
            </p>
          </div>
        )}
      </div>

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">{t('skillsLabel')}</div>
      <div className="flex gap-2 flex-wrap mb-5">
        {SERVICES.map((s) => {
          const active = displayProfile.skills.includes(s.id);
          return (
            <div key={s.id} className={`px-3.5 py-2 rounded-full text-[13px] border ${active ? 'bg-marigold border-marigold text-ink font-semibold' : 'bg-white border-line text-ink'}`}>
              {SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}
            </div>
          );
        })}
      </div>

      {schedule?.schedule && (
        <>
          <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">Working Schedule</div>
          <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
            {schedule.schedule.filter((s) => s.isActive !== false).map((s) => (
              <div key={s.dayOfWeek} className="flex justify-between items-center py-2 border-b border-line last:border-b-0">
                <span className="text-[13px] font-semibold capitalize">{s.dayOfWeek}</span>
                <span className="text-xs text-ink-soft font-mono">{s.startTime} - {s.endTime}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {serviceAreas?.length > 0 && (
        <>
          <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">Service Areas</div>
          <div className="bg-paper-card border border-line rounded-card p-4 shadow-card mb-4">
            {serviceAreas.map((area) => (
              <div key={area._id} className="flex justify-between items-center py-2 border-b border-line last:border-b-0">
                <span className="text-[13px] font-semibold">{area.name}</span>
                <span className="text-xs text-ink-soft font-mono">{area.radiusKm} km</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-paper-card border border-line rounded-card p-5 shadow-card mb-4">
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('memberSince')}</h4>
          <div>{displayProfile.memberSince}</div>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">Phone</h4>
          <div>{displayProfile.phone}</div>
        </div>
        <div className="flex justify-between items-center py-3">
          <h4 className="text-[13.5px] font-semibold">Email</h4>
          <div>{displayProfile.email}</div>
        </div>
      </div>

      <button type="button" onClick={() => setEditing(true)}
        className="w-full border border-line rounded-lg py-3 font-semibold text-sm hover:bg-paper-card transition-colors">
        {t('editSkills')}
      </button>

      {editing && (
        <EditSkillsModal
          profile={{
            skills: displayProfile.skills,
            radiusKm: serviceAreas?.[0]?.radiusKm || 5,
            area: serviceAreas?.[0]?.name || '',
          }}
          onSave={async ({ skills, radius, area }) => {
            await onUpdateProfile({ skills: skills.map((s) => ({ categoryId: s, experience: 1 })) });
            if (area && area.trim()) {
              await onAddServiceArea({ name: area, location: { type: 'Point', coordinates: [0, 0] }, radiusKm: radius });
            }
            setEditing(false);
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}
