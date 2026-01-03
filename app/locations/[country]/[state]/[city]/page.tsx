import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  MapPin,
  Star,
  Wifi,
  Wind,
  Car,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import CityHeroSearch from "@/components/CityHeroSearch"; // <--- 1. IMPORT THIS

// CONSTANTS
const ITEMS_PER_PAGE = 12;

// TYPE DEFINITIONS
type Props = {
  params: Promise<{ country: string; state: string; city: string }>;
  searchParams: Promise<{ page?: string }>;
};

// --- HELPER: OPEN STATUS ---
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

// --- HELPER: CURRENCY ---
const getCurrency = (cafe: any) => {
  if (cafe.country === "Bangladesh" || cafe.city === "Dhaka") return "৳";
  return "$";
};

// 1. DYNAMIC METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, state, city } = await params;
  const cityDecoded = decodeURIComponent(city);
  const stateDecoded = state.toUpperCase();

  return {
    title: `Best Workspaces in ${cityDecoded}, ${stateDecoded} | WorkSpot`,
    description: `Top rated laptop-friendly cafes in ${cityDecoded}, ${stateDecoded}. Verified WiFi, power outlets, and ambiance for remote work.`,
    alternates: {
      canonical: `https://workspot-bd.com/locations/${country}/${state}/${city}`,
    },
  };
}

// 2. THE PAGE COMPONENT
export default async function CityPage({ params, searchParams }: Props) {
  const { country, state, city } = await params;
  const { page } = await searchParams;

  const cityDecoded = decodeURIComponent(city);
  const stateDecoded = state.toUpperCase();

  // PAGINATION LOGIC
  const currentPage = Number(page) || 1;
  const from = (currentPage - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  // --- QUERY BUILDER ---
  let query = supabase.from("cafes").select("*", { count: "exact" });

  // 1. LOCATION FILTER
  if (country.toLowerCase() === "bangladesh") {
    query = query.ilike("location", `%${cityDecoded}%`);
  } else {
    query = query.ilike("city", cityDecoded);
  }

  // 2. STATE FILTER (USA Only)
  if (country.toLowerCase() === "usa") {
    query = query.ilike("state", stateDecoded);
  }

  // 3. ORDERING & PAGINATION
  query = query.order("rating", { ascending: false }).range(from, to);

  const { data: cafes, count } = await query;

  const totalCafes = count || 0;
  const totalPages = Math.ceil(totalCafes / ITEMS_PER_PAGE);

  // --- SCHEMA ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Workspaces in ${cityDecoded}`,
    itemListElement: cafes?.map((cafe: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://workspot-bd.com/cafe/${cafe.slug}`,
      name: cafe.name,
      image: cafe.cover_image,
      description: `Laptop-friendly workspace in ${cafe.city}. Rating: ${cafe.rating}/5.`,
    })),
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans flex flex-col">
      <JsonLd data={jsonLd} />
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-brand-primary text-white pt-32 pb-16 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="text-brand-accent font-bold tracking-widest uppercase text-xs mb-4 block">
            Remote Work Guide
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 capitalize leading-tight">
            Workspaces in{" "}
            <span className="text-brand-accent">{cityDecoded}</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-6">
            We found <strong>{totalCafes}</strong> verified laptop-friendly
            spots in {cityDecoded}, {stateDecoded}.
          </p>

          {/* 2. ADD THE SEARCH COMPONENT HERE */}
          <CityHeroSearch />
        </div>
      </div>

      {/* LISTING SECTION */}
      <main className="grow container mx-auto px-6 py-16 max-w-6xl">
        {cafes && cafes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cafes.map((cafe: any) => {
                const openStatus = isOpenNow(
                  cafe.opening_time,
                  cafe.closing_time
                );
                const currency = getCurrency(cafe);

                const displayLocation =
                  cafe.country === "USA"
                    ? cafe.address_street || cafe.location
                    : cafe.location;

                return (
                  <Link
                    href={`/cafe/${cafe.slug}`}
                    key={cafe.id}
                    className="group flex flex-col gap-4 cursor-pointer"
                  >
                    {/* CARD IMAGE AREA */}
                    <div className="relative aspect-4/3 rounded-3xl overflow-hidden bg-gray-100 shadow-sm border border-brand-border/50">
                      {cafe.cover_image ? (
                        <img
                          src={cafe.cover_image}
                          alt={cafe.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-muted bg-gray-100 font-medium flex-col gap-2">
                          <Coffee size={32} />
                          <span className="text-xs">No Image</span>
                        </div>
                      )}

                      {/* Open/Closed Badge */}
                      {openStatus !== null && (
                        <div
                          className={`absolute top-4 left-4 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wide ${
                            openStatus ? "bg-green-500/90" : "bg-red-500/90"
                          }`}
                        >
                          {openStatus ? "Open Now" : "Closed"}
                        </div>
                      )}

                      {/* Price Badge */}
                      {cafe.avg_price > 0 && (
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-white/20">
                          {currency} {cafe.avg_price}
                        </div>
                      )}

                      {/* Parking Badge */}
                      {cafe.has_parking && (
                        <div className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1.5">
                          <Car size={10} fill="currentColor" /> PARKING
                        </div>
                      )}
                    </div>

                    {/* CARD CONTENT AREA */}
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
                        <MapPin
                          size={14}
                          className="text-brand-muted shrink-0"
                        />
                        <span className="truncate font-medium">
                          {displayLocation || "View for details"}
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
                            Amenities not listed
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
                {currentPage > 1 && (
                  <Link
                    href={`/locations/${country}/${state}/${city}?page=${
                      currentPage - 1
                    }`}
                    className="px-6 py-3 bg-white border border-brand-border rounded-xl font-bold text-brand-primary hover:bg-brand-surface flex items-center gap-2 transition-all shadow-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </Link>
                )}
                <span className="px-4 py-3 text-brand-muted font-mono text-sm flex items-center">
                  Page {currentPage} of {totalPages}
                </span>
                {currentPage < totalPages && (
                  <Link
                    href={`/locations/${country}/${state}/${city}?page=${
                      currentPage + 1
                    }`}
                    className="px-6 py-3 bg-white border border-brand-border rounded-xl font-bold text-brand-primary hover:bg-brand-surface flex items-center gap-2 transition-all shadow-sm"
                  >
                    Next <ChevronRight size={16} />
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-brand-border">
            <h3 className="text-xl font-bold text-brand-muted mb-2">
              No spots found in {cityDecoded} yet.
            </h3>
            <p className="text-brand-muted mb-6 text-sm">
              Be the first to contribute to this city!
            </p>
            <Link
              href="/add-cafe"
              className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-accent transition-all inline-flex items-center gap-2"
            >
              Add a Workspace
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
