"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function CityHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const QUICK_LOCATIONS = [
    { name: "Cary, NC", path: "/locations/usa/nc/cary" },
    { name: "Gulshan", path: "/locations/bangladesh/dhaka/gulshan" },
    { name: "Frisco, TX", path: "/locations/usa/tx/frisco" },
    { name: "Banani", path: "/locations/bangladesh/dhaka/banani" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          placeholder="Search for another location..."
          className="w-full py-4 pl-12 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-300 focus:bg-white focus:text-brand-primary focus:placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-accent/30 transition-all shadow-lg backdrop-blur-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-brand-primary transition-colors"
          size={20}
        />
      </form>

      {/* QUICK JUMP CHIPS */}
      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider flex items-center opacity-80">
          Or jump to:
        </span>
        {QUICK_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => router.push(loc.path)}
            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-200 hover:bg-white hover:text-brand-primary hover:border-white transition-all cursor-pointer"
          >
            {loc.name}
          </button>
        ))}
      </div>
    </div>
  );
}
