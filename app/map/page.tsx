"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic"; // Vital for Maps
import { Loader2 } from "lucide-react";

// We dynamically import the Map component to prevent Server-Side Rendering (SSR) crashes
const FullScreenMap = dynamic(() => import("@/components/FullScreenMap"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-brand-surface flex items-center justify-center">
      <Loader2 className="animate-spin text-brand-accent" size={48} />
      <span className="ml-4 font-bold text-brand-primary">Loading Map...</span>
    </div>
  ),
});

export default function MapPage() {
  const [cafes, setCafes] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCafes() {
      const { data } = await supabase
        .from("cafes")
        .select("id, name, slug, latitude, longitude, avg_price, cover_image");
      if (data) setCafes(data);
    }
    fetchCafes();
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      {/* The map takes up the remaining height minus navbar */}
      <div className="flex-1 pt-20 relative z-0">
        <FullScreenMap cafes={cafes} />
      </div>
    </div>
  );
}
