export default function TxnRow({ title, date, amount }) {
  const positive = amount > 0;
  return (
    <div className="flex justify-between items-center py-3 border-b border-line last:border-b-0 transition-colors duration-200 hover:bg-paper/40 px-2 -mx-2 rounded-lg group">
      <div>
        <h4 className="text-[13.5px] font-semibold mb-0.5 group-hover:text-ink transition-colors">{title}</h4>
        <p className="text-[11.5px] text-ink-soft m-0">{date}</p>
      </div>
      <div className={`font-mono font-semibold text-[13.5px] transition-transform duration-200 group-hover:scale-105 ${positive ? 'text-banyan' : 'text-brick'}`}>
        {positive ? '+' : ''}₹{Math.abs(amount)}
      </div>
    </div>
  );
}
