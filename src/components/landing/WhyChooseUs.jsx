import { motion } from 'framer-motion';
import { ShieldCheck, Clock3, MapPin, Wallet, MessageCircle, Star } from 'lucide-react';

const features = [
  { icon: ShieldCheck, title: 'Verified helpers', desc: 'ID checked, background verified before they ever reach your door.' },
  { icon: Clock3, title: 'Fast matching', desc: 'Most tasks find a nearby helper in under 20 minutes.' },
  { icon: MapPin, title: 'Truly hyperlocal', desc: 'Helpers from your own neighbourhood, not a random city-wide pool.' },
  { icon: Wallet, title: 'Fair, upfront pricing', desc: 'You set the budget when you post — no surprise charges later.' },
  { icon: MessageCircle, title: 'In-app chat & tracking', desc: 'Talk to your helper directly and track task status live.' },
  { icon: Star, title: 'Rated by your community', desc: 'Every helper is rated by real neighbours after every task.' },
];

export default function WhyChooseUs() {
  return (
    <section id="about" className="bg-ink py-20">
      <div className="max-w-7xl mx-auto px-5 lg:px-10">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-mono uppercase tracking-wide text-marigold font-semibold">
            Why HelpJi
          </span>
          <h2 className="font-display text-[32px] font-bold text-white mt-1.5">
            Built for trust, not just convenience.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <div className="w-11 h-11 rounded-xl bg-marigold/15 flex items-center justify-center mb-4">
                <f.icon size={20} className="text-marigold" />
              </div>
              <h3 className="font-semibold text-white text-[15px] mb-1.5">{f.title}</h3>
              <p className="text-indigo-200/70 text-[13.5px] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
