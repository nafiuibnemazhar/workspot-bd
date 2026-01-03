"use client";

import {
  Search,
  MapPin,
  Briefcase,
  Globe,
  Code,
  PenTool,
  Users,
  Building2,
  Map,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="relative min-h-[800px] flex flex-col justify-center bg-brand-primary overflow-hidden pt-32 md:pt-40 pb-20">
      {/* 1. Background Effects (Original Brand Colors) */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-accent/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 text-center flex-1 flex flex-col justify-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-muted text-sm font-bold mb-8 backdrop-blur-sm animate-fade-in-up hover:bg-white/10 transition-colors cursor-default mx-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent"></span>
          </span>
          <span className="text-brand-accent">Now Live:</span> Global Talent
          Network
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight animate-fade-in-up delay-100 drop-shadow-2xl">
          Work from <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-400">
            Anywhere.
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-2xl text-brand-muted mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-medium">
          The all-in-one platform to find verified{" "}
          <span className="text-white">workspaces</span>, land remote{" "}
          <span className="text-white">gigs</span>, and connect with local{" "}
          <span className="text-white">creatives</span>.
        </p>

        {/* Search Bar - Glassmorphism */}
        <div className="max-w-2xl mx-auto w-full bg-white/5 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up delay-300 transform transition-all hover:scale-[1.01] hover:bg-white/10 mb-12">
          <div className="flex items-center gap-4 bg-brand-primary/40 rounded-xl px-5 py-4 border border-white/5 hover:border-brand-accent/50 transition-colors group focus-within:border-brand-accent focus-within:ring-1 focus-within:ring-brand-accent">
            <Search
              className="text-brand-muted group-focus-within:text-brand-accent transition-colors shrink-0"
              size={24}
            />
            <input
              type="text"
              placeholder="Search cities (e.g. Cary, Dhaka, Seattle)..."
              className="bg-transparent w-full text-white placeholder:text-gray-500 focus:outline-none font-bold text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              className="hidden md:flex bg-brand-accent hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold transition-all items-center gap-2 active:scale-95 whitespace-nowrap shadow-lg shadow-brand-accent/20"
            >
              Explore
            </button>
          </div>
        </div>

        {/* Quick Links / CTAs */}
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up delay-400 mb-20">
          <Link
            href="/map"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            <Map
              size={18}
              className="text-brand-accent group-hover:scale-110 transition-transform"
            />
            Browse Map
          </Link>
          <Link
            href="/gigs"
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2 group"
          >
            <Briefcase
              size={18}
              className="text-purple-400 group-hover:scale-110 transition-transform"
            />
            Find Jobs
          </Link>
        </div>

        {/* Community Stats (Footer of Hero) */}
        <div className="border-t border-white/5 pt-10 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up delay-500">
          <StatItem
            icon={<Building2 size={20} />}
            value="120+"
            label="Workspaces"
          />
          <StatItem
            icon={<Briefcase size={20} />}
            value="45+"
            label="Remote Jobs"
          />
          <StatItem icon={<Users size={20} />} value="850+" label="Members" />
          <StatItem icon={<Globe size={20} />} value="12" label="Cities" />
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, value, label }: any) {
  return (
    <div className="flex flex-col items-center gap-1 group cursor-default">
      <div className="text-brand-muted mb-1 group-hover:text-brand-accent transition-colors">
        {icon}
      </div>
      <span className="text-2xl md:text-3xl font-black text-white">
        {value}
      </span>
      <span className="text-xs font-bold text-brand-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
