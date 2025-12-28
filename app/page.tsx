"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Wifi, MapPin, Zap, Wind, Star, Plus, Clock, Car } from "lucide-react"; // Added Clock, Car
import { supabase } from "@/lib/supabase";
import Link from "next/link";

// 1. Updated Interface to match Database
interface Cafe {
  id: number;
  name: string;
  slug: string;
  avg_price: number;
  location: string;
  cover_image: string;
  rating: number;
  opening_time: string;
  closing_time: string;
  has_wifi: boolean;
  has_ac: boolean;
  has_parking: boolean;
  has_socket: boolean;
}

// 2. Helper: Check Open Status
const isOpenNow = (openTime: string, closeTime: string) => {
  if (!openTime || !closeTime) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);

  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;

  if (closeMinutes < openMinutes) closeMinutes += 24 * 60; // Handle past midnight

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

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

      <main className="grow container mx-auto px-6 py-16 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-primary mb-2">
              Trending Spaces
            </h2>
            <p className="text-brand-muted text-lg">
              Most popular spots in Dhaka this week
            </p>
          </div>

          {/* Filters */}
          <div className="hidden md:flex gap-3 mt-4 md:mt-0">
            {["🔥 Popular", "⚡ Fast Wifi", "🔌 Power Backup"].map((filter) => (
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
            {cafes.map((cafe) => {
              const openStatus = isOpenNow(
                cafe.opening_time,
                cafe.closing_time
              );

              return (
                <Link
                  href={`/cafe/${cafe.slug}`}
                  key={cafe.id}
                  className="group flex flex-col gap-4 cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-brand-border/50">
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

                    {/* Open/Closed Badge (New) */}
                    {openStatus !== null && (
                      <div
                        className={`absolute top-4 left-4 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide ${
                          openStatus ? "bg-green-500/90" : "bg-red-500/90"
                        }`}
                      >
                        {openStatus ? "Open Now" : "Closed"}
                      </div>
                    )}

                    {/* Floating Price Pill */}
                    {cafe.avg_price && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-white/20">
                        ৳ {cafe.avg_price}
                      </div>
                    )}

                    {/* Generator/Parking Badge (Updated Logic) */}
                    {cafe.has_parking && (
                      <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1.5">
                        <Car size={10} fill="currentColor" /> PARKING
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-brand-primary leading-tight group-hover:text-brand-accent transition-colors">
                        {cafe.name}
                      </h3>

                      {/* Rating Badge (Dynamic) */}
                      <div className="flex items-center gap-1 text-sm font-bold text-brand-primary bg-brand-surface px-2 py-0.5 rounded-md border border-brand-border">
                        <Star
                          size={12}
                          className="text-yellow-500 fill-yellow-500"
                        />
                        {cafe.rating ? cafe.rating.toFixed(1) : "New"}
                      </div>
                    </div>

                    <p className="text-brand-muted text-sm flex items-center gap-1.5 mb-3">
                      <MapPin size={14} className="text-brand-muted" />
                      <span className="truncate font-medium">
                        {cafe.location || "Dhaka, Bangladesh"}
                      </span>
                    </p>

                    {/* Amenities Icons (Dynamic) */}
                    <div className="flex items-center gap-3 pt-3 border-t border-brand-border/50">
                      {cafe.has_wifi && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                          <div className="p-1 bg-blue-50 text-blue-600 rounded-full">
                            <Wifi size={10} />
                          </div>{" "}
                          Fast Wifi
                        </span>
                      )}
                      {cafe.has_ac && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted">
                          <div className="p-1 bg-indigo-50 text-indigo-600 rounded-full">
                            <Wind size={10} />
                          </div>{" "}
                          AC
                        </span>
                      )}
                      {/* Fallback if no amenities */}
                      {!cafe.has_wifi && !cafe.has_ac && (
                        <span className="text-xs text-gray-300 italic">
                          No amenities listed
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
