import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, LocateFixed, MapPin } from 'lucide-react';

// Fix Leaflet's default icon path issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom SVG Icon Builders
function createCustomerIcon() {
  return L.divIcon({
    className: 'custom-customer-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(244,131,31,0.25); animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="position: relative; width: 36px; height: 36px; border-radius: 50%; background: #F4831F; border: 2.5px solid white; box-shadow: 0 4px 12px rgba(244,131,31,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px;">
          📍
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createHelperIcon(vehicle = 'scooter', heading = 0) {
  const emoji = vehicle === 'bike' ? '🏍️' : vehicle === 'car' ? '🚗' : '🛵';
  return L.divIcon({
    className: 'custom-helper-marker',
    html: `
      <div style="position: relative; width: 42px; height: 42px; transform: rotate(${heading}deg); transition: transform 0.4s ease;">
        <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(28,168,156,0.30); animation: pulse 1.8s ease-in-out infinite;"></div>
        <div style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: #1CA89C; border: 2.5px solid white; box-shadow: 0 6px 16px rgba(28,168,156,0.55); display: flex; align-items: center; justify-content: center; font-size: 20px;">
          ${emoji}
        </div>
        <div style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); background: #0F172A; color: white; font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; white-space: nowrap; font-family: monospace; border: 1px solid rgba(255,255,255,0.2);">
          PARTNER
        </div>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -24],
  });
}

function createNearbyBeaconIcon(price = 350) {
  return L.divIcon({
    className: 'custom-beacon-marker',
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(28,168,156,0.25);"></div>
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #1CA89C; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          ⚡
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function LiveTrackingMap({
  customerLocation = { lat: 12.9352, lng: 77.6245, address: 'Customer Location' },
  helperLocation = null, // { lat, lng, name, vehicle, heading }
  nearbyHelpers = [], // array of { lat, lng, name, rating, vehicle }
  taskStatus = 'pending', // 'pending' | 'confirmed' | 'in_progress' | 'completed'
  height = '420px',
  interactive = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const helperMarkerRef = useRef(null);
  const nearbyMarkersGroupRef = useRef(null);
  const routePolylineRef = useRef(null);

  // ── Initialize Leaflet Map ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = helperLocation?.lat || customerLocation.lat || 12.9352;
      const initialLng = helperLocation?.lng || customerLocation.lng || 77.6245;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
        dragging: interactive,
        scrollWheelZoom: interactive,
        touchZoom: interactive,
      });

      // CartoDB Positron / OpenStreetMap modern high-contrast sleek tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add zoom control top-right
      if (interactive) {
        L.control.zoom({ position: 'topright' }).addTo(map);
      }

      mapInstanceRef.current = map;
      nearbyMarkersGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // ── Update Customer Marker ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = Number(customerLocation?.lat) || 12.9352;
    const lng = Number(customerLocation?.lng) || 77.6245;

    if (!customerMarkerRef.current) {
      customerMarkerRef.current = L.marker([lat, lng], {
        icon: createCustomerIcon(),
        zIndexOffset: 500,
      })
        .addTo(map)
        .bindPopup(`<b>Service Location</b><br/>${customerLocation.address || 'Doorstep'}`);
    } else {
      customerMarkerRef.current.setLatLng([lat, lng]);
    }
  }, [customerLocation?.lat, customerLocation?.lng, customerLocation?.address]);

  // ── Update Nearby Helpers Beacons ─────────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = nearbyMarkersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    // If active booking with assigned helper, don't clutter map with other beacons
    if (helperLocation) return;

    nearbyHelpers.forEach((h) => {
      const hLat = Number(h.lat || h.coordinates?.[1]);
      const hLng = Number(h.lng || h.coordinates?.[0]);
      if (Number.isFinite(hLat) && Number.isFinite(hLng)) {
        L.marker([hLat, hLng], {
          icon: createNearbyBeaconIcon(),
          zIndexOffset: 100,
        })
          .addTo(group)
          .bindPopup(`<b>${h.name || 'HelpJi Partner'}</b><br/>★ ${h.rating || 4.9} · ${h.distanceKm ? h.distanceKm + ' km' : 'Nearby'}`);
      }
    });
  }, [nearbyHelpers, helperLocation]);

  // ── Update Helper Marker & Route Polyline ─────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (helperLocation?.lat && helperLocation?.lng) {
      const hLat = Number(helperLocation.lat);
      const hLng = Number(helperLocation.lng);
      const cLat = Number(customerLocation.lat) || 12.9352;
      const cLng = Number(customerLocation.lng) || 77.6245;

      // Update or create helper marker
      if (!helperMarkerRef.current) {
        helperMarkerRef.current = L.marker([hLat, hLng], {
          icon: createHelperIcon(helperLocation.vehicle, helperLocation.heading || 0),
          zIndexOffset: 1000,
        })
          .addTo(map)
          .bindPopup(`<b>${helperLocation.name || 'Partner'}</b><br/>En route to doorstep`);
      } else {
        helperMarkerRef.current.setLatLng([hLat, hLng]);
        helperMarkerRef.current.setIcon(
          createHelperIcon(helperLocation.vehicle, helperLocation.heading || 0)
        );
      }

      // Draw or update route line with intermediate waypoints
      const midLat = (hLat + cLat) / 2 + 0.0006;
      const midLng = (hLng + cLng) / 2 - 0.0004;
      const routePoints = [
        [hLat, hLng],
        [midLat, midLng],
        [cLat, cLng],
      ];

      if (!routePolylineRef.current) {
        routePolylineRef.current = L.polyline(routePoints, {
          color: '#1CA89C',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);
      } else {
        routePolylineRef.current.setLatLngs(routePoints);
      }

      // Smoothly fit bounds so both customer and helper are in view
      const bounds = L.latLngBounds([
        [hLat, hLng],
        [cLat, cLng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      if (helperMarkerRef.current) {
        helperMarkerRef.current.remove();
        helperMarkerRef.current = null;
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.remove();
        routePolylineRef.current = null;
      }
      // Re-center on customer location
      const cLat = Number(customerLocation.lat) || 12.9352;
      const cLng = Number(customerLocation.lng) || 77.6245;
      map.setView([cLat, cLng], 15);
    }
  }, [helperLocation?.lat, helperLocation?.lng, helperLocation?.heading, customerLocation?.lat, customerLocation?.lng]);

  const handleCenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = helperLocation?.lat || customerLocation.lat || 12.9352;
    const lng = helperLocation?.lng || customerLocation.lng || 77.6245;
    map.setView([lat, lng], 16, { animate: true });
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200/80 shadow-card bg-slate-100" style={{ height }}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Re-center FAB */}
      <button
        type="button"
        onClick={handleCenter}
        className="absolute bottom-4 right-4 z-[400] w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-700 hover:text-emerald-600 active:scale-95 transition-all cursor-pointer"
        aria-label="Center map"
      >
        <LocateFixed size={18} />
      </button>

      {/* Status Pill Badge */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-mono shadow-md border border-white/10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-bold uppercase tracking-wider text-emerald-400">
          {helperLocation ? 'LIVE TRACKING' : 'RADAR SCANNING'}
        </span>
      </div>
    </div>
  );
}
