import { motion } from 'framer-motion';

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
            whileHover={{ y: -4 }}
            onClick={() => onSelectService?.(item.serviceId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectService?.(item.serviceId);
              }
            }}
            role="button"
            tabIndex={0}
            className={`cursor-pointer rounded-2xl p-6 h-56 flex flex-col justify-between text-left ${item.bg} ${item.text} shadow-card hover:shadow-lift transition-shadow`}
          >
            <span className={`self-start text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${item.tagColor}`}>
              {item.tag}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold mb-1">{item.title}</h3>
              <p className={`text-sm mb-4 ${item.text === 'text-white' ? 'text-indigo-200' : 'text-ink-soft'}`}>
                {item.sub}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectService?.(item.serviceId);
                }}
                className={`text-xs font-semibold px-4 py-2 rounded-full ${
                  item.text === 'text-white' ? 'bg-marigold text-ink' : 'bg-ink text-white'
                }`}
              >
                Explore
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
