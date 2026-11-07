import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What areas does HelpJi currently serve?',
    a: 'We\'re currently live in select neighbourhoods of Jaipur, starting hyperlocal so match times stay fast. We\'re expanding to more areas as our helper network grows.',
  },
  {
    q: 'How are helpers verified?',
    a: 'Every helper goes through phone verification at signup. Helpers for higher-trust categories like temporary guard duty also complete ID verification before they can accept tasks.',
  },
  {
    q: 'How is pricing decided?',
    a: 'You set the budget when posting a task. Helpers nearby who accept your price get matched — there\'s no hidden commission added after the fact.',
  },
  {
    q: 'What if something goes wrong during a task?',
    a: 'Every task has an in-app Emergency/Report button on the tracking screen, and our support team responds to disputes directly.',
  },
  {
    q: 'Can I become a helper if I only have a few hours free?',
    a: 'Yes — the availability toggle lets you go online only when you have time, and tasks are matched to your set service radius.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="max-w-3xl mx-auto px-5 lg:px-10 py-20">
      <div className="text-center mb-10">
        <span className="text-xs font-mono uppercase tracking-wide text-marigold-deep font-semibold">FAQ</span>
        <h2 className="font-display text-[30px] font-bold text-ink mt-1.5">Common questions</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={i} className="bg-paper-card border border-line rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-[14.5px] text-ink pr-4">{f.q}</span>
              <motion.span animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={18} className="text-ink-soft shrink-0" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-4 text-[13.5px] text-ink-soft leading-relaxed">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
