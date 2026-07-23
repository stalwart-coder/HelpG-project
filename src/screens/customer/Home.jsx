import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import CategoryGrid from '../../components/CategoryGrid';
import TrustStrip from '../../components/TrustStrip';
import PinCard from '../../components/PinCard';
import BoardFilters from '../../components/BoardFilters';
import { boardTasks, LOCALITIES } from '../../data/mockData';
import { SERVICES, SERVICE_LABELS } from '../../config/services';

import { EmptyState, ErrorState, LoadingState, SuccessState, SkeletonPage, SkeletonPinCard, SkeletonCategoryGrid } from '../../components/ui/PageState';


export default function CustomerHome({ goServiceDetail, goPost, goDetail }) {
  const { t, lang } = useLanguage();


  const [status, setStatus] = useState('loading'); // loading|ready|error
  const [errorMsg, setErrorMsg] = useState('');
  const [action, setAction] = useState(null); // 'post' | null
  const [loadAttempt, setLoadAttempt] = useState(0);

  const board = useMemo(() => boardTasks, []);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minPrice: null,
    maxPrice: null,
    minRating: null,
    location: 'all',
    availability: 'all',
    sortBy: 'relevance',
  });

  const filtered = useMemo(() => {
    const q = (filters.search || '').toLowerCase();

    let list = board;

    // availability (status)
    if (filters.availability === 'open') {
      list = list.filter((t) => t.status === 'open');
    }

    // category
    if (filters.category && filters.category !== 'all') {
      list = list.filter((t) => t.cat === filters.category);
    }

    // price
    if (filters.minPrice != null) {
      list = list.filter((t) => Number(t.price) >= filters.minPrice);
    }
    if (filters.maxPrice != null) {
      list = list.filter((t) => Number(t.price) <= filters.maxPrice);
    }

    // rating
    if (filters.minRating != null) {
      list = list.filter((t) => Number(t.customer?.rating) >= filters.minRating);
    }

    // location
    if (filters.location && filters.location !== 'all') {
      list = list.filter((t) => (t.location || '').toLowerCase() === String(filters.location).toLowerCase());
    }

    // search
    if (q) {
      list = list.filter((t) => {
        const hay = [
          t.title,
          t.location,
          t.when,
          t.id,
          t.customer?.name,
          t.cat,
          SERVICE_LABELS.en?.[t.cat],
          SERVICE_LABELS[lang]?.[t.cat],
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      });
    }

    // sorting
    const sorted = [...list];
    switch (filters.sortBy) {
      case 'distanceAsc':
        sorted.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
        break;
      case 'priceAsc':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'priceDesc':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'ratingDesc':
        sorted.sort((a, b) => Number(b.customer?.rating) - Number(a.customer?.rating));
        break;
      case 'relevance':
      default:
        // relevance heuristic: open tasks + closer distance + higher rating
        sorted.sort((a, b) => {
          const ar = (a.status === 'open' ? 1000 : 0) + (100 - (a.distanceKm ?? 9) * 10) + Number(a.customer?.rating || 0) * 20;
          const br = (b.status === 'open' ? 1000 : 0) + (100 - (b.distanceKm ?? 9) * 10) + Number(b.customer?.rating || 0) * 20;
          return br - ar;
        });
        break;
    }

    return sorted;
  }, [board, filters, lang]);

  const top3 = filtered.slice(0, 3);


  useEffect(() => {
    const tid = setTimeout(() => {
      const shouldError = Math.random() < 0.04;
      if (shouldError) {
        setStatus('error');
        setErrorMsg('Couldn’t load today’s help requests.');
      } else {
        setStatus('ready');
      }
    }, 650);
    return () => clearTimeout(tid);
  }, [loadAttempt]);

  const handlePost = () => {
    setAction('post');
    setTimeout(() => {
      setAction(null);
      goPost(null);
    }, 650);
  };

  if (status === 'loading') {
    return (
      <div className="p-5">
        <SkeletonPage />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="p-5">
        <div className="mb-7">
          <h1 className="text-[26px] leading-snug font-display font-semibold mb-2">{t('heroCustomerTitle')}</h1>
          <p className="text-ink-soft text-[14.5px] mb-4 leading-relaxed">{t('heroCustomerSub')}</p>
        </div>
        <ErrorState
          title="Something went wrong"
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

  const hasBoard = top3.length > 0;

  return (
    <div className="p-5">
      {action === 'post' && (
        <SuccessState
          title="Starting your request"
          subtitle="Tell us what you need — we’ll show matching helpers." 
        />
      )}

      <div className="mb-7">
        <h1 className="text-[26px] leading-snug font-display font-semibold mb-2">{t('heroCustomerTitle')}</h1>
        <p className="text-ink-soft text-[14.5px] mb-4 leading-relaxed">{t('heroCustomerSub')}</p>
        <button
          onClick={handlePost}
          className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 rounded-[10px] font-semibold text-[14.5px] shadow-card active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={action === 'post'}
        >
          {t('postTaskCta')}
        </button>
      </div>

      <div className="section-label text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        {t('categoriesLabel')}
      </div>

      <CategoryGrid onSelect={(id) => goServiceDetail(id)} />

      <TrustStrip />

      <div className="text-xs uppercase tracking-wide text-ink-soft font-semibold mb-2.5 font-mono">
        {t('boardLabel')}
      </div>

      <BoardFilters
        categories={SERVICES.map((s) => ({ id: s.id, label: SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id] }))}
        localities={LOCALITIES}
        onChange={(next) => setFilters(next)}
      />

      {!hasBoard ? (
        <EmptyState
          title="No active requests right now"
          subtitle="Try again in a few minutes."
          cta={
            <button
              onClick={goPost ? () => goPost(null) : undefined}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              {t('postTaskCta')}
            </button>
          }
        />
      ) : top3.length === 0 ? (
        <EmptyState
          title="No matches"
          subtitle="Try adjusting filters (price, rating, location, availability)."
          cta={
            <button
              onClick={() => {
                setFilters({
                  search: '',
                  category: 'all',
                  minPrice: null,
                  maxPrice: null,
                  minRating: null,
                  location: 'all',
                  availability: 'all',
                  sortBy: 'relevance',
                });
              }}
              className="mt-4 bg-ink text-white px-5 py-3 rounded-lg font-semibold text-sm"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div>
          {top3.map((task) => (
            <PinCard
              key={task.id}
              task={task}
              actionLabel="View"
              onAction={() => goDetail?.(task)}
              onCardClick={() => goDetail?.(task)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
