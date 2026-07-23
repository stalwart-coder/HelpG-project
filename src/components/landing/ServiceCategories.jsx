import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SERVICES, SERVICE_LABELS, SERVICE_DESCS } from '../../config/services';

const gradients = {
  iron: 'from-blue-50 to-blue-100/40',
  vehicle: 'from-emerald-50 to-emerald-100/40',
  guard: 'from-red-50 to-red-100/40',
  event: 'from-purple-50 to-purple-100/40',
};

const priceFrom = { iron: 149, vehicle: 199, guard: 799, event: 999 };

export default function ServiceCategories({ onSelect }) {
  const { lang } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 py-20">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-3">
        <div>
          <span className="text-xs font-mono uppercase tracking-wide text-marigold-deep font-semibold">
            Our services
          </span>
          <h2 className="font-display text-[32px] font-bold text-ink mt-1.5">What can we help with today?</h2>
        </div>
        <p className="text-ink-soft text-sm max-w-xs">
          Four focused categories, done properly — not everything under the sun.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            onClick={() => onSelect(s.id)}
            className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${gradients[s.id]} border border-line p-6 relative overflow-hidden transition-shadow hover:shadow-lift`}
          >
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={15} className="text-ink" />
            </div>
            <div className="text-4xl mb-6">{s.icon}</div>
            <h3 className="font-semibold text-ink text-[15.5px] mb-1">
              {SERVICE_LABELS[lang]?.[s.id] ?? SERVICE_LABELS.en[s.id]}
            </h3>
            <p className="text-xs text-ink-soft mb-4">
              {SERVICE_DESCS[lang]?.[s.id] ?? SERVICE_DESCS.en[s.id]}
            </p>
            <div className="text-xs font-mono font-semibold text-ink-soft">
              From <span className="text-ink">₹{priceFrom[s.id]}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
