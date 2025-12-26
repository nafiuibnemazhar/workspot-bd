import Link from 'next/link';
import { MapPin, PlusCircle, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-brand-light/80 backdrop-blur-md border-b border-brand-beige/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-brand-orange text-white p-1.5 rounded-lg group-hover:rotate-3 transition-transform">
            <MapPin size={20} fill="currentColor" />
          </div>
          <span className="text-xl font-extrabold text-brand-dark tracking-tight">
            WorkSpot<span className="text-brand-orange">BD</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">
            Explore Map
          </Link>
          <Link href="/features" className="text-sm font-semibold text-brand-dark/70 hover:text-brand-dark transition-colors">
            Features
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-bold text-brand-dark hover:text-brand-orange transition-colors">
            <User size={18} />
            Sign In
          </Link>
          <Link href="/add-cafe" className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-orange transition-all shadow-lg hover:shadow-brand-orange/20 hover:-translate-y-0.5">
            <PlusCircle size={16} />
            Add Your Cafe
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;