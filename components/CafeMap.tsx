'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for missing default icon in Leaflet + Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const customIcon = new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconRetinaUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface CafeMapProps {
    lat: number;
    long: number;
    title: string;
}

const CafeMap = ({ lat, long, title }: CafeMapProps) => {
    // This hook ensures the map invalidates its size correctly when loaded
    useEffect(() => {
        // Cleanup function if needed
    }, []);

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-inner border border-brand-beige">
            <MapContainer 
                center={[lat, long]} 
                zoom={15} 
                scrollWheelZoom={false} 
                className="h-full w-full z-0" // z-0 keeps it behind your navbar if you have one
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, long]} icon={customIcon}>
                    <Popup>
                        <span className="font-bold text-brand-dark">{title}</span>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default CafeMap;