import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import MapWrapper from "@/components/MapWrapper"; // <--- Import the wrapper
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Map | WorkSpot",
  description:
    "Explore laptop-friendly cafes and workspaces on our global map.",
};

export default async function MapPage() {
  // 1. Server-Side Fetching (Fast & Safe)
  const { data: cafes } = await supabase
    .from("cafes")
    .select(
      "id, name, slug, latitude, longitude, avg_price, rating, cover_image, city, country"
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null);

  const safeCafes = cafes || [];

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />

      {/* Map Container */}
      <div className="flex-1 relative pt-20 z-0">
        {/* Floating Stats Overlay */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 text-sm font-bold text-gray-700 pointer-events-none">
          <MapPin size={16} className="text-brand-primary fill-brand-primary" />
          {safeCafes.length} verified locations
        </div>

        {/* 2. Load the Map via Wrapper */}
        <MapWrapper cafes={safeCafes} />
      </div>
    </div>
  );
}
