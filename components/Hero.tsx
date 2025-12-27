import Link from "next/link";
import { Search, MapPin, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative bg-brand-primary pt-40 pb-32 px-6 overflow-hidden">
      {/* 1. Ambient Background Glows (The "Wow" factor) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-brand-accent/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-marker/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto relative z-10 flex flex-col items-center text-center">
        {/* 2. Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-brand-accent text-xs font-bold tracking-wide uppercase mb-8 backdrop-blur-md animate-fade-in-up">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
          Live in Dhaka
        </div>

        {/* 3. Massive Typography */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Find your flow state in <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
            Dhaka's Best Spaces.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-brand-muted max-w-2xl mb-12 leading-relaxed">
          Curated workspaces with reliable{" "}
          <span className="text-white font-medium">High-Speed WiFi</span>,{" "}
          <span className="text-white font-medium">Generator Backup</span>, and
          the perfect ambiance for deep work.
        </p>

        {/* 4. The "Engineered" Search Bar */}
        <div className="w-full max-w-2xl p-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 transition-all hover:border-white/20 hover:bg-white/10 group">
          <div className="flex-1 flex items-center px-4 h-14 bg-brand-primary/50 rounded-xl border border-transparent group-hover:border-white/5 transition-all">
            <MapPin className="text-brand-muted mr-3" size={20} />
            <input
              type="text"
              placeholder="Where do you want to work? (e.g. Gulshan)"
              className="bg-transparent w-full text-white placeholder:text-brand-muted focus:outline-none font-medium"
            />
          </div>

          <button className="h-14 px-8 rounded-xl bg-brand-accent hover:bg-orange-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-accent/20 hover:scale-[1.02] active:scale-[0.98]">
            <Search size={20} />
            <span>Search Map</span>
          </button>
        </div>

        {/* 5. Quick Links */}
        <div className="mt-8 flex items-center gap-4 text-sm font-medium text-brand-muted">
          <span>Trending:</span>
          <div className="flex gap-2">
            {["Banani", "Dhanmondi", "Uttara"].map((area) => (
              <button
                key={area}
                className="px-3 py-1 rounded-full border border-white/10 hover:border-brand-accent hover:text-brand-accent transition-colors bg-white/5"
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Grid at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    </div>
  );
}
