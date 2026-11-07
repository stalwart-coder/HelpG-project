import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Star, Loader2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICE_LABELS } from '../../config/services';
import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonPage } from '../../components/ui/PageState';
import { createReview } from '../../utils/reviewApi';

function clampStr(s, maxLen) {
  const v = (s ?? '').toString();
  return v.length > maxLen ? v.slice(0, maxLen) : v;
}

export default function RateTask({ task, onSubmitted, onBack }) {
  const { lang } = useLanguage();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState('');

  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [loadStatus, setLoadStatus] = useState('loading'); // loading | ready
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRating, setSubmittedRating] = useState(null);

  const label = useMemo(() => {
    if (!task) return '';
    return SERVICE_LABELS[lang]?.[task.cat] ?? SERVICE_LABELS.en[task.cat];
  }, [lang, task]);

  const reviewTrim = review.trim();
  const reviewError =
    reviewTrim.length > 280 ? 'Review must be under 280 characters.' : '';

  const canSubmit = rating > 0 && status !== 'loading' && !reviewError;

  // Task loads instantly from props — no fake timeout needed
  useEffect(() => {
    if (task) setLoadStatus('ready');
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task || !canSubmit) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const bookingId = task.id || task._id || task.bookingId;
      await createReview({
        bookingId,
        rating,
        comment: reviewTrim,
      });
      setSubmittedRating({ taskId: bookingId, rating, review: reviewTrim });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to submit rating. Please try again.');
    }
  };

  const resetForm = () => {
    setRating(0);
    setReview('');
    setStatus('idle');
    setErrorMsg('');
  };

  if (loadStatus === 'loading') {
    return <SkeletonPage />;
  }

  if (!task) {
    return (
      <EmptyState
        title="No completed task selected"
        subtitle="Return to My Tasks and choose a completed job to rate."
        cta={
          onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              Back to tasks
            </button>
          ) : null
        }
      />
    );
  }

  if (status === 'success') {
    return (
      <SuccessState
        title="Thanks for your feedback!"
        subtitle="Your rating helps our community of helpers."
        onContinue={() => {
          if (onSubmitted) onSubmitted(submittedRating);
          else onBack?.();
        }}
      />
    );
  }

  if (status === 'error') {
    return <ErrorState title="Submission failed" subtitle={errorMsg} onRetry={handleSubmit} />;
  }

  return (
    <div className="p-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-ink-soft text-sm mb-4"
        disabled={status === 'loading'}
      >
        <ChevronLeft size={16} /> Back
      </button>

      <h2 className="text-lg font-display font-semibold mb-1">Rate this task</h2>
      <p className="text-ink-soft text-sm mb-6">
        {label} · #{task.id}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-paper-card border border-line rounded-card p-5 shadow-card mb-4">
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-line">
            <div className="w-11 h-11 rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display text-sm flex-shrink-0">
              {task.helper ? task.helper.split(' ').map((w) => w[0]).join('').slice(0, 2) : 'HJ'}
            </div>
            <div>
              <div className="text-[14px] font-semibold">{task.helper || 'Your helper'}</div>
              <div className="text-xs text-ink-soft">{task.when}</div>
            </div>
          </div>

          <fieldset className="mb-5">
            <legend className="text-sm font-semibold text-ink-soft mb-3 text-center block w-full">
              How was the service?
            </legend>

            <div className="flex justify-center gap-3 mb-3" role="radiogroup" aria-label="Rating stars">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hovered || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    disabled={status === 'loading'}
                    className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-60"
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    aria-pressed={active}
                  >
                    <Star
                      size={36}
                      className={
                        active
                          ? 'text-marigold-deep fill-marigold-deep'
                          : 'text-line fill-line'
                      }
                    />
                  </button>
                );
              })}
            </div>

            {rating > 0 && (
              <div className="text-center text-sm text-ink-soft">
                {['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'][rating]}
              </div>
            )}
          </fieldset>

          <label htmlFor="rate-review" className="block text-xs font-semibold text-ink-soft mb-1.5">
            Add a note for your helper <span className="font-normal text-ink-soft/70">(optional)</span>
          </label>
          <textarea
            id="rate-review"
            value={review}
            onChange={(e) => setReview(clampStr(e.target.value, 280))}
            placeholder="Let your helper know what went well or what could improve..."
            className="w-full px-3 py-2.5 border border-line rounded-lg text-sm bg-white text-ink focus:outline-none focus:ring-2 focus:ring-marigold/40 h-20 resize-none disabled:opacity-60"
            disabled={status === 'loading'}
            aria-invalid={!!reviewError}
            aria-describedby="rate-review-error rate-review-chars"
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <div id="rate-review-error">
              {reviewError && (
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle size={14} /> {reviewError}
                </span>
              )}
            </div>
            <div id="rate-review-chars" className={`font-semibold ${reviewTrim.length > 260 ? 'text-rose-600' : 'text-ink-soft'}`}>
              {reviewTrim.length}/280
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-marigold text-ink py-3.5 rounded-[10px] font-bold text-[14.5px] shadow-card disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting…
              </>
            ) : (
              'Submit rating'
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={resetForm}
          disabled={status === 'loading'}
          className="mt-3 w-full border border-line rounded-[10px] py-3.5 font-semibold text-[14px] text-ink-soft hover:bg-paper-card transition-colors disabled:opacity-40"
        >
          Reset
        </button>
      </form>
    </div>
  );
}
