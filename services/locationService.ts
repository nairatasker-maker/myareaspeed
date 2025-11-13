
import type { Coordinates } from '../types';

// In-memory cache to store geocoded locations and reduce API calls
const locationCache = new Map<string, Coordinates>();

/**
 * Geocodes a location string (e.g., "Lekki, Lagos") into geographic coordinates.
 * Uses OpenStreetMap's Nominatim API and includes an in-memory cache.
 * @param location The location string to geocode.
 * @returns A promise that resolves to an object with lat and lng, or null if not found.
 */
export async function geocodeLocation(location: string): Promise<Coordinates | null> {
    const cacheKey = location.toLowerCase().trim();
    if (locationCache.has(cacheKey)) {
        return locationCache.get(cacheKey)!;
    }

    try {
        const encodedLocation = encodeURIComponent(location);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`);

        if (!response.ok) {
            console.error(`Nominatim API error for "${location}": ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const coords: Coordinates = {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
            locationCache.set(cacheKey, coords);
            return coords;
        }

        console.warn(`No geocoding results found for "${location}"`);
        return null;
    } catch (error) {
        console.error(`Geocoding failed for "${location}":`, error);
        return null;
    }
}
