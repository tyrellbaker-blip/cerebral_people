/**
 * Geocodes a US zip code to latitude/longitude using Google Maps Geocoding API
 * @param zip - 5-digit US zip code
 * @returns Object with lat and lng, or null if geocoding fails
 */
export async function geocodeZipCode(
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&components=country:US&key=${apiKey}`
    );

    if (!response.ok) {
      console.error("Geocoding API request failed:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Geocoding failed:", data.status, data.error_message);
      return null;
    }

    const location = data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng,
    };
  } catch (error) {
    console.error("Error geocoding zip code:", error);
    return null;
  }
}
