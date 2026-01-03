"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";

// Fix Leaflet's default icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- NEW HELPER COMPONENT: Auto-Zoom ---
function FitBounds({ cafes }: { cafes: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (cafes.length > 0) {
      // 1. Create a "Boundary Box" containing all cafe coordinates
      const bounds = L.latLngBounds(
        cafes.map((c) => [c.latitude, c.longitude])
      );

      // 2. Animate the map to fit that box (with some padding)
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14, // Don't zoom in TOO close if there's only 1 item
        animate: true,
        duration: 1.5,
      });
    }
  }, [cafes, map]);

  return null;
}

export default function FullScreenMap({ cafes }: { cafes: any[] }) {
  // Default center (fallback if no cafes)
  const defaultCenter: [number, number] = [23.8103, 90.4125];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={5}
      scrollWheelZoom={true}
      className="h-full w-full outline-none"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <ZoomControl position="bottomright" />

      {/* ACTIVATE AUTO-ZOOM */}
      <FitBounds cafes={cafes} />

      {cafes.map((cafe) => (
        <Marker
          key={cafe.id}
          position={[cafe.latitude, cafe.longitude]}
          icon={defaultIcon}
        >
          <Popup className="custom-popup-clean" minWidth={280}>
            <div className="flex flex-col">
              <div className="h-32 w-full relative bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={cafe.cover_image}
                  className="w-full h-full object-cover"
                  alt={cafe.name}
                />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm text-gray-800">
                  <Star size={10} className="text-yellow-500 fill-yellow-500" />{" "}
                  {cafe.rating || "New"}
                </div>
              </div>

              <div className="p-4 bg-white rounded-b-lg">
                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
                  {cafe.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {cafe.city}, {cafe.country === "USA" ? "USA" : "BD"}
                </p>

                <Link
                  href={`/cafe/${cafe.slug}`}
                  className="flex items-center justify-center w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-lg hover:bg-brand-accent transition-colors gap-1"
                >
                  View Details <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
