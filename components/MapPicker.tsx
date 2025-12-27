"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Helper to handle clicks
function LocationMarker({
  onSelect,
  position,
}: {
  onSelect: (lat: number, lng: number) => void;
  position: { lat: number; lng: number };
}) {
  const map = useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Fly to the new position if it changes programmatically
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);

  return position ? <Marker position={position} icon={icon} /> : null;
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: MapPickerProps) {
  const [position, setPosition] = useState({
    lat: initialLat || 23.7937,
    lng: initialLng || 90.4066,
  });

  // Update internal state if props change (e.g. data loaded from DB)
  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const handleSelect = (lat: number, lng: number) => {
    setPosition({ lat, lng });
    onLocationSelect(lat, lng);
  };

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-200 z-0">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker onSelect={handleSelect} position={position} />
      </MapContainer>
    </div>
  );
}
