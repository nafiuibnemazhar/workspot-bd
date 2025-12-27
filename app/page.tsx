"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
// 1. FIXED: Added all missing icon imports
import { Wifi, MapPin, Zap, Wind, Star, Plus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Cafe {
  id: number;
  name: string;
  avg_price: number;
  address_text: string;
  cover_image: string;
  amenities: {
    wifi: boolean;
    ac: boolean;
    generator: boolean;
    outlets: boolean;
  };
}

export default function Home() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCafes() {
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Error fetching cafes:", error);
      } else {
        setCafes(data || []);
      }
      setLoading(false);
    }

    fetchCafes();
  }, []);

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col font-sans">
      <Navbar />
      <Hero />

      {/* 2. FIXED: Removed '-mt-20'. Added 'py-16' for clean spacing. */}
      <main className="flex-grow container mx-auto px-6 py-16 relative z-10">
        {/* Section Header - Now always dark text on light background */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-primary mb-2">
              Trending Spaces
            </h2>
            <p className="text-brand-muted text-lg">
              Most popular spots in Dhaka this week
            </p>
          </div>

          {/* Filters (Desktop only) */}
          <div className="hidden md:flex gap-3 mt-4 md:mt-0">
            {["🔥 Popular", "⚡ Fast Wifi", "🔌 Generator"].map((filter) => (
              <button
                key={filter}
                className="px-5 py-2 rounded-full bg-white border border-brand-border text-brand-primary text-sm font-bold hover:border-brand-accent hover:text-brand-accent transition-all shadow-sm"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* The Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : cafes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-brand-border">
            <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-primary">
              No workspaces found
            </h3>
            <p className="text-brand-muted mt-2 mb-8">
              Be the first to list a space in Dhaka.
            </p>
            <Link
              href="/add-cafe"
              className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg shadow-brand-primary/20"
            >
              <Plus size={20} /> List a Space
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cafes.map((cafe) => (
              <Link
                href={`/cafe/${cafe.slug}`}
                key={cafe.id}
                className="group flex flex-col gap-4 cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-brand-border/50">
                  {cafe.cover_image ? (
                    <img
                      src={cafe.cover_image}
                      alt={cafe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted bg-gray-100 font-medium">
                      No Image
                    </div>
                  )}

                  {/* Floating Price Pill */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-white/20">
                    ৳ {cafe.avg_price}
                  </div>

                  {/* Generator Badge */}
                  {cafe.amenities?.generator && (
                    <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1.5">
                      <Zap size={10} fill="currentColor" /> GEN BACKUP
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-brand-primary leading-tight group-hover:text-brand-accent transition-colors">
                      {cafe.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm font-bold text-brand-primary bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
                      <Star
                        size={12}
                        className="text-brand-accent fill-brand-accent"
                      />
                      4.9
                    </div>
                  </div>

                  <p className="text-brand-muted text-sm flex items-center gap-1.5 mb-3">
                    <MapPin size={14} className="text-brand-muted" />
                    <span className="truncate font-medium">
                      {cafe.address_text || "Dhaka, Bangladesh"}
                    </span>
                  </p>

                  {/* Amenities Icons */}
                  <div className="flex items-center gap-3 pt-3 border-t border-brand-border/50">
                    {cafe.amenities?.wifi && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                        <div className="p-1 bg-blue-50 text-blue-600 rounded-full">
                          <Wifi size={10} />
                        </div>{" "}
                        Fast Wifi
                      </span>
                    )}
                    {cafe.amenities?.ac && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                        <div className="p-1 bg-indigo-50 text-indigo-600 rounded-full">
                          <Wind size={10} />
                        </div>{" "}
                        AC
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
