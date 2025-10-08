import { getDistance } from "geolib";
import { GMFCS, CPSubtype } from "@prisma/client";

interface UserMatchData {
  latitude: number;
  longitude: number;
  cpSubtype?: CPSubtype | null;
  gmfcs?: GMFCS | null;
}

/**
 * Calculate a match score between two users (0-100 points)
 * Higher score = better match
 *
 * Scoring breakdown:
 * - Distance: 0-50 points (closer = higher score)
 * - CP Type: 0-30 points (same type = 30, different = 10)
 * - GMFCS Level: 0-20 points (closer levels = higher score)
 */
export function calculateMatchScore(
  currentUser: UserMatchData,
  potentialMatch: UserMatchData
): number {
  let score = 0;

  // === DISTANCE SCORING (0-50 points) ===
  const distanceInMeters = getDistance(
    { latitude: currentUser.latitude, longitude: currentUser.longitude },
    { latitude: potentialMatch.latitude, longitude: potentialMatch.longitude }
  );

  // Convert meters to miles
  const distanceInMiles = distanceInMeters * 0.000621371;

  if (distanceInMiles < 10) {
    score += 50; // Very close
  } else if (distanceInMiles < 25) {
    score += 40;
  } else if (distanceInMiles < 50) {
    score += 30;
  } else if (distanceInMiles < 100) {
    score += 20;
  } else if (distanceInMiles < 250) {
    score += 10;
  } else {
    score += 5; // Far away but still some points
  }

  // === CP TYPE SCORING (0-30 points) ===
  if (currentUser.cpSubtype && potentialMatch.cpSubtype) {
    if (currentUser.cpSubtype === potentialMatch.cpSubtype) {
      score += 30; // Same CP type
    } else {
      score += 10; // Different type, but still relevant
    }
  } else {
    score += 10; // One or both didn't specify, give base points
  }

  // === GMFCS LEVEL SCORING (0-20 points) ===
  if (currentUser.gmfcs && potentialMatch.gmfcs) {
    const gmfcsMap: Record<GMFCS, number> = {
      I: 1,
      II: 2,
      III: 3,
      IV: 4,
      V: 5,
      UNKNOWN: 0,
    };

    const currentLevel = gmfcsMap[currentUser.gmfcs];
    const matchLevel = gmfcsMap[potentialMatch.gmfcs];

    if (currentLevel > 0 && matchLevel > 0) {
      const levelDifference = Math.abs(currentLevel - matchLevel);

      if (levelDifference === 0) {
        score += 20; // Exact match
      } else if (levelDifference === 1) {
        score += 15; // One level apart
      } else if (levelDifference === 2) {
        score += 10; // Two levels apart
      } else {
        score += 5; // 3+ levels apart
      }
    } else {
      score += 10; // One or both unknown
    }
  } else {
    score += 10; // One or both didn't specify
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Get a human-readable distance string
 */
export function getDistanceString(
  currentUser: UserMatchData,
  potentialMatch: UserMatchData
): string {
  const distanceInMeters = getDistance(
    { latitude: currentUser.latitude, longitude: currentUser.longitude },
    { latitude: potentialMatch.latitude, longitude: potentialMatch.longitude }
  );

  const distanceInMiles = Math.round(distanceInMeters * 0.000621371);

  if (distanceInMiles < 1) {
    return "Less than 1 mile away";
  } else if (distanceInMiles === 1) {
    return "1 mile away";
  } else if (distanceInMiles < 10) {
    return `${distanceInMiles} miles away`;
  } else if (distanceInMiles < 50) {
    return `About ${distanceInMiles} miles away`;
  } else {
    return `Within ${Math.round(distanceInMiles / 10) * 10} miles`;
  }
}
