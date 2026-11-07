import { motion } from 'framer-motion';
import TiltCard3D from '../3d/TiltCard3D';

const spotlight = [
  {
    tag: 'Trending',
    tagColor: 'bg-brick text-white',
    title: 'Weekend guard duty',
    sub: 'Going out of town? Book 1-2 day security',
    bg: 'bg-gradient-to-br from-ink to-[#2A3660]',
    text: 'text-white',
    serviceId: 'guard',
  },
  {
    tag: 'Popular',
    tagColor: 'bg-banyan text-white',
    title: 'Ironing, same day',
    sub: 'Post before 2 PM, done by evening',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    text: 'text-ink',
    serviceId: 'iron',
  },
  {
    tag: 'Season',
    tagColor: 'bg-marigold text-ink',
    title: 'Wedding season staff',
    sub: 'Cooks & cleaning crew, book early',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    text: 'text-ink',
    serviceId: 'event',
  },
];

export default function Spotlight({ onSelectService }) {
  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 pb-20">
      <h2 className="font-display text-[26px] font-bold text-ink mb-7">In the spotlight</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {spotlight.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <TiltCard3D maxTilt={15} scale={1.03} onClick={() => onSelectService?.(item.serviceId)}>
              <div
                className={`cursor-pointer rounded-2xl p-6 h-56 flex flex-col justify-between text-left ${item.bg} ${item.text} shadow-card hover:shadow-lift transition-all`}
              >
                <span className={`self-start text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${item.tagColor}`}>
                  {item.tag}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold mb-1 leading-snug">{item.title}</h3>
                  <p className={`text-xs mb-3 ${item.text === 'text-white' ? 'text-indigo-200/80' : 'text-ink-soft'}`}>
                    {item.sub}
                  </p>
                  <span
                    className={`inline-block text-[11px] font-bold font-mono px-3 py-1 rounded-full ${
                      item.text === 'text-white' ? 'bg-marigold text-ink' : 'bg-ink text-white'
                    }`}
                  >
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </TiltCard3D>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
