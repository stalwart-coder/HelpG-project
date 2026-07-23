export default function Timeline({ steps }) {
  return (
    <div className="relative pl-[22px] my-4.5">
      <div className="absolute left-[6px] top-1 bottom-1 w-0.5 bg-line/60" />
      {steps.map((step, i) => (
        <div key={i} className="relative mb-4 animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
          <div
            className={`absolute -left-[22px] top-0.5 w-3 h-3 rounded-full border-2 border-paper-card transition-all duration-500 ${
              step.state === 'done'
                ? 'bg-banyan scale-100'
                : step.state === 'current'
                ? 'bg-marigold shadow-[0_0_0_4px_rgba(232,162,61,0.25)] scale-110'
                : 'bg-line/60 scale-90'
            }`}
          />
          <h4 className="text-[13.5px] font-semibold mb-0.5">{step.label}</h4>
          <p className="text-xs text-ink-soft m-0">{step.time || '—'}</p>
        </div>
      ))}
    </div>
  );
}
