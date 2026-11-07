import { AlertTriangle, CheckCircle2, Loader2, SearchX, Star, MapPin, Clock } from 'lucide-react';

export function LoadingState({ title = 'Loading…', subtitle = 'Please wait a moment.' }) {
  return (
    <div className="p-5">
      <div className="bg-paper-card border border-line rounded-card p-6 shadow-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-marigold/10 text-marigold-deep flex items-center justify-center">
          <Loader2 className="animate-spin" size={18} />
        </div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-ink-soft mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title = 'Nothing here yet',
  subtitle = 'Try again later.',
  cta,
  actionLabel,
  onAction,
}) {
  return (
    <div className="p-5">
      <div className="bg-paper-card border border-line rounded-card p-6 shadow-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-line/50 text-ink-soft flex items-center justify-center text-lg">
          {icon || <SearchX size={18} />}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-ink-soft mt-1">{subtitle}</div>
          {cta}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', subtitle = 'Please try again.', onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="p-5">
      <div className="bg-paper-card border border-line rounded-card p-6 shadow-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-ink-soft mt-1">{subtitle}</div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 bg-ink text-white px-4 py-2 rounded-lg font-semibold text-sm"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function SuccessState({ title = 'Saved successfully', subtitle = 'You can continue now.', onContinue }) {
  return (
    <div className="p-5">
      <div className="bg-paper-card border border-line rounded-card p-6 shadow-card flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-banyan flex items-center justify-center">
          <CheckCircle2 size={18} />
        </div>
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-ink-soft mt-1">{subtitle}</div>
          {onContinue && (
            <button
              onClick={onContinue}
              className="mt-4 bg-marigold text-ink px-4 py-2 rounded-lg font-semibold text-sm"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton components ──────────────────────────────────────────────────────

/** Single skeleton element with pulse */
function Skeleton({ className = '' }) {
  return <div className={`bg-line/60 rounded-md animate-skeleton-pulse ${className}`} />;
}

/** A skeleton card matching PinCard shape */
export function SkeletonPinCard() {
  return (
    <div className="bg-white border border-line rounded-2xl p-4 mb-3.5 shadow-card animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <Skeleton className="h-5 w-24 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <div className="flex gap-3.5 mb-3.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-line/70">
        <div>
          <Skeleton className="h-3 w-10 mb-1" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>
    </div>
  );
}

/** Skeleton grid for categories */
export function SkeletonCategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 mb-7">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-paper-card border border-line rounded-card p-4">
          <Skeleton className="h-8 w-8 rounded-lg mb-2.5" />
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton wallet card */
export function SkeletonWalletCard() {
  return (
    <div className="bg-gradient-to-br from-ink/80 to-[#2A3660]/80 rounded-2xl p-5 mb-5">
      <Skeleton className="h-3 w-24 mb-3 bg-white/20" />
      <Skeleton className="h-8 w-32 mb-4 bg-white/20" />
      <div className="flex gap-2.5">
        <Skeleton className="h-12 flex-1 rounded-lg bg-white/20" />
        <Skeleton className="h-12 flex-1 rounded-lg bg-white/20" />
      </div>
    </div>
  );
}

/** Full page skeleton for loading states */
export function SkeletonPage() {
  return (
    <div className="p-5 animate-fade-in">
      <Skeleton className="h-7 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <SkeletonCategoryGrid />
      <Skeleton className="h-20 rounded-card mb-6" />
      <Skeleton className="h-5 w-32 mb-3" />
      <SkeletonPinCard />
      <SkeletonPinCard />
      <SkeletonPinCard />
    </div>
  );
}

/** Skeleton for task details */
export function SkeletonTaskDetail() {
  return (
    <div className="p-5 animate-fade-in">
      <Skeleton className="h-4 w-16 mb-4" />
      <Skeleton className="h-6 w-48 mb-1" />
      <Skeleton className="h-3 w-36 mb-4" />
      <div className="bg-paper-card border border-line rounded-card p-3.5 mb-5 shadow-card">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-4 w-24 mb-3" />
      <div className="space-y-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <div>
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

