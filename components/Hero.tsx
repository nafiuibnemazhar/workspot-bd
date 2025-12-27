"use client";

import { Search, MapPin, Briefcase, Globe, Code, PenTool } from "lucide-react";
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
    <div className="relative min-h-[700px] flex items-center justify-center bg-brand-primary overflow-hidden py-32 md:py-40">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-brand-muted text-sm font-semibold mb-10 backdrop-blur-sm animate-fade-in-up hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Live in Dhaka
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight tracking-tight animate-fade-in-up delay-100 drop-shadow-2xl">
          Find your perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-400">
            workspace
          </span>{" "}
          today.
        </h1>

        {/* Subhead */}
        <p className="text-xl md:text-2xl text-brand-muted mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-light">
          Discover curated cafes with fast{" "}
          <span className="text-white font-medium">Wifi</span>, reliable{" "}
          <span className="text-white font-medium">Power</span>, and great{" "}
          <span className="text-white font-medium">Coffee</span>.
        </p>

        {/* Search Bar - Glassmorphism */}
        <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up delay-300 transform transition-all hover:scale-[1.01] hover:bg-white/10">
          <div className="flex items-center gap-4 bg-brand-primary/40 rounded-xl px-5 py-4 border border-white/5 hover:border-brand-accent/50 transition-colors group">
            <MapPin
              className="text-brand-accent group-hover:scale-110 transition-transform shrink-0"
              size={24}
            />
            <input
              type="text"
              placeholder="Where do you want to work? (e.g. Gulshan)"
              className="bg-transparent w-full text-white placeholder:text-gray-500 focus:outline-none font-medium text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              className="bg-brand-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap shadow-lg shadow-brand-accent/20"
            >
              <Search size={20} />
              <span className="hidden md:inline">Search</span>
            </button>
          </div>
        </div>

        {/* PRO "Trusted By" Section */}
        <div className="mt-16 flex flex-col items-center animate-fade-in-up delay-400">
          <p className="text-sm font-semibold text-brand-muted/60 uppercase tracking-widest mb-6">
            Trusted by freelancers from
          </p>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Upwork Style */}
            <div className="flex items-center gap-2 group cursor-pointer transition-colors hover:text-[#14a800]">
              <Briefcase
                size={24}
                className="group-hover:text-[#14a800] transition-colors"
              />
              <span className="text-xl font-bold text-white group-hover:text-[#14a800] transition-colors">
                Upwork
              </span>
            </div>

            {/* Fiverr Style */}
            <div className="flex items-center gap-2 group cursor-pointer transition-colors hover:text-[#1dbf73]">
              <PenTool
                size={24}
                className="group-hover:text-[#1dbf73] transition-colors"
              />
              <span className="text-xl font-bold text-white group-hover:text-[#1dbf73] transition-colors tracking-tighter">
                fiverr
              </span>
            </div>

            {/* Toptal Style */}
            <div className="flex items-center gap-2 group cursor-pointer transition-colors hover:text-[#204ecf]">
              <Code
                size={24}
                className="group-hover:text-[#204ecf] transition-colors"
              />
              <span className="text-xl font-bold text-white group-hover:text-[#204ecf] transition-colors">
                Toptal
              </span>
            </div>

            {/* Freelancer Style */}
            <div className="flex items-center gap-2 group cursor-pointer transition-colors hover:text-[#29b2fe]">
              <Globe
                size={24}
                className="group-hover:text-[#29b2fe] transition-colors"
              />
              <span className="text-xl font-bold text-white group-hover:text-[#29b2fe] transition-colors">
                Freelancer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
