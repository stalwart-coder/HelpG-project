import { useLanguage } from '../i18n/LanguageContext';
import { trustStats } from '../data/mockData';

export default function TrustStrip() {
  const { t } = useLanguage();
  const items = [
    { num: trustStats.tasksDone, lbl: t('trustTasksDone') },
    { num: trustStats.avgRating, lbl: t('trustAvgRating') },
    { num: trustStats.avgMatchTime, lbl: t('trustMatchTime') },
  ];
  return (
    <div className="flex justify-between bg-ink rounded-card p-4 mb-7">
      {items.map((item, i) => (
        <div key={i} className="text-center flex-1 text-white">
          <div className="font-display text-[19px] font-bold text-marigold">{item.num}</div>
          <div className="text-[10px] text-indigo-200/80 mt-0.5">{item.lbl}</div>
        </div>
      ))}
    </div>
  );
}
