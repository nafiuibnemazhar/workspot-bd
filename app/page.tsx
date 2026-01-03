"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import {
  Wifi,
  MapPin,
  Wind,
  Star,
  Car,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Globe,
  Layers,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
  latitude: number;
  longitude: number;
  distance?: number;
  country?: string;
  city?: string;
  state?: string;
}

const ITEMS_PER_PAGE = 9;

// --- UTILS ---
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const isOpenNow = (openTime: string, closeTime: string) => {
  if (!openTime || !closeTime) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;
  if (closeMinutes < openMinutes) closeMinutes += 24 * 60;
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

// --- REGION EXTRACTION LOGIC ---
// This scans all cafes and returns a list of unique locations (e.g., "Gulshan", "Cary, NC")
const getUniqueRegions = (data: Cafe[]) => {
  const regions: Record<
    string,
    { label: string; count: number; type: "BD" | "USA" }
  > = {};

  // Standardizing BD Neighborhoods
  const dhakaHubs = [
    "Gulshan",
    "Banani",
    "Dhanmondi",
    "Uttara",
    "Mirpur",
    "Mohakhali",
    "Badda",
    "Bashundhara",
    "Agargaon",
    "Lalmatia",
    "Mohammadpur",
    "Khilgaon",
    "Farmgate",
    "Baridhara",
    "Niketon",
    "Rampura",
  ];

  data.forEach((cafe) => {
    let key = "";
    let type: "BD" | "USA" = "BD";

    // 1. Identify Country/Type
    if (
      cafe.country === "USA" ||
      (cafe.location && cafe.location.includes("USA"))
    ) {
      type = "USA";
      // Use City + State if available, else clean location
      if (cafe.city && cafe.state) {
        key = `${cafe.city}, ${cafe.state}`;
      } else {
        // Fallback cleanup
        key = cafe.location.split(",")[0] || "Unknown USA";
      }
    } else {
      // 2. BD Logic (Fuzzy match neighborhood)
      type = "BD";
      const locLower = (cafe.location || "").toLowerCase();
      const matchedHub = dhakaHubs.find((h) =>
        locLower.includes(h.toLowerCase())
      );

      if (matchedHub) {
        key = matchedHub;
      } else {
        // If no hub matched, try city or default
        key = cafe.city || "Dhaka (Misc)";
      }
    }

    if (key) {
      if (!regions[key]) regions[key] = { label: key, count: 0, type };
      regions[key].count++;
    }
  });

  // Convert to array and sort by count (most popular first)
  return Object.values(regions).sort((a, b) => b.count - a.count);
};

export default function Home() {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [filteredCafes, setFilteredCafes] = useState<Cafe[]>([]);
  const [availableRegions, setAvailableRegions] = useState<
    { label: string; count: number; type: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);

  // FILTERS STATE
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [activeRegion, setActiveRegion] = useState<string>("All");
  const [sortingByDistance, setSortingByDistance] = useState(false);

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
        setFilteredCafes(data || []);

        // Dynamic Region Generation
        const regions = getUniqueRegions(data || []);
        setAvailableRegions(regions);
      }
      setLoading(false);
    }
    fetchCafes();
  }, []);

  // --- MASTER FILTER LOGIC ---
  const applyFilters = (filterType: string | null, region: string | null) => {
    // 1. Update State
    const finalFilter = filterType !== null ? filterType : activeFilter;
    const finalRegion = region !== null ? region : activeRegion;

    if (filterType !== null) setActiveFilter(finalFilter);
    if (region !== null) setActiveRegion(finalRegion);

    // 2. Filter Base Data
    let result = [...cafes];

    // A. Apply Region
    if (finalRegion !== "All") {
      result = result.filter((c) => {
        // Match logic must mirror the extraction logic
        if (c.country === "USA") {
          const key = c.city && c.state ? `${c.city}, ${c.state}` : c.location;
          return key.includes(finalRegion);
        } else {
          return (c.location || "")
            .toLowerCase()
            .includes(finalRegion.toLowerCase());
        }
      });
    }

    // B. Apply Attribute
    if (finalFilter === "Popular") {
      result = result.filter((c) => c.rating >= 4.5);
    } else if (finalFilter === "Wifi") {
      result = result.filter((c) => c.has_wifi);
    } else if (finalFilter === "Power") {
      result = result.filter((c) => c.has_socket);
    }

    // C. Apply Sort
    if (sortingByDistance) {
      result.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    setFilteredCafes(result);
    setCurrentPage(1); // Reset page
  };

  const handleNearMe = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const cafesWithDistance = cafes.map((cafe) => {
          if (cafe.latitude && cafe.longitude) {
            return {
              ...cafe,
              distance: getDistanceFromLatLonInKm(
                userLat,
                userLng,
                cafe.latitude,
                cafe.longitude
              ),
            };
          }
          return { ...cafe, distance: 99999 };
        });

        setCafes(cafesWithDistance);
        // Re-run filters with new data
        setSortingByDistance(true);
        setActiveFilter("All");
        setActiveRegion("All");

        const sorted = [...cafesWithDistance].sort(
          (a, b) => (a.distance || 0) - (b.distance || 0)
        );
        setFilteredCafes(sorted);
        setLoading(false);
      },
      (error) => {
        alert("Location access denied.");
        setLoading(false);
      }
    );
  };

  // --- PAGINATION CALCULATION ---
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCafes = filteredCafes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCafes.length / ITEMS_PER_PAGE);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 500, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-brand-surface flex flex-col font-sans text-brand-text">
      <Navbar />
      <Hero />

      <main className="grow container mx-auto px-6 py-12 relative z-10">
        {/* DYNAMIC REGION FILTER (Replaces Static Links) */}
        {availableRegions.length > 0 && (
          <div className="mb-12 border-b border-brand-border pb-8 animate-fade-in-up">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-sm font-bold text-brand-muted uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} /> Browse by Region
              </h3>
              {activeRegion !== "All" && (
                <button
                  onClick={() => applyFilters(null, "All")}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  Clear Region
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyFilters(null, "All")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  activeRegion === "All"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary"
                }`}
              >
                🌍 All Locations
              </button>

              {availableRegions.map((region) => (
                <button
                  key={region.label}
                  onClick={() => applyFilters(null, region.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                    activeRegion === region.label
                      ? "bg-brand-primary text-white border-brand-primary shadow-md"
                      : "bg-white border-brand-border text-brand-primary hover:border-brand-accent hover:text-brand-accent"
                  }`}
                >
                  <span>{region.type === "USA" ? "🇺🇸" : "🇧🇩"}</span>
                  {region.label}
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeRegion === region.label
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {region.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* FILTERS HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-primary mb-2">
              {sortingByDistance
                ? "Closest to You"
                : activeRegion !== "All"
                ? `${activeRegion} Workspaces`
                : "Trending Spaces"}
            </h2>
            <p className="text-brand-muted text-lg">
              {activeFilter !== "All"
                ? `Showing ${
                    activeFilter === "Power" ? "Power Backup" : activeFilter
                  } spots`
                : `Found ${filteredCafes.length} workspaces available`}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleNearMe}
              className={`px-5 py-2.5 rounded-full border text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                sortingByDistance
                  ? "bg-brand-primary text-white border-brand-primary shadow-md ring-2 ring-offset-2 ring-brand-primary/30"
                  : "bg-white border-brand-border text-brand-primary hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              <Navigation
                size={16}
                className={sortingByDistance ? "animate-pulse" : ""}
              />
              {sortingByDistance ? "Near Me Active" : "Near Me"}
            </button>

            <button
              onClick={() => applyFilters("Popular", null)}
              className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${
                activeFilter === "Popular"
                  ? "bg-brand-accent text-brand-primary border-brand-accent ring-2 ring-brand-accent/30"
                  : "bg-white border-brand-border text-brand-primary hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              🔥 Popular
            </button>
            <button
              onClick={() => applyFilters("Wifi", null)}
              className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${
                activeFilter === "Wifi"
                  ? "bg-blue-100 text-blue-700 border-blue-200 ring-2 ring-blue-200"
                  : "bg-white border-brand-border text-brand-primary hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              ⚡ Fast Wifi
            </button>
            <button
              onClick={() => applyFilters("Power", null)}
              className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all shadow-sm ${
                activeFilter === "Power"
                  ? "bg-green-100 text-green-700 border-green-200 ring-2 ring-green-200"
                  : "bg-white border-brand-border text-brand-primary hover:border-brand-accent hover:text-brand-accent"
              }`}
            >
              🔌 Power
            </button>
          </div>
        </div>

        {/* CAFE GRID (PAGINATED) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 rounded-3xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredCafes.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-brand-border">
            <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-primary">
              No workspaces match your filter
            </h3>
            <p className="text-brand-muted mt-2">
              Try selecting "All Locations" or clearing filters.
            </p>
            <button
              onClick={() => applyFilters("All", "All")}
              className="text-brand-accent font-bold mt-4 hover:underline"
            >
              Reset Everything
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentCafes.map((cafe) => {
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

                      {openStatus !== null && (
                        <div
                          className={`absolute top-4 left-4 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide ${
                            openStatus ? "bg-green-500/90" : "bg-red-500/90"
                          }`}
                        >
                          {openStatus ? "Open Now" : "Closed"}
                        </div>
                      )}

                      {cafe.distance !== undefined && cafe.distance < 9000 && (
                        <div className="absolute bottom-4 right-4 bg-brand-primary/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                          <Navigation size={10} />
                          {cafe.distance.toFixed(1)} km
                        </div>
                      )}

                      {cafe.avg_price > 0 && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-white/20">
                          {cafe.country === "Bangladesh" ||
                          cafe.location.includes("Dhaka")
                            ? "৳"
                            : "$"}{" "}
                          {cafe.avg_price}
                        </div>
                      )}

                      {cafe.has_parking && (
                        <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1.5">
                          <Car size={10} fill="currentColor" /> PARKING
                        </div>
                      )}
                    </div>

                    <div className="px-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-bold text-brand-primary leading-tight group-hover:text-brand-accent transition-colors">
                          {cafe.name}
                        </h3>
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

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12 gap-4">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white border border-brand-border rounded-xl font-bold text-brand-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <span className="px-4 py-3 text-brand-muted font-mono text-sm flex items-center">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white border border-brand-border rounded-xl font-bold text-brand-primary hover:bg-brand-surface disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
