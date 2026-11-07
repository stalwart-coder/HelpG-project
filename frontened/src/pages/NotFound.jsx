import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[440px] text-center animate-fade-in-up">
        <div className="text-7xl mb-6 font-display font-bold text-ink/10">404</div>
        <h1 className="font-display text-[28px] font-bold text-ink mb-2">
          {t('pageNotFound') || 'Page not found'}
        </h1>
        <p className="text-ink-soft text-[14px] mb-8 leading-relaxed">
          {t('pageNotFoundSub') || 'This page does not exist or has been moved.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-ink text-white px-6 py-3.5 rounded-xl font-bold text-[14.5px] shadow-lift hover:bg-ink/90 transition-all"
        >
          {t('goHome') || 'Go to home'}
        </Link>
      </div>
    </div>
  );
}

