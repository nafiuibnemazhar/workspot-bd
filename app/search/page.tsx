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
  SlidersHorizontal,
  ChevronDown,
  Power,
} from "lucide-react";

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading Search...</div>}
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

  // Advanced State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("newest"); // 'newest', 'price_asc', 'price_desc'
  const [filters, setFilters] = useState({
    wifi: searchParams.get("wifi") === "true",
    generator: searchParams.get("generator") === "true",
    ac: searchParams.get("ac") === "true",
    outlets: searchParams.get("outlets") === "true",
    price: "all", // 'all', 'budget' (<300), 'mid' (300-600), 'premium' (>600)
  });

  // Fetch Logic
  useEffect(() => {
    async function fetchResults() {
      setLoading(true);

      let dbQuery = supabase.from("cafes").select("*");

      // 1. Text Search
      if (query) {
        dbQuery = dbQuery.or(
          `name.ilike.%${query}%,address_text.ilike.%${query}%`
        );
      }

      // 2. JSON Filters
      if (filters.wifi) dbQuery = dbQuery.contains("amenities", { wifi: true });
      if (filters.generator)
        dbQuery = dbQuery.contains("amenities", { generator: true });
      if (filters.ac) dbQuery = dbQuery.contains("amenities", { ac: true });
      if (filters.outlets)
        dbQuery = dbQuery.contains("amenities", { outlets: true });

      // 3. Price Filter (Manual logic usually, but here is basic DB logic)
      if (filters.price === "budget") dbQuery = dbQuery.lt("avg_price", 300);
      if (filters.price === "mid")
        dbQuery = dbQuery.gte("avg_price", 300).lte("avg_price", 600);
      if (filters.price === "premium") dbQuery = dbQuery.gt("avg_price", 600);

      // 4. Sorting
      if (sort === "newest")
        dbQuery = dbQuery.order("created_at", { ascending: false });
      if (sort === "price_asc")
        dbQuery = dbQuery.order("avg_price", { ascending: true });
      if (sort === "price_desc")
        dbQuery = dbQuery.order("avg_price", { ascending: false });

      const { data, error } = await dbQuery;

      if (error) console.error(error);
      else setCafes(data || []);

      setLoading(false);
    }

    const timer = setTimeout(() => fetchResults(), 400);
    return () => clearTimeout(timer);
  }, [query, filters, sort]);

  // URL Sync Helper
  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // In a real app, you'd update URL params here too
  };

  return (
    <div className="min-h-screen bg-brand-surface font-sans pb-20">
      <Navbar />

      {/* 1. COMPACT HEADER */}
      <div className="bg-brand-primary pt-28 pb-8 px-6 sticky top-0 z-20 shadow-xl">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search area or cafe..."
                className="w-full p-3 pl-10 rounded-xl border-none focus:ring-2 focus:ring-brand-accent bg-white/10 text-white placeholder:text-brand-muted font-medium"
              />
              <Search
                className="absolute left-3 top-3.5 text-brand-muted"
                size={18}
              />
            </div>

            {/* Mobile Filter Toggle */}
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
        {/* 2. SIDEBAR FILTERS (Desktop) */}
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

          {/* Amenities Filter */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <h3 className="font-bold text-brand-primary mb-4">Amenities</h3>
            <div className="space-y-3">
              <Checkbox
                label="Fast Wifi"
                icon={<Wifi size={16} />}
                checked={filters.wifi}
                onChange={() => updateFilter("wifi", !filters.wifi)}
              />
              <Checkbox
                label="Generator"
                icon={<Zap size={16} />}
                checked={filters.generator}
                onChange={() => updateFilter("generator", !filters.generator)}
              />
              <Checkbox
                label="Air Con"
                icon={<Wind size={16} />}
                checked={filters.ac}
                onChange={() => updateFilter("ac", !filters.ac)}
              />
              <Checkbox
                label="Power Outlets"
                icon={<Power size={16} />}
                checked={filters.outlets}
                onChange={() => updateFilter("outlets", !filters.outlets)}
              />
            </div>
          </div>

          {/* Clear Button */}
          <button
            onClick={() =>
              setFilters({
                wifi: false,
                generator: false,
                ac: false,
                outlets: false,
                price: "all",
              })
            }
            className="w-full py-2 text-sm font-bold text-gray-400 hover:text-brand-primary transition-colors"
          >
            Reset Filters
          </button>
        </div>

        {/* 3. RESULTS COLUMN */}
        <div className="md:col-span-3">
          {/* Results Header */}
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

          {/* Cards Grid */}
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
                  {/* Card Image */}
                  <div className="relative h-48 rounded-2xl overflow-hidden mb-4 bg-gray-100">
                    {cafe.cover_image ? (
                      <img
                        src={cafe.cover_image}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}

                    <div className="absolute top-3 right-3 bg-white/95 px-3 py-1 rounded-full text-xs font-bold text-brand-primary shadow-sm border border-gray-100">
                      ৳ {cafe.avg_price}
                    </div>

                    {cafe.amenities?.wifi && (
                      <div className="absolute bottom-3 left-3 bg-brand-primary/90 p-1.5 rounded-lg text-white backdrop-blur-md">
                        <Wifi size={14} />
                      </div>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-brand-primary truncate pr-2">
                      {cafe.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                      <Star size={10} fill="currentColor" /> 4.9
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-brand-muted mb-4">
                    <MapPin size={14} className="text-brand-accent" />{" "}
                    {cafe.address_text}
                  </div>

                  {/* Mini Tags */}
                  <div className="flex flex-wrap gap-2">
                    {cafe.amenities?.generator && (
                      <AmenityTag label="Generator" />
                    )}
                    {cafe.amenities?.ac && <AmenityTag label="AC" />}
                    {cafe.amenities?.outlets && <AmenityTag label="Power" />}
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

// Sub-components for cleaner code
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
