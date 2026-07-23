import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Malviya Nagar',
    initials: 'PS',
    text: 'Needed a guard for two days while we went to a wedding out of town. Found someone within the hour — genuinely relieved.',
    rating: 5,
  },
  {
    name: 'Arjun Mehta',
    role: 'Vaishali Nagar',
    initials: 'AM',
    text: 'Ironing service has been a weekly saviour. The helper is punctual and the app makes tracking dead simple.',
    rating: 5,
  },
  {
    name: 'Sunita Rathore',
    role: 'C-Scheme',
    initials: 'SR',
    text: "Booked event cleaning staff for my daughter's sangeet. Professional, on time, and the pricing was upfront — no haggling.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 py-20">
      <div className="mb-10">
        <span className="text-xs font-mono uppercase tracking-wide text-marigold-deep font-semibold">
          Community voices
        </span>
        <h2 className="font-display text-[32px] font-bold text-ink mt-1.5">What Jaipur is saying</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-paper-card border border-line rounded-2xl p-6 shadow-card relative"
          >
            <Quote size={26} className="text-marigold/40 mb-3" />
            <p className="text-[14px] text-ink leading-relaxed mb-5">{t.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ink text-marigold flex items-center justify-center font-bold font-display text-sm">
                {t.initials}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-ink">{t.name}</div>
                <div className="text-xs text-ink-soft">{t.role}</div>
              </div>
              <div className="flex gap-0.5 text-marigold-deep">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star key={idx} size={12} fill="currentColor" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
