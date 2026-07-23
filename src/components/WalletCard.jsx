export default function WalletCard({ label, amount, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  return (
    <div className="bg-gradient-to-br from-ink to-[#2A3660] text-white rounded-2xl p-5 mb-5 relative overflow-hidden group transition-shadow duration-300 hover:shadow-lift-lg">
      <div className="absolute -right-8 -top-8 w-[120px] h-[120px] rounded-full bg-marigold/15 group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-white/5 group-hover:scale-125 transition-transform duration-500" />
      <div className="text-[11px] text-indigo-200/80 font-mono relative z-10">{label}</div>
      <div className="text-[30px] font-bold font-display my-1.5 relative z-10">₹{amount}</div>
      <div className="flex gap-2.5 relative z-10">
        <button
          type="button"
          onClick={onPrimary}
          disabled={!onPrimary}
          className="flex-1 py-2.5 rounded-lg font-semibold text-[13px] bg-marigold text-ink hover:bg-marigold-deep hover:text-white transition-all duration-200 active:scale-[.97] hover:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={onSecondary}
          disabled={!onSecondary}
          className="flex-1 py-2.5 rounded-lg font-semibold text-[13px] bg-white/10 text-white hover:bg-white/20 transition-all duration-200 active:scale-[.97] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}
