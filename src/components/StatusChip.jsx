import { useLanguage } from '../i18n/LanguageContext';

export default function StatusChip({ status }) {
  const { t } = useLanguage();
  const styles = {
    open: 'bg-emerald-50 text-banyan',
    progress: 'bg-amber-50 text-marigold-deep',
    done: 'bg-gray-100 text-ink-soft',
  };
  const labels = {
    open: t('statusOpen'),
    progress: t('statusProgress'),
    done: t('statusDone'),
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all duration-300 ${styles[status]} ${status === 'progress' ? 'ring-2 ring-marigold/20 animate-pulse' : ''}`}>
      {labels[status]}
    </span>
  );
}
