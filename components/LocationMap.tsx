
import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { UserMapLocation, FeedbackMapLocation } from '../types';
import { useTranslation } from '../context/i18n';

// Custom hook to fly to the map's center when it changes
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, {
            animate: true,
            duration: 1.5
        });
    }, [center, zoom, map]);
    return null;
};

// Create custom icons using Leaflet's divIcon
const userIcon = L.divIcon({
    html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 bg-primary rounded-full animate-pulse"></div>
            <div class="relative w-5 h-5 bg-primary rounded-full border-2 border-white"></div>
        </div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const feedbackIcon = L.divIcon({
    html: `
        <div class="w-3 h-3 bg-status-average rounded-full border border-white shadow-md"></div>
    `,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

interface LocationMapProps {
    mapCenter: [number, number];
    userLocation?: UserMapLocation;
    feedbackLocations: FeedbackMapLocation[];
    zoom?: number;
}

export const LocationMap: React.FC<LocationMapProps> = ({ mapCenter, userLocation, feedbackLocations, zoom = 13 }) => {
    const { t } = useTranslation();

    // Memoize feedback markers to prevent re-rendering on map move
    const feedbackMarkers = useMemo(() => (
        feedbackLocations.map(loc => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={feedbackIcon}>
                <Popup>
                    <div className="text-xs font-sans max-w-[200px]">
                        <p className="font-bold">{loc.isp}</p>
                        <p>{t('downloadSpeed')}: <strong>{loc.speed.toFixed(1)} Mbps</strong></p>
                        <p>{t('overallRating')}: <strong>{loc.rating}/5</strong></p>
                        {loc.comment && (
                            <p className="mt-2 pt-2 border-t border-border-light dark:border-border-dark italic whitespace-normal">"{loc.comment}"</p>
                        )}
                    </div>
                </Popup>
            </Marker>
        ))
    ), [feedbackLocations, t]);

    return (
        <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <ChangeView center={mapCenter} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>
                        <div className="text-sm font-sans font-bold">{userLocation.city} ({t('yourLocationLabel')})</div>
                    </Popup>
                </Marker>
            )}
            {feedbackMarkers}
        </MapContainer>
    );
};