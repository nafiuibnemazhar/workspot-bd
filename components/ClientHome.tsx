'use client';

import { useState } from 'react';
import { Cafe } from '@/types';
import CafeCard from '@/components/CafeCard';
import SearchFilters from '@/components/SearchFilters';
import Navbar from '@/components/Navbar'; // Ensure you have this component created
import { Search, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ClientHome({ initialCafes }: { initialCafes: Cafe[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenerator, setFilterGenerator] = useState(false);

  // Filter Logic: Filters the REAL WordPress data
  const filteredCafes = initialCafes.filter((cafe) => {
    const matchesSearch = cafe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenerator = filterGenerator ? cafe.cafeSpecs.hasGenerator === true : true;
    return matchesSearch && matchesGenerator;
  });

  return (
    <div className="min-h-screen bg-brand-light">
      {/* 1. The Premium Navbar */}
      <Navbar />

      {/* 2. The Airbnb-Style Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden border-b border-brand-beige/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6 border border-brand-orange/20">
              <Star size={12} fill="currentColor" />
              Live in Dhaka
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-brand-dark tracking-tight mb-6 leading-[1.1]">
              Work from <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">
                Anywhere.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-brand-dark/60 mb-8 max-w-lg leading-relaxed">
              Discover the best remote-friendly cafes in Bangladesh. Filter by WiFi speed, generator availability, and noise levels.
            </p>

            {/* Decorative Search Bar (Visual Only - Real search is below) */}
            <div className="bg-white p-2 rounded-2xl shadow-xl border border-brand-beige/50 max-w-md flex items-center gap-2 mb-8 transform hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth'})}>
              <div className="pl-4 text-brand-dark/40">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                readOnly
                placeholder="Find your spot..." 
                className="flex-1 bg-transparent border-none focus:ring-0 text-brand-dark placeholder-brand-dark/30 h-12 font-medium cursor-pointer"
              />
              <button className="bg-brand-dark text-white h-12 px-6 rounded-xl font-bold hover:bg-brand-orange transition-colors">
                Explore
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-light bg-gray-300 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex text-yellow-500 text-xs">★★★★★</div>
                <span className="text-xs font-bold text-brand-dark/60">Trusted by 500+ Freelancers</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Abstract Stack */}
          <div className="relative hidden lg:block">
             {/* Decorative Blobs */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl -z-10 animate-pulse" />
             <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10" />
             
             {/* The "Card" Stack Effect */}
             <div className="relative z-10 grid gap-4 p-6 bg-white/40 backdrop-blur-sm rounded-3xl border border-white/50 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                {/* Visual Placeholder for a Cafe Card */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-beige">
                    <div className="h-48 bg-gray-200 rounded-xl mb-4 w-full object-cover relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop" className="object-cover w-full h-full" alt="Cafe" />
                        <div className="absolute top-2 right-2 bg-brand-dark text-white text-[10px] font-bold px-2 py-1 rounded-full">POWER SAFE</div>
                    </div>
                    <div className="h-6 w-3/4 bg-brand-dark/10 rounded mb-2" />
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-brand-orange/10 rounded-full" />
                        <div className="h-6 w-20 bg-green-100 rounded-full" />
                    </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. The "App Core" Section (Real Data) */}
      <section id="browse-section" className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Real Functionality: Search & Filter */}
        <SearchFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterGenerator={filterGenerator}
          setFilterGenerator={setFilterGenerator}
        />

        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-brand-dark">Available Spaces in Dhaka</h2>
            <span className="text-sm font-medium text-brand-dark/50">Showing {filteredCafes.length} verified spaces</span>
        </div>
        
        {/* The Grid: Connected to WordPress */}
        {filteredCafes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-brand-dark/20">
            <p className="text-brand-dark/60">No cafes found matching your filters.</p>
          </div>
        )}
      </section>

      {/* 4. Features Grid (Why Use Us) */}
      <section className="py-20 bg-white border-t border-brand-beige/30">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-brand-dark">Why Freelancers Love WorkSpot</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: "Generator Verified", desc: "We manually verify backup power so your work never stops during load shedding.", icon: "⚡" },
                    { title: "Speed Tested", desc: "We run speed tests on location. If it says 50Mbps, it is 50Mbps.", icon: "🚀" },
                    { title: "Quiet Zones", desc: "Filter by noise level. Find the perfect corner for that Zoom meeting.", icon: "🎧" }
                ].map((feature, idx) => (
                    <div key={idx} className="p-8 rounded-3xl bg-brand-light border border-brand-beige/50 hover:border-brand-orange/30 transition-colors group hover:-translate-y-1 duration-300">
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">{feature.icon}</div>
                        <h3 className="text-xl font-bold text-brand-dark mb-2">{feature.title}</h3>
                        <p className="text-brand-dark/60 leading-relaxed">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}