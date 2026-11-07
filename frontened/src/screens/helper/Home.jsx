/**
 * Helper Home — HelpJi Partner Dashboard
 * Screen:         Helper Home / Job Radar
 * Features:       Help Radar, Proximity dispatch, KYC Verification status gate, and 1-tap task acceptance
 */
import { useEffect, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { getAvailableBookings } from '../../utils/bookingApi';
import { EmptyState, ErrorState, SkeletonPage } from '../../components/ui/PageState';
import OnboardingGuide from '../../components/OnboardingGuide';
import TiltCard3D from '../../components/3d/TiltCard3D';
import HelperRadarMap from '../../components/tracking/HelperRadarMap';
import {
  Power, CheckCircle2, MapPin, Clock, ChevronRight, RefreshCw,
  Wallet, ShieldCheck, AlertCircle, ArrowRight, Sparkles, HelpCircle
} from 'lucide-react';

/* ── Help Radar: visual proximity ring display ── */
function HelpRadar({ taskCount, available }) {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px solid ${available ? 'rgba(28,168,156,0.40)' : 'rgba(92,88,112,0.20)'}`,
        }}
      />
      {/* Ping ring */}
      {available && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            inset: '-8px',
            border: '1.5px solid rgba(28,168,156,0.30)',
            animationDuration: '2.5s',
          }}
        />
      )}
      {/* Middle ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '12px',
          border: `1.5px solid ${available ? 'rgba(28,168,156,0.35)' : 'rgba(92,88,112,0.15)'}`,
        }}
      />
      {/* Center dot */}
      <div
        className="absolute rounded-full"
        style={{
          inset: '24px',
          background: available ? '#1CA89C' : '#5C5870',
          opacity: available ? 1 : 0.4,
          boxShadow: available ? '0 0 16px rgba(28,168,156,0.50)' : 'none',
        }}
      />
      {/* Task count */}
      {available && taskCount > 0 && (
        <div
          className="absolute z-10 flex flex-col items-center justify-center"
          style={{ inset: 0 }}
        >
          <span
            className="font-bold text-white text-xl sm:text-2xl"
            style={{ fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}
          >
            {taskCount}
          </span>
          <span className="text-[10px] text-white/70 font-mono uppercase tracking-wider mt-0.5">tasks</span>
        </div>
      )}
      {!available && (
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{ inset: 0 }}
        >
          <Power size={22} style={{ color: '#5C5870' }} />
        </div>
      )}
    </div>
  );
}

/* ── Opportunity Task Card (helper-specific) ── */
function OpportunityCard({ task, onAccept, accepted, accepting }) {
  const isNearby = (task.distanceKm || 1.2) <= 2;
  const netEarnings = Math.round((task.price || 350) * 0.88); // 88% net to helper

  return (
    <div
      className="rounded-2xl p-5 mb-4 transition-all duration-200"
      style={{
        background: 'var(--hj-paper-card)',
        border: '1.5px solid var(--hj-line)',
        boxShadow: 'var(--hj-shadow-card)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-md text-[11px] font-bold"
              style={{ background: 'rgba(28,168,156,0.12)', color: '#1CA89C', fontFamily: 'JetBrains Mono, monospace' }}
            >
              {task.category || 'Service Task'}
            </span>
            {isNearby && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-500/10">
                ⚡ Near You
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold leading-snug" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
            {task.title}
          </h3>

          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--hj-ink-soft)', fontFamily: 'DM Sans, sans-serif' }}>
            <div className="flex items-center gap-1">
              <MapPin size={13} style={{ color: '#1CA89C' }} />
              <span>{task.distanceKm || 1.2} km away • {task.location || 'Koramangala 4th Block'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={13} style={{ color: 'var(--hj-ink-muted)' }} />
              <span>{task.completionTime || '45 mins'}</span>
            </div>
          </div>
        </div>

        {/* Payout & Accept CTA */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--hj-line)]">
          <div className="text-left sm:text-right">
            <div className="text-[10px] text-[var(--hj-ink-muted)]">Net Payout</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              ₹{netEarnings}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAccept(task)}
            disabled={accepting || accepted}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
            style={{ background: accepted ? '#22C55E' : '#1CA89C' }}
          >
            {accepting ? (
              <span>Accepting...</span>
            ) : accepted ? (
              <><CheckCircle2 size={15} /> Accepted</>
            ) : (
              <>Accept Job <ChevronRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Screen ── */
export default function HelperHome({
  onAcceptTask,
  onGoBookings,
  onGoKyc,
  availability,
  onToggleAvailability,
  profile,
}) {
  const { t } = useLanguage();
  const [loadStatus, setLoadStatus] = useState('loading');
  const [tasks, setTasks] = useState([]);
  const [accepted, setAccepted] = useState({});
  const [acceptingId, setAcceptingId] = useState(null);
  const [available, setAvailable] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [isKycVerified, setIsKycVerified] = useState(profile?.isVerified ?? true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadStatus('loading');
      try {
        const data = await getAvailableBookings({ limit: 20 });
        if (!cancelled) { setTasks(data.bookings || []); setLoadStatus('ready'); }
      } catch {
        if (!cancelled) setLoadStatus('ready');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAccept = async (task) => {
    if (!available || acceptingId) return;
    const id = task._id || task.id;
    setAcceptingId(id);
    try {
      await onAcceptTask?.(id);
      setAccepted((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => onGoBookings?.(), 600);
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="w-full pb-nav animate-fade-in" data-role="helper">
      {/* ── Top Bar: KYC & Guide Controls ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#1CA89C]">
            PARTNER RADAR
          </span>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
            Neighborhood Job Radar
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
          style={{ background: 'var(--hj-paper-card)', border: '1px solid var(--hj-line)', color: 'var(--hj-ink-soft)' }}
        >
          <HelpCircle size={14} style={{ color: '#1CA89C' }} />
          <span>How It Works</span>
        </button>
      </div>

      {/* ── KYC Verification Banner (if not verified) ── */}
      {!isKycVerified && (
        <div
          className="p-4 sm:p-5 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
          style={{ background: 'rgba(244,131,31,0.10)', border: '1.5px solid #F4831F' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: '#F4831F' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#F4831F]">Action Required: Complete Aadhaar & Selfie KYC</div>
              <div className="text-xs text-[var(--hj-ink-soft)]">
                Get your verified helper badge to accept premium high-payout micro-tasks in your locality.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoKyc || (() => window.location.href = '/helper/kyc')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 flex items-center gap-1 shadow-md cursor-pointer"
            style={{ background: '#F4831F' }}
          >
            <span>Complete KYC</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Interactive Neighborhood Radar Map (Uber / Rapido Style) ── */}
      <HelperRadarMap
        tasks={tasks}
        isAvailable={available}
        onToggleAvailability={(newVal) => {
          setAvailable(newVal);
          onToggleAvailability?.(newVal);
        }}
        onAcceptTask={(taskId) => {
          const taskObj = tasks.find((t) => (t._id || t.id) === taskId);
          if (taskObj) handleAccept(taskObj);
          else onAcceptTask?.(taskId);
        }}
        helperProfile={profile}
      />

      {/* ── Available Tasks Feed ── */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Sora, sans-serif', color: 'var(--hj-ink)' }}>
          Active Neighborhood Tasks ({tasks.length})
        </h2>
        <span className="text-xs font-mono text-[#1CA89C]">⚡ Real-time Dispatch</span>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          title="No open tasks in radar right now"
          subtitle="Stay online — we will notify you the moment a neighbor posts a task near you."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <OpportunityCard
              key={task._id || task.id}
              task={task}
              onAccept={handleAccept}
              accepted={!!accepted[task._id || task.id]}
              accepting={acceptingId === (task._id || task.id)}
            />
          ))}
        </div>
      )}

      {/* Onboarding Guide Modal */}
      {showGuide && (
        <OnboardingGuide
          role="helper"
          onDismiss={() => setShowGuide(false)}
        />
      )}
    </div>
  );
}
