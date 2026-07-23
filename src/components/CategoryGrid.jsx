import { useLanguage } from '../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS, SERVICE_DESCS } from '../config/services';

export default function CategoryGrid({ onSelect }) {
  const { lang } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3 mb-7">
      {SERVICES.map((s) => (
        <div
          key={s.id}
          onClick={() => onSelect(s.id)}
          className="bg-paper-card border border-line rounded-card p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-marigold/20 group"
        >
          <div className="text-[34px] mb-2.5">{s.icon}</div>
          <h3 className="text-[14.5px] font-semibold mb-1">{SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}</h3>
          <p className="text-xs text-ink-soft m-0">{SERVICE_DESCS[lang]?.[s.id] ?? SERVICE_DESCS.en[s.id]}</p>
        </div>
      ))}
    </div>
  );
}
