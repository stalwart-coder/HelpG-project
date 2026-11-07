/**
 * GeoLocationService — Hyperlocal GPS Location & Distance Engine
 * Features:
 * - Browser Geolocation API with graceful neighborhood fallback
 * - Haversine distance calculation in kilometers
 * - Smart helper sorting by proximity, ratings, and verification badges
 */

export const DEFAULT_LOCALITY = {
  name: 'Koramangala 4th Block, Bengaluru',
  city: 'Bengaluru',
  lat: 12.9352,
  lng: 77.6245,
};

export const LOCALITY_COORDINATES = {
  'Koramangala, Bengaluru': { lat: 12.9352, lng: 77.6245, city: 'Bengaluru' },
  'Andheri West, Mumbai': { lat: 19.1363, lng: 72.8277, city: 'Mumbai' },
  'Sector 62, Noida': { lat: 28.6279, lng: 77.3688, city: 'Noida' },
  'Anna Nagar, Chennai': { lat: 13.0850, lng: 80.2101, city: 'Chennai' },
  'Salt Lake, Kolkata': { lat: 22.5804, lng: 88.4173, city: 'Kolkata' },
  'Viman Nagar, Pune': { lat: 18.5679, lng: 73.9143, city: 'Pune' },
  'Banjara Hills, Hyderabad': { lat: 17.4156, lng: 78.4357, city: 'Hyderabad' },
  'Malviya Nagar, Jaipur': { lat: 26.8532, lng: 75.8202, city: 'Jaipur' },
};

/**
 * Calculates distance between two GPS coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.2;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Requests device GPS coordinates with timeout and fallback
 */
export function getCurrentGPSLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ ...DEFAULT_LOCALITY, source: 'fallback' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          name: 'Current GPS Location (Near You)',
          city: 'Detected',
          source: 'gps',
          accuracyMeters: Math.round(position.coords.accuracy),
        });
      },
      () => {
        // Fallback gracefully on permission denied or error
        resolve({ ...DEFAULT_LOCALITY, source: 'default' });
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
    );
  });
}

/**
 * Intelligently scores and sorts helpers based on proximity, rating, skills & verification
 */
export function matchNearbyHelpers(helpers = [], customerCoords = DEFAULT_LOCALITY, requiredSkill = null) {
  return helpers
    .map((helper) => {
      const helperCoords = LOCALITY_COORDINATES[helper.area] || {
        lat: customerCoords.lat + (Math.random() - 0.5) * 0.03,
        lng: customerCoords.lng + (Math.random() - 0.5) * 0.03,
      };

      const distanceKm = calculateDistanceKm(
        customerCoords.lat,
        customerCoords.lng,
        helperCoords.lat,
        helperCoords.lng
      );

      // Estimated arrival: 3 mins base + 4 mins per km
      const etaMins = Math.max(8, Math.round(3 + distanceKm * 4));

      // Skill match multiplier
      const hasSkill = !requiredSkill || (helper.skills && helper.skills.includes(requiredSkill));

      // Match Score (0 to 100)
      const proximityScore = Math.max(0, 50 - distanceKm * 8);
      const ratingScore = (helper.rating || 4.5) * 8; // Max 40
      const verifiedBonus = helper.isVerified ? 10 : 0;
      const totalScore = Math.round(proximityScore + ratingScore + verifiedBonus);

      return {
        ...helper,
        distanceKm,
        etaMins,
        matchScore: Math.min(99, Math.max(60, totalScore)),
        hasSkill,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
