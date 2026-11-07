import { useState, useEffect } from 'react';
import { ChevronLeft, Star, ThumbsUp, Flag, Calendar, Share2 } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { EmptyState, SkeletonPage } from '../../components/ui/PageState';
import { getBookingById } from '../../utils/bookingApi';
import { SERVICES, SERVICE_LABELS } from '../../config/services';

export default function ReviewDetail({ reviewId, onBack }) {
  const { lang } = useLanguage();
  const [status, setStatus] = useState('loading');
  const [review, setReview] = useState(null);
  const [cat, setCat] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus('loading');
      if (reviewId) {
        try {
          const booking = await getBookingById(reviewId);
          if (!cancelled && booking) {
            setCat(booking.category);
            setReview({
              id: booking._id,
              name: booking.customer?.name || 'Verified Customer',
              initials: (booking.customer?.name || 'VC').slice(0, 2).toUpperCase(),
              rating: booking.rating || 5,
              date: new Date(booking.createdAt).toLocaleDateString(),
              helpful: 12,
              title: booking.title || 'Verified Service Experience',
              body: booking.notes || booking.description || 'Service completed successfully.',
            });
            setStatus('ready');
            return;
          }
        } catch {
          // not found
        }
      }
      if (!cancelled) {
        setStatus('empty');
      }
    })();
    return () => { cancelled = true; };
  }, [reviewId]);

  if (status === 'loading') return <SkeletonPage />;

  if (!review) {
    return (
      <div className="p-5">
        <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
          <ChevronLeft size={16} /> Back
        </button>
        <EmptyState title="Review not found" subtitle="This review may have been removed." />
      </div>
    );
  }

  return (
    <div className="p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-ink-soft text-sm mb-4">
        <ChevronLeft size={16} /> Back
      </button>

      <div className="bg-paper-card border border-line rounded-2xl p-5 shadow-card mb-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-line">
          <div className="w-12 h-12 rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display text-base">
            {review.initials}
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-ink">{review.name}</div>
            <div className="flex items-center gap-2 text-xs text-ink-soft mt-0.5">
              <Calendar size={12} /> {review.date}
              {label && <><span className="w-1 h-1 rounded-full bg-line" />{label}</>}
            </div>
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill={i < review.rating ? '#C67E1F' : '#D9D9D2'} className={i < review.rating ? 'text-marigold-deep' : 'text-line'} />
            ))}
          </div>
        </div>

        <p className="text-[14px] text-ink leading-relaxed mb-4">{review.text}</p>

        {review.tags && review.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {review.tags.map((tag) => (
              <span key={tag} className="bg-banyan/5 text-banyan text-[11px] font-medium px-2.5 py-1 rounded-full border border-banyan/10">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-line">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? 'text-marigold-deep' : 'text-ink-soft hover:text-ink'}`}
          >
            <ThumbsUp size={15} fill={liked ? '#C67E1F' : 'none'} /> {liked ? review.liked + 1 : review.liked}
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink transition-colors">
            <Share2 size={15} /> Share
          </button>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-brick transition-colors ml-auto">
            <Flag size={15} /> Report
          </button>
        </div>
      </div>
    </div>
  );
}

