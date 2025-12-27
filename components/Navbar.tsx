import Link from "next/link";
import { Plus } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-brand-primary/80 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 flex justify-between items-center shadow-2xl shadow-black/20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white font-bold transform group-hover:rotate-12 transition-transform">
              W.
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              WorkSpot
            </span>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
            <Link href="/" className="hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/map" className="hover:text-white transition-colors">
              Map View
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              Our Mission
            </Link>
          </div>

          {/* CTA Button */}
          <Link
            href="/add-cafe"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5 hover:border-white/10"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Space</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
