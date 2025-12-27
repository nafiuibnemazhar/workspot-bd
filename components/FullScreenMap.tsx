"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Fix Leaflet Icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export default function FullScreenMap({ cafes }: { cafes: any[] }) {
  // Center of Dhaka
  const center = { lat: 23.7937, lng: 90.4066 };

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.latitude, cafe.longitude]}
          icon={icon}
        >
          <Popup className="custom-popup">
            <div className="w-48 p-1">
              <div className="h-24 w-full bg-gray-200 rounded-lg mb-2 overflow-hidden">
                {cafe.cover_image && (
                  <img
                    src={cafe.cover_image}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <h3 className="font-bold text-brand-primary text-sm mb-1">
                {cafe.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Avg: ৳{cafe.avg_price}
              </p>
              <Link
                href={`/cafe/${cafe.slug}`}
                className="block text-center bg-brand-accent text-white text-xs font-bold py-1.5 rounded-md hover:bg-brand-primary transition-colors"
              >
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
