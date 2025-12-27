"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Plus, LogOut, Map, Compass, Heart } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname(); // To check which page is active
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  // Helper to style active links
  const navClass = (path: string) =>
    `flex items-center gap-2 font-bold transition-colors ${
      pathname === path
        ? "text-brand-primary"
        : "text-gray-500 hover:text-brand-primary"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-white/20 z-50 h-20 px-6">
      <div className="container mx-auto h-full flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-brand-primary tracking-tighter flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="w-5 h-5"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          WorkSpot
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/search" className={navClass("/search")}>
            <Compass size={18} /> Explore
          </Link>
          <Link href="/map" className={navClass("/map")}>
            <Map size={18} /> Map View
          </Link>
          <Link href="/mission" className={navClass("/mission")}>
            <Heart size={18} /> Our Mission
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/add-cafe"
                className="hidden md:flex bg-brand-primary text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-brand-accent transition-colors items-center gap-2"
              >
                <Plus size={16} /> Add Space
              </Link>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  window.location.reload();
                }}
                className="text-gray-400 hover:text-red-500"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="font-bold text-brand-primary hover:text-brand-accent"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
