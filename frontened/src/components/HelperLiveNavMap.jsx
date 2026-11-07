import { useState, useEffect } from 'react';
import {
  Navigation, MapPin, Phone, MessageSquare, ExternalLink,
  CheckCircle2, Clock, AlertTriangle, Compass, ShieldCheck
} from 'lucide-react';

export default function HelperLiveNavMap({
  booking = {
    id: 'HJ-9821',
    title: 'Steam Ironing (15 garments)',
    location: 'Flat 402, Green Glen Layout, Koramangala 4th Block',
    customer: { name: 'Aarav Sharma', phone: '9876543210', rating: 4.8 },
  },
  onArrived,
  onChat,
}) {
  const [progress, setProgress] = useState(0.2);
  const [etaMins, setEtaMins] = useState(3);
  const [distanceMeters, setDistanceMeters] = useState(480);
  const [turnInstruction, setTurnInstruction] = useState('In 150m, turn right onto 80 Feet Road');
  const [hasArrived, setHasArrived] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 0.95) {
          setHasArrived(true);
          setEtaMins(0);
          setDistanceMeters(0);
          setTurnInstruction('Destination reached on your left: Flat 402');
          return 1;
        }
        const next = prev + 0.05;
        const remaining = Math.max(0, Math.round(500 * (1 - next)));
        setDistanceMeters(remaining);
        setEtaMins(Math.max(1, Math.round(3 * (1 - next))));
        if (next > 0.6) {
          setTurnInstruction('In 80m, destination will be on your left');
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const startX = 60, startY = 60;
  const endX = 360, endY = 220;
  const currentX = startX + (endX - startX) * progress;
  const currentY = startY + (endY - startY) * progress + Math.sin(progress * Math.PI) * -30;

  const customerName = booking.customer?.name || 'Aarav Sharma';
  const customerPhone = booking.customer?.phone || '9876543210';
  const customerAddress = booking.location || 'Flat 402, Koramangala 4th Block, Bengaluru';

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customerAddress)}`;

  return (
    <div
      className="rounded-3xl overflow-hidden mb-6 shadow-raised transition-all"
      style={{
        background: 'var(--hj-paper-card)',
        border: '1.5px solid var(--hj-line)',
      }}
    >
      {/* ── Turn-By-Turn Navigation Top Banner ── */}
      <div
        className="p-4 sm:p-5 flex items-center justify-between gap-3 text-white"
        style={{ background: hasArrived ? '#22A355' : '#1CA89C' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black/20 backdrop-blur-md flex items-center justify-center shrink-0">
            <Compass size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider font-bold opacity-80">
              {hasArrived ? '🎉 ARRIVED AT LOCATION' : 'TURN-BY-TURN GPS ROUTE'}
            </div>
            <div className="text-sm sm:text-base font-extrabold" style={{ fontFamily: 'Sora, sans-serif' }}>
              {turnInstruction}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg sm:text-xl font-black font-mono">
            {hasArrived ? '0m' : `${distanceMeters}m`}
          </div>
          <div className="text-[10px] font-mono opacity-80">
            {hasArrived ? 'At Doorstep' : `${etaMins} mins ETA`}
          </div>
        </div>
      </div>

      {/* ── Helper Live Map Visualizer ── */}
      <div className="relative w-full h-64 sm:h-72 bg-[#121624] overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 420 280" preserveAspectRatio="none">
          <defs>
            <linearGradient id="helperRoute" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1CA89C" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
          </defs>

          {/* Road Network */}
          <path d="M 0 40 Q 150 50 420 40" stroke="#1E2438" strokeWidth="18" fill="none" />
          <path d="M 0 160 Q 200 130 420 180" stroke="#1E2438" strokeWidth="22" fill="none" />
          <path d="M 80 0 L 120 280" stroke="#1E2438" strokeWidth="16" fill="none" />
          <path d="M 280 0 L 260 280" stroke="#1E2438" strokeWidth="20" fill="none" />

          {/* Buildings */}
          <rect x="20" y="80" width="45" height="60" rx="6" fill="#181D30" />
          <rect x="140" y="10" width="70" height="40" rx="6" fill="#181D30" />
          <rect x="140" y="170" width="90" height="55" rx="6" fill="#181D30" />
          <rect x="300" y="30" width="60" height="70" rx="6" fill="#181D30" />
          <rect x="290" y="140" width="55" height="65" rx="6" fill="#181D30" />

          {/* Green Park */}
          <path d="M 180 60 Q 240 70 230 110 Q 170 120 180 60 Z" fill="#142824" />

          {/* Active Navigation Polyline */}
          <path
            d="M 60 60 Q 200 110 360 220"
            stroke="url(#helperRoute)"
            strokeWidth="6"
            strokeDasharray="6 4"
            fill="none"
          />

          {/* Customer Destination Marker */}
          <g transform="translate(360, 220)">
            <circle r="18" fill="rgba(34,197,94,0.30)" className="animate-pulse" />
            <circle r="12" fill="#22C55E" />
            <circle r="4" fill="#FFFFFF" />
            <text x="-48" y="-18" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              📍 Customer Doorstep
            </text>
          </g>

          {/* Helper Scooter Marker */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            <circle r="20" fill="rgba(28,168,156,0.35)" className="animate-ping" />
            <circle r="14" fill="#1CA89C" />
            <text x="-5" y="4" fill="#FFFFFF" fontSize="11">🛵</text>
            <rect x="-35" y="-26" width="70" height="16" rx="5" fill="#1A1A2E" stroke="#1CA89C" strokeWidth="1" />
            <text x="-28" y="-14" fill="#1CA89C" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              You • {distanceMeters}m
            </text>
          </g>
        </svg>

        {/* External Google Maps Button */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md border border-white/20 shadow-lg cursor-pointer transition-all active:scale-95"
        >
          <ExternalLink size={13} className="text-emerald-400" />
          <span>Open in Google Maps</span>
        </a>
      </div>

      {/* ── Customer Details & Arrival CTA ── */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-sm" style={{ background: '#F4831F' }}>
              {customerName[0]}
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--hj-ink)' }}>
                {customerName}
              </div>
              <div className="text-xs text-[var(--hj-ink-soft)] truncate max-w-xs">
                {customerAddress}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onChat}
              className="p-2.5 rounded-xl border border-[var(--hj-line)] text-[var(--hj-ink)] bg-[var(--hj-paper-warm)] hover:bg-white/5 cursor-pointer"
              title="Chat with Customer"
            >
              <MessageSquare size={16} />
            </button>
            <a
              href={`tel:${customerPhone}`}
              className="p-2.5 rounded-xl text-white bg-[#1CA89C] shadow-sm flex items-center gap-1 text-xs font-bold"
            >
              <Phone size={14} />
              <span className="hidden sm:inline">Call</span>
            </a>
          </div>
        </div>

        {/* Big Arrival Button */}
        <button
          type="button"
          onClick={onArrived}
          className="w-full py-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          style={{ background: hasArrived ? '#22C55E' : '#1CA89C' }}
        >
          <CheckCircle2 size={18} />
          <span>I Have Arrived at Customer Doorstep</span>
        </button>
      </div>
    </div>
  );
}
