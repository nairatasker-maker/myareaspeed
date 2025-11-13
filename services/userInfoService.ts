import type { UserInfo } from '../types';

// This type represents the location-specific parts of the UserInfo object.
type LocationInfo = Omit<UserInfo, 'os' | 'browser'>;

/**
 * Fetches the user's public IP address and uses geolocation APIs to retrieve their city, region, country, and ISP.
 * It first uses an IP-based geolocation service and then tries to enhance the location accuracy using the browser's Geolocation API.
 * @returns A promise that resolves to an object containing the user's location and network information.
 * @throws Will throw an error if the initial IP-based geolocation fails.
 */
export async function fetchLocationInfo(): Promise<LocationInfo> {
    // 1. Fetch IP-based location info from ipwho.is, which is generally more reliable in sandboxed environments.
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) {
        console.error('IP API request failed:', response.statusText);
        throw new Error('Failed to fetch IP information.');
    }
    const data = await response.json();

    if (!data.success) {
        console.error('IP API returned an error:', data.message);
        throw new Error('Failed to fetch IP information.');
    }

    const ipInfo: LocationInfo = {
        isp: data.connection?.isp || 'N/A',
        city: data.city || 'N/A',
        region: data.region || 'N/A',
        country: data.country || 'N/A',
        ip: data.ip || 'N/A',
    };

    // 2. Try to get high-accuracy location via browser's Geolocation API to override the city
    if ('geolocation' in navigator) {
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                // Set options for a more accurate and timely location request.
                const options = {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                };
                const timeoutId = setTimeout(() => reject(new Error("Geolocation timed out.")), options.timeout);
                
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        clearTimeout(timeoutId);
                        resolve(pos);
                    },
                    (err) => {
                        clearTimeout(timeoutId);
                        reject(err);
                    },
                    options
                );
            });

            const { latitude, longitude } = position.coords;
            ipInfo.lat = latitude;
            ipInfo.lng = longitude;
            
            // Use OpenStreetMap's Nominatim for reverse geocoding
            const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            
            if (geoResponse.ok) {
                const geoData = await geoResponse.json();
                // Prefer a more specific location name (suburb, neighborhood) if available
                const hyperLocalCity = geoData.address?.suburb || geoData.address?.neighbourhood || geoData.address?.village || geoData.address?.city;
                if (hyperLocalCity) {
                    ipInfo.city = hyperLocalCity;
                }
            } else {
                 console.warn('Reverse geocoding request failed:', geoResponse.statusText);
            }
        } catch (geoError) {
            console.warn(`Could not get high-accuracy location. Falling back to IP-based location.`, geoError);
        }
    }

    return ipInfo;
}