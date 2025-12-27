"use client";

import { Search, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="relative min-h-[600px] flex items-center justify-center bg-brand-primary overflow-hidden pt-20">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-muted text-sm font-medium mb-8 backdrop-blur-sm animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live in Dhaka
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight animate-fade-in-up delay-100">
          Find your perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-400">
            workspace
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-brand-muted mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
          Discover the best cafes with fast wifi, generator backup, and good
          coffee. Curated for remote workers in Dhaka.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl animate-fade-in-up delay-300">
          <div className="flex items-center gap-4 bg-brand-primary/50 rounded-xl px-4 py-3 border border-white/5 hover:border-brand-accent/50 transition-colors group">
            <MapPin
              className="text-brand-accent group-hover:scale-110 transition-transform"
              size={24}
            />
            <input
              type="text"
              placeholder="Where do you want to work? (e.g. Gulshan)"
              className="bg-transparent w-full text-white placeholder:text-brand-muted focus:outline-none font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              className="bg-brand-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Search size={20} />
              <span className="hidden md:inline">Search Map</span>
            </button>
          </div>
        </div>

        {/* Trust/Social Proof */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all animate-fade-in-up delay-400">
          {/* You can add partner logos here later */}
          <p className="text-sm text-brand-muted">
            Trusted by freelancers from
          </p>
          <div className="flex gap-4 font-bold text-white/40">
            <span>Upwork</span>
            <span>•</span>
            <span>Fiverr</span>
            <span>•</span>
            <span>Toptal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
