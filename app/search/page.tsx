"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  Search,
  MapPin,
  Wifi,
  Zap,
  Wind,
  Star,
  Filter,
  X,
  Car, // Added Car icon
  Power,
} from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-brand-primary">
          Loading Search...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cafes, setCafes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // 1. STATE MATCHING REAL DB SCHEMA
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState({
    has_wifi: searchParams.get("wifi") === "true",
    has_ac: searchParams.get("ac") === "true",
    has_parking: searchParams.get("parking") === "true",
    has_socket: searchParams.get("socket") === "true",
    price: searchParams.get("price") || "all",
  });

  // 2. FETCH LOGIC
  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      let dbQuery = supabase.from("cafes").select("*");

      // A. Text Search (Name OR Location)
      if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%`);
      }

      // B. Boolean Filters (Real Columns)
      if (filters.has_wifi) dbQuery = dbQuery.eq("has_wifi", true);
      if (filters.has_ac) dbQuery = dbQuery.eq("has_ac", true);
      if (filters.has_parking) dbQuery = dbQuery.eq("has_parking", true);
      if (filters.has_socket) dbQuery = dbQuery.eq("has_socket", true);

      // C. Price Filter
      if (filters.price === "budget") dbQuery = dbQuery.lt("avg_price", 300);
      if (filters.price === "mid")
        dbQuery = dbQuery.gte("avg_price", 300).lte("avg_price", 600);
      if (filters.price === "premium") dbQuery = dbQuery.gt("avg_price", 600);

      // D. Sorting
      if (sort === "newest")
        dbQuery = dbQuery.order("created_at", { ascending: false });
      if (sort === "price_asc")
        dbQuery = dbQuery.order("avg_price", { ascending: true });
      if (sort === "price_desc")
        dbQuery = dbQuery.order("avg_price", { ascending: false });

      const { data, error } = await dbQuery;

      if (error) console.error("Search Error:", error);
      else setCafes(data || []);

      setLoading(false);
    }

    // Debounce to prevent too many requests while typing
    const timer = setTimeout(() => fetchResults(), 400);
    return () => clearTimeout(timer);
  }, [query, filters, sort]);

  // 3. UPDATE URL & STATE
  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL Params for shareability
    const params = new URLSearchParams(searchParams.toString());

    // Handle Boolean Filters
    if (key === "has_wifi")
      value ? params.set("wifi", "true") : params.delete("wifi");
    if (key === "has_ac")
      value ? params.set("ac", "true") : params.delete("ac");
    if (key === "has_parking")
      value ? params.set("parking", "true") : params.delete("parking");
    if (key === "has_socket")
      value ? params.set("socket", "true") : params.delete("socket");

    // Handle Price
    if (key === "price")
      value !== "all" ? params.set("price", value) : params.delete("price");

    // Handle Query
    if (key === "q") value ? params.set("q", value) : params.delete("q");

    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans pb-20">
      <Navbar />

      {/* HEADER & SEARCH BAR */}
      <div className="bg-brand-primary pt-28 pb-8 px-6 sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  updateFilter("q", e.target.value);
                }}
                placeholder="Search area (e.g. Banani) or cafe name..."
                className="w-full p-3 pl-10 rounded-xl border-none focus:ring-2 focus:ring-brand-accent bg-white/10 text-white placeholder:text-brand-muted font-medium"
              />
              <Search
                className="absolute left-3 top-3.5 text-brand-muted"
                size={18}
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="md:hidden w-full bg-white/10 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <Filter size={18} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR FILTERS */}
        <div
          className={`md:block ${
            mobileFiltersOpen ? "block" : "hidden"
          } md:col-span-1 space-y-8`}
        >
          {/* Price Filter */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4">Price Range</h3>
            <div className="space-y-2">
              {["all", "budget", "mid", "premium"].map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="price"
                    checked={filters.price === p}
                    onChange={() => updateFilter("price", p)}
                    className="text-brand-accent focus:ring-brand-accent"
                  />
                  <span className="text-sm font-medium text-gray-600 group-hover:text-brand-primary capitalize">
                    {p === "all"
                      ? "Any Price"
                      : p === "mid"
                      ? "৳300 - ৳600"
                      : p === "budget"
                      ? "Under ৳300"
                      : "Over ৳600"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities Filter (REAL COLUMNS) */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4">Amenities</h3>
            <div className="space-y-3">
              <Checkbox
                label="Fast Wifi"
                icon={<Wifi size={16} />}
                checked={filters.has_wifi}
                onChange={() => updateFilter("has_wifi", !filters.has_wifi)}
              />
              <Checkbox
                label="Air Con"
                icon={<Wind size={16} />}
                checked={filters.has_ac}
                onChange={() => updateFilter("has_ac", !filters.has_ac)}
              />
              <Checkbox
                label="Parking"
                icon={<Car size={16} />}
                checked={filters.has_parking}
                onChange={() =>
                  updateFilter("has_parking", !filters.has_parking)
                }
              />
              <Checkbox
                label="Power Outlets"
                icon={<Power size={16} />}
                checked={filters.has_socket}
                onChange={() => updateFilter("has_socket", !filters.has_socket)}
              />
            </div>
          </div>

          <button
            onClick={() => {
              setFilters({
                has_wifi: false,
                has_ac: false,
                has_parking: false,
                has_socket: false,
                price: "all",
              });
              setQuery("");
              router.replace("/search"); // Clear URL
            }}
            className="w-full py-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* RESULTS GRID */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brand-primary">
              {loading ? "Searching..." : `${cafes.length} places found`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 hidden sm:inline">
                Sort by:
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-white border border-brand-border rounded-lg px-3 py-2 text-sm font-bold text-brand-primary focus:outline-none focus:border-brand-accent"
              >
                <option value="newest">Newest Added</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-72 bg-gray-200 rounded-3xl animate-pulse"
                />
              ))}
            </div>
          ) : cafes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-brand-border">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-brand-primary">
                No matches found
              </h3>
              <p className="text-brand-muted">
                Try adjusting your filters or search for a different area.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {cafes.map((cafe) => (
                <Link
                  href={`/cafe/${cafe.slug}`}
                  key={cafe.id}
                  className="group bg-white rounded-3xl p-4 border border-brand-border hover:shadow-xl transition-all hover:-translate-y-1 block"
                >
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    {cafe.cover_image ? (
                      <img
                        src={cafe.cover_image}
                        alt={cafe.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                        No Image
                      </div>
                    )}

                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-gray-100">
                      ৳ {cafe.avg_price}
                    </div>

                    {cafe.has_wifi && (
                      <div className="absolute bottom-3 left-3 bg-brand-primary/90 p-1.5 rounded-lg text-white backdrop-blur-md">
                        <Wifi size={14} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-brand-primary truncate pr-2">
                      {cafe.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      <Star size={10} fill="currentColor" />{" "}
                      {cafe.rating || "New"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-brand-muted mb-4">
                    <MapPin size={14} className="text-brand-accent" />{" "}
                    {cafe.location}
                  </div>

                  {/* Real DB Columns for Tags */}
                  <div className="flex flex-wrap gap-2">
                    {cafe.has_wifi && <AmenityTag label="Wifi" />}
                    {cafe.has_ac && <AmenityTag label="AC" />}
                    {cafe.has_parking && <AmenityTag label="Parking" />}
                    {cafe.has_socket && <AmenityTag label="Power" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange, icon }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors -ml-2">
      <div
        className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
          checked
            ? "bg-brand-primary border-brand-primary"
            : "border-gray-300 bg-white"
        }`}
      >
        {checked && <X size={12} className="text-white rotate-45" />}
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-brand-primary">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}

function AmenityTag({ label }: { label: string }) {
  return (
    <span className="text-[10px] uppercase tracking-wider font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
      {label}
    </span>
  );
}
