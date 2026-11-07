import { useState, useEffect, useRef } from 'react';
import {
  Power,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  LocateFixed,
} from 'lucide-react';
import { onNewTask, emitHelperStatus, emitHelperLocation } from '../../utils/socket';

export default function HelperRadarMap({
  tasks = [],
  onAcceptTask,
  isAvailable = true,
  onToggleAvailability,
  helperProfile = {},
}) {
  const [available, setAvailable] = useState(isAvailable);
  const [selectedTask, setSelectedTask] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [liveTasks, setLiveTasks] = useState(tasks || []);
  const [userLocation, setUserLocation] = useState({ lat: 12.9352, lng: 77.6245 });
  const [locationName, setLocationName] = useState('Koramangala 4th Block, Bengaluru');

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const radarAngleRef = useRef(0);

  // Sync tasks prop
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setLiveTasks(tasks);
    }
  }, [tasks]);

  // Sync available state
  useEffect(() => {
    setAvailable(isAvailable);
  }, [isAvailable]);

  // ── Browser Geolocation & Socket Status Broadcast ─────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId = null;
    let lastEmitTime = 0;

    const handlePos = (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserLocation(coords);

      const now = Date.now();
      // Throttle broadcast to every 4 seconds to avoid network churn
      if (available && now - lastEmitTime > 4000) {
        lastEmitTime = now;
        emitHelperStatus({
          isAvailable: true,
          lat: coords.lat,
          lng: coords.lng,
          locality: locationName,
          name: helperProfile.name || 'Partner',
          rating: helperProfile.rating || 4.9,
          vehicle: helperProfile.vehicle || 'scooter',
        });
      }
    };

    navigator.geolocation.getCurrentPosition(handlePos, () => {}, {
      enableHighAccuracy: true,
      timeout: 6000,
    });

    if (available) {
      watchId = navigator.geolocation.watchPosition(handlePos, () => {}, {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      });
    }

    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [available, locationName, helperProfile.name, helperProfile.rating, helperProfile.vehicle]);

  // ── Socket listener: new incoming tasks pop onto radar in real-time! ───────
  useEffect(() => {
    const unsub = onNewTask((newTask) => {
      setLiveTasks((prev) => {
        const id = newTask._id || newTask.id;
        if (prev.some((t) => (t._id || t.id) === id)) return prev;
        return [newTask, ...prev];
      });

      // Automatically select new task to grab helper's attention
      setSelectedTask(newTask);

      // Play audio notification chime (browser permitted)
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch {
        // AudioContext restricted before gesture
      }
    });

    return () => unsub();
  }, []);

  const handleToggleOnline = (e) => {
    e.stopPropagation();
    const nextState = !available;
    setAvailable(nextState);
    onToggleAvailability?.(nextState);

    emitHelperStatus({
      isAvailable: nextState,
      lat: userLocation.lat,
      lng: userLocation.lng,
      locality: locationName,
      name: helperProfile.name || 'Partner',
    });
  };

  const handleAccept = async (task) => {
    const id = task._id || task.id;
    setAcceptingId(id);
    try {
      await onAcceptTask?.(id);
      setSelectedTask(null);
    } finally {
      setAcceptingId(null);
    }
  };

  // ── Canvas Radar Screen Rendering ─────────────────────────────────────────
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

      // Radar map background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Map Grid lines (subtle streets)
      ctx.strokeStyle = 'rgba(28, 168, 156, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
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

      // Center (Helper Location)
      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const maxRadius = Math.min(width, height) * 0.44;

      // ── Radar Range Rings ──
      ctx.save();
      [0.3, 0.6, 0.9].forEach((ratio, index) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxRadius * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = available
          ? `rgba(28, 168, 156, ${0.35 - index * 0.08})`
          : 'rgba(92, 88, 112, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Distance text on rings
        if (available) {
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = 'rgba(28, 168, 156, 0.5)';
          ctx.fillText(`${(ratio * 3).toFixed(1)} km`, centerX + 6, centerY - maxRadius * ratio + 12);
        }
      });
      ctx.restore();

      // ── Rotating Radar Sweep Cone ──
      if (available) {
        radarAngleRef.current += 0.025;
        const startAngle = radarAngleRef.current;
        const endAngle = startAngle + 0.55;

        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
        gradient.addColorStop(0, 'rgba(28, 168, 156, 0.35)');
        gradient.addColorStop(1, 'rgba(28, 168, 156, 0.0)');

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, maxRadius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
      }

      // ── Task Pins on Radar (Customer Jobs in Neighborhood) ──
      const taskPins = [
        { angle: 0.6, dist: 0.38, task: liveTasks[0] },
        { angle: 2.1, dist: 0.62, task: liveTasks[1] },
        { angle: 4.2, dist: 0.50, task: liveTasks[2] },
        { angle: 5.4, dist: 0.78, task: liveTasks[3] },
      ].filter((p) => Boolean(p.task));

      taskPins.forEach((pin, idx) => {
        const pinX = centerX + Math.cos(pin.angle) * (maxRadius * pin.dist);
        const pinY = centerY + Math.sin(pin.angle) * (maxRadius * pin.dist);

        const isCurrentSelected = selectedTask && (selectedTask._id || selectedTask.id) === (pin.task._id || pin.task.id);

        ctx.save();
        // Pulsing halo
        const pulse = 10 + Math.sin(Date.now() * 0.006 + idx) * 3;
        ctx.beginPath();
        ctx.arc(pinX, pinY, isCurrentSelected ? 16 : pulse, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentSelected ? 'rgba(244, 131, 31, 0.4)' : 'rgba(28, 168, 156, 0.25)';
        ctx.fill();

        // Pin body
        ctx.beginPath();
        ctx.arc(pinX, pinY, isCurrentSelected ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = isCurrentSelected ? '#F4831F' : '#1CA89C';
        ctx.shadowColor = isCurrentSelected ? '#F4831F' : '#1CA89C';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Pin price pill
        ctx.fillStyle = 'rgba(9, 13, 22, 0.9)';
        ctx.strokeStyle = isCurrentSelected ? '#F4831F' : '#1CA89C';
        ctx.lineWidth = 1;
        ctx.roundRect(pinX - 22, pinY - 24, 44, 18, 5);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9px Sora, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`₹${pin.task.price || 350}`, pinX - 16, pinY - 12);

        // If selected, draw connecting navigation line from helper to pin
        if (isCurrentSelected) {
          ctx.strokeStyle = 'rgba(244, 131, 31, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(pinX, pinY);
          ctx.stroke();
        }

        ctx.restore();
      });

      // ── Center Marker (Helper Vehicle / Position) ──
      ctx.save();
      // Outer pulse
      if (available) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(28, 168, 156, 0.2)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 11, 0, Math.PI * 2);
      ctx.fillStyle = available ? '#1CA89C' : '#5C5870';
      ctx.shadowColor = available ? '#1CA89C' : '#5C5870';
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Label below helper
      ctx.font = 'bold 11px Sora, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText("You (Online)", centerX - 32, centerY + 26);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [available, liveTasks, selectedTask]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl mb-6">
      {/* ── Radar Top Bar ── */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-slate-950/90 to-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-3 h-3 rounded-full ${
              available ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
            }`}
          />
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              {available ? 'RADAR ACTIVE • SCANNING 3 KM' : 'RADAR PAUSED (OFFLINE)'}
            </div>
            <div className="text-xs text-slate-300 font-medium">{locationName}</div>
          </div>
        </div>

        {/* Uber-style GO ONLINE / OFFLINE Switch */}
        <button
          type="button"
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg transition-all ${
            available
              ? 'bg-rose-500/20 border border-rose-500 text-rose-300 hover:bg-rose-500 hover:text-white'
              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
          }`}
        >
          <Power size={14} />
          <span>{available ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* ── Interactive Canvas Radar Map ── */}
      <div className="relative w-full h-[360px] sm:h-[420px]">
        <canvas
          ref={canvasRef}
          width={700}
          height={420}
          className="w-full h-full object-cover"
        />

        {/* No tasks notice overlay if radar active but 0 jobs */}
        {available && liveTasks.length === 0 && (
          <div className="absolute bottom-5 inset-x-5 z-10 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-center text-xs text-slate-300 backdrop-blur-md">
            Scanning for new task requests in your neighborhood. You will be alerted instantly!
          </div>
        )}
      </div>

      {/* ── Selected Task Card Overlay (Uber Driver Accept Screen) ── */}
      {selectedTask && (
        <div className="p-5 bg-slate-900 border-t border-slate-800 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 uppercase">
                  {selectedTask.category || 'Local Task'}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-400" />
                  {selectedTask.distanceKm || '0.9'} km away
                </span>
              </div>
              <h4 className="text-[17px] font-bold text-white font-display">
                {selectedTask.title || 'Urgent Home Task'}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {selectedTask.description || selectedTask.location || 'Local customer address'}
              </p>
            </div>

            {/* Earnings display */}
            <div className="text-right shrink-0">
              <div className="text-xl font-extrabold text-emerald-400 font-mono">
                ₹{Math.round((selectedTask.price || 350) * 0.88)}
              </div>
              <div className="text-[10px] text-slate-400">Net payout (88%)</div>
            </div>
          </div>

          {/* 1-Tap Accept Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedTask(null)}
              className="px-4 py-3.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-semibold hover:text-white cursor-pointer"
            >
              Pass
            </button>
            <button
              type="button"
              onClick={() => handleAccept(selectedTask)}
              disabled={acceptingId === (selectedTask._id || selectedTask.id)}
              className="flex-1 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 transition-all disabled:opacity-50"
            >
              {acceptingId === (selectedTask._id || selectedTask.id) ? (
                <>Accepting Task...</>
              ) : (
                <>
                  <Zap size={16} /> <span>1-Tap Accept Job</span> <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
