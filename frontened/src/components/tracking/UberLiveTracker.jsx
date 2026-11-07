import { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageSquare,
  ShieldCheck,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Share2,
  ChevronUp,
  ChevronDown,
  X,
  Compass,
  Volume2,
  Layers,
  LocateFixed,
} from 'lucide-react';
import { joinBookingRoom, leaveBookingRoom, onBookingUpdate, onHelperLocation } from '../../utils/socket';
import { getNearbyHelpers } from '../../utils/helperApi';
import LiveTrackingMap from '../map/LiveTrackingMap';

export default function UberLiveTracker({
  booking,
  onClose,
  onOpenChat,
  onCancelBooking,
}) {
  const [currentBooking, setCurrentBooking] = useState(booking || {});
  const [helperCoords, setHelperCoords] = useState({ lat: 12.9352, lng: 77.6245 });
  const [customerCoords, setCustomerCoords] = useState({
    lat: booking?.coordinates?.coordinates?.[1] || 12.9320,
    lng: booking?.coordinates?.coordinates?.[0] || 77.6310,
  });
  const [etaMinutes, setEtaMinutes] = useState(6);
  const [distanceKm, setDistanceKm] = useState(1.4);
  const [isSearching, setIsSearching] = useState(booking?.status === 'pending' || !booking?.helper);
  const [partnerFound, setPartnerFound] = useState(booking?.status !== 'pending' && Boolean(booking?.helper));
  const [tripProgress, setTripProgress] = useState(
    booking?.status === 'in_progress' ? 0.75 : booking?.status === 'confirmed' ? 0.35 : 0.05
  );
  const [cardExpanded, setCardExpanded] = useState(true);
  const [safetyShared, setSafetyShared] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'radar'
  const [nearbyHelpers, setNearbyHelpers] = useState([]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const radarAngleRef = useRef(0);

  const bookingId = currentBooking._id || currentBooking.id;
  const helper = currentBooking.helper && typeof currentBooking.helper === 'object'
    ? currentBooking.helper
    : null;

  const otpCode = currentBooking.startOtp || currentBooking._id?.slice(-4).toUpperCase() || '4829';

  // ── Real Customer Geolocation ─────────────────────────────────────────────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // ── Fetch Real Nearby Helpers for Radar / Map ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getNearbyHelpers({
      lat: customerCoords.lat,
      lng: customerCoords.lng,
      category: currentBooking.category,
      radiusKm: 10,
    })
      .then((res) => {
        if (!cancelled && res?.helpers) {
          setNearbyHelpers(res.helpers);
          if (res.helpers.length > 0 && !helperCoords.lat) {
            setHelperCoords({ lat: res.helpers[0].lat, lng: res.helpers[0].lng });
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [customerCoords.lat, customerCoords.lng, currentBooking.category]);

  // ── Real-Time Socket Connection ───────────────────────────────────────────
  useEffect(() => {
    if (!bookingId) return;

    joinBookingRoom(bookingId);

    const unsubUpdate = onBookingUpdate((updated) => {
      if (updated._id === bookingId || updated.id === bookingId) {
        setCurrentBooking(updated);
        if (updated.status === 'confirmed' || updated.status === 'in_progress') {
          setIsSearching(false);
          setPartnerFound(true);
          if (updated.helper?.location?.coordinates) {
            setHelperCoords({
              lat: updated.helper.location.coordinates[1],
              lng: updated.helper.location.coordinates[0],
            });
          }
        }
      }
    });

    const unsubLocation = onHelperLocation((data) => {
      if (data.bookingId === bookingId && data.lat && data.lng) {
        setHelperCoords({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      unsubUpdate();
      unsubLocation();
      leaveBookingRoom(bookingId);
    };
  }, [bookingId]);

  // ── Live Movement & ETA Simulation ───────────────────────────────────────
  useEffect(() => {
    if (!partnerFound) return;

    const interval = setInterval(() => {
      setTripProgress((prev) => {
        const next = Math.min(prev + 0.04, 0.95);
        const remainingKm = Math.max(0.2, (1.2 * (1 - next))).toFixed(1);
        setDistanceKm(Number(remainingKm));
        setEtaMinutes(Math.max(1, Math.ceil(remainingKm * 3.5)));
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [partnerFound]);

  // ── Canvas Map & Radar Rendering ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let running = true;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Dark map background
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(0, 0, width, height);

      // Map Grid lines (streets)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1.5;
      const gridSize = 45;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Secondary angled roads
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.3);
      ctx.lineTo(width, height * 0.4);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.2, 0);
      ctx.lineTo(width * 0.6, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.7, 0);
      ctx.lineTo(width * 0.4, height);
      ctx.stroke();

      // Customer Location (Center-right)
      const custX = width * 0.7;
      const custY = height * 0.45;

      // Helper Start (Top-left)
      const startX = width * 0.25;
      const startY = height * 0.25;

      // Current Helper position along route
      const currentHelperX = startX + (custX - startX) * tripProgress;
      const currentHelperY = startY + (custY - startY) * tripProgress;

      // Route Polyline (Uber-style glowing blue/green line)
      if (partnerFound) {
        ctx.save();
        ctx.strokeStyle = '#10B981'; // emerald-500
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.shadowColor = 'rgba(16, 185, 129, 0.6)';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(currentHelperX, currentHelperY);
        ctx.lineTo(custX, custY);
        ctx.stroke();

        // Traveled route (dotted grey)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentHelperX, currentHelperY);
        ctx.stroke();
        ctx.restore();
      }

      // ── Radar Sweep Effect (Rapido / Uber Driver Search Mode) ──
      if (isSearching) {
        radarAngleRef.current += 0.035;
        const scanRadius = Math.min(width, height) * 0.42;

        // Concentric radar rings
        ctx.save();
        [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(custX, custY, scanRadius * ratio, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(244, 131, 31, ${0.4 - ratio * 0.25})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        });

        // Rotating radar cone beam
        const startAngle = radarAngleRef.current;
        const endAngle = startAngle + 0.65;
        const gradient = ctx.createRadialGradient(custX, custY, 0, custX, custY, scanRadius);
        gradient.addColorStop(0, 'rgba(244, 131, 31, 0.45)');
        gradient.addColorStop(1, 'rgba(244, 131, 31, 0.0)');

        ctx.beginPath();
        ctx.moveTo(custX, custY);
        ctx.arc(custX, custY, scanRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Nearby phantom driver dots searching
        [
          { x: custX - 70, y: custY - 40 },
          { x: custX + 85, y: custY - 60 },
          { x: custX - 50, y: custY + 80 },
        ].forEach((dot, idx) => {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#F4831F';
          ctx.shadowColor = '#F4831F';
          ctx.shadowBlur = 8;
          ctx.fill();

          // Pulse ring
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 8 + (Math.sin(Date.now() * 0.005 + idx) * 3), 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(244, 131, 31, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
        ctx.restore();
      }

      // ── Customer Marker (Destination / Pickup Pin) ──
      ctx.save();
      // Outer pulse
      const pulseSize = 18 + Math.sin(Date.now() * 0.004) * 4;
      ctx.beginPath();
      ctx.arc(custX, custY, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244, 131, 31, 0.25)';
      ctx.fill();

      // Pin core
      ctx.beginPath();
      ctx.arc(custX, custY, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#F4831F';
      ctx.shadowColor = '#F4831F';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(custX, custY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Label
      ctx.font = '600 11px Sora, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 4;
      ctx.fillText('Your Location', custX - 35, custY + 24);
      ctx.restore();

      // ── Helper / Driver Marker (Bike / Scooter Icon) ──
      if (partnerFound) {
        ctx.save();
        // Helper halo
        ctx.beginPath();
        ctx.arc(currentHelperX, currentHelperY, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
        ctx.fill();

        // Helper Circle
        ctx.beginPath();
        ctx.arc(currentHelperX, currentHelperY, 13, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981'; // emerald-500
        ctx.shadowColor = '#10B981';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Scooter symbol / center dot
        ctx.beginPath();
        ctx.arc(currentHelperX, currentHelperY, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Floating ETA Badge above helper
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.roundRect(currentHelperX - 26, currentHelperY - 32, 52, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = '#10B981';
        ctx.fillText(`${etaMinutes} MIN`, currentHelperX - 18, currentHelperY - 18);

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [partnerFound, isSearching, tripProgress, etaMinutes]);

  const handleShareSafety = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `HelpJi Live Tracking: ${booking?.title || 'Home Service'}`,
          text: `My verified partner ${helper.name} is arriving in ${etaMinutes} mins. Track live on HelpJi.`,
          url: window.location.href,
        })
        .catch(() => setSafetyShared(true));
    } else {
      setSafetyShared(true);
      setTimeout(() => setSafetyShared(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden animate-fade-in">
      {/* ── Top Bar Header ── */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-transparent backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg"
          aria-label="Close tracking"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{isSearching ? 'SEARCHING NEARBY PARTNERS' : 'LIVE UBER-TRACKING'}</span>
        </div>

        <button
          type="button"
          onClick={handleShareSafety}
          className="w-10 h-10 rounded-full bg-slate-900/80 border border-slate-700/60 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-800 cursor-pointer shadow-lg"
          title="Share live status"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Safety notification toast */}
      {safetyShared && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-2xl animate-fade-in">
          ✓ Live tracking link copied to clipboard!
        </div>
      )}

      {/* ── View Switcher: Map vs Radar ── */}
      <div className="absolute top-16 right-4 z-20 flex items-center bg-slate-900/90 border border-slate-700/60 rounded-xl p-1 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setViewMode('map')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'map'
              ? 'bg-[#1CA89C] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🗺️ Street Map
        </button>
        <button
          type="button"
          onClick={() => setViewMode('radar')}
          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
            viewMode === 'radar'
              ? 'bg-[#F4831F] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          📡 Sonar Radar
        </button>
      </div>

      {/* ── Main Viewport: Live Leaflet Map or Sonar Canvas ── */}
      <div className="relative flex-1 w-full h-full">
        {viewMode === 'map' ? (
          <div className="w-full h-full">
            <LiveTrackingMap
              customerLocation={customerCoords}
              helperLocation={
                partnerFound && helperCoords
                  ? {
                      lat: helperCoords.lat,
                      lng: helperCoords.lng,
                      name: helper?.name || 'Assigned Partner',
                      vehicle: helper?.serviceCategory || 'scooter',
                      heading: 45,
                    }
                  : null
              }
              nearbyHelpers={nearbyHelpers}
              taskStatus={currentBooking.status || 'pending'}
              height="100%"
              interactive={true}
            />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              width={window.innerWidth || 800}
              height={window.innerHeight || 900}
              className="w-full h-full object-cover"
            />
            {/* Center Target Compass Watermark */}
            <div className="absolute top-6 left-6 pointer-events-none opacity-20">
              <Compass size={60} className="animate-spin" style={{ animationDuration: '40s' }} />
            </div>
          </>
        )}
      </div>

      {/* ── Slide-up Bottom Card (Uber / Rapido Style) ── */}
      <div
        className={`relative z-20 w-full max-w-lg mx-auto bg-slate-900/95 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
          cardExpanded ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
        }`}
      >
        {/* Drag handle / collapse toggle */}
        <button
          type="button"
          onClick={() => setCardExpanded(!cardExpanded)}
          className="w-full flex justify-center pb-2 cursor-pointer text-slate-400 hover:text-white"
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-700 mb-1" />
        </button>

        {/* ── STATE 1: SEARCHING FOR PARTNER (RADAR ACTIVE) ── */}
        {isSearching && (
          <div className="space-y-4 py-2 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Navigation size={28} className="text-[#F4831F] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#F4831F]">
                  Neighborhood Radar Active
                </div>
                <h3 className="text-lg font-bold text-white truncate font-display">
                  Finding nearest partner...
                </h3>
                <p className="text-xs text-slate-400">
                  Broadcasting your request to verified helpers within 3 km
                </p>
              </div>
            </div>

            {/* Pulsing radar progress bar */}
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> 100% Background-Verified Only
              </span>
              <button
                type="button"
                onClick={onCancelBooking || onClose}
                className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Cancel Request
              </button>
            </div>
          </div>
        )}

        {/* ── STATE 2: PARTNER MATCHED & ON THE WAY ── */}
        {partnerFound && (
          <div className="space-y-4 animate-fade-in">
            {/* ETA & Distance banner */}
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg font-mono">
                  {etaMinutes}m
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Partner Arriving in {etaMinutes} mins
                  </div>
                  <div className="text-xs text-slate-400">
                    {distanceKm} km away • On route to your address
                  </div>
                </div>
              </div>

              {/* Security OTP (Uber style PIN) */}
              <div className="text-right pl-3 border-l border-slate-700">
                <div className="text-[10px] font-mono uppercase text-slate-400">Start PIN</div>
                <div className="text-lg font-mono font-black text-amber-400 tracking-wider">
                  {otpCode}
                </div>
              </div>
            </div>

            {/* Helper Profile Card */}
            <div className="flex items-center gap-3.5 pt-1">
              <img
                src={helper.avatar}
                alt={helper.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-[16px] text-white truncate font-display">
                    {helper.name}
                  </h4>
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-amber-400 font-bold">★ {helper.rating}</span>
                  <span>•</span>
                  <span>{helper.jobs} completed tasks</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {helper.vehicle}
                </div>
              </div>

              {/* Action buttons: Call & Chat */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${helper.phone}`}
                  className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-colors shadow"
                  title="Call Helper"
                >
                  <Phone size={18} />
                </a>

                <button
                  type="button"
                  onClick={onOpenChat}
                  className="w-11 h-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-400 transition-colors shadow-lg cursor-pointer"
                  title="Chat with Helper"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>

            {/* Trip status stepper */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                <span className="text-emerald-400">Assigned</span>
                <span className={tripProgress > 0.3 ? 'text-emerald-400' : ''}>On the way</span>
                <span className={tripProgress > 0.7 ? 'text-emerald-400' : ''}>Arrived</span>
                <span className={tripProgress >= 0.95 ? 'text-emerald-400' : ''}>Completed</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.round(tripProgress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
