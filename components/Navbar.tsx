"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  User,
  Map as MapIcon,
  Compass,
  ChevronDown,
  Globe,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);

  // Data States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{
    avatar_url: string | null;
    full_name: string | null;
  }>({ avatar_url: null, full_name: null });
  const [dynamicLocations, setDynamicLocations] = useState<{
    usa: any[];
    bd: any[];
  }>({ usa: [], bd: [] });

  const [isScrolled, setIsScrolled] = useState(false);

  // 1. Initial Data Fetch (Auth + Locations)
  useEffect(() => {
    async function initData() {
      // A. Auth
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }

      // B. Dynamic Locations
      const { data: cafes } = await supabase
        .from("cafes")
        .select("city, state, country, location");

      if (cafes) {
        const grouped = processLocations(cafes);
        setDynamicLocations(grouped);
      }
    }

    initData();
    window.addEventListener("user-updated", initData);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("user-updated", initData);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (pathname?.includes("/admin")) return null;

  // Logic: Force "Solid Mode" on specific pages
  const isAlwaysSolid =
    pathname === "/map" ||
    pathname === "/add-cafe" ||
    pathname === "/gigs" ||
    pathname === "/profile" ||
    pathname?.includes("/locations/") ||
    pathname?.startsWith("/edit-cafe");
  const showSolidNav = isScrolled || isOpen || isAlwaysSolid;
  const firstName = profile.full_name
    ? profile.full_name.split(" ")[0]
    : "My Account";

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 border-b ${
          showSolidNav
            ? "bg-white/95 backdrop-blur-md border-gray-100 shadow-sm py-2"
            : "bg-transparent border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-2 group z-50">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all group-hover:rotate-12 ${
                  showSolidNav
                    ? "bg-brand-primary text-white shadow-brand-primary/20"
                    : "bg-white text-brand-primary"
                }`}
              >
                W
              </div>
              <span
                className={`text-xl font-extrabold tracking-tight transition-colors ${
                  showSolidNav ? "text-brand-primary" : "text-white"
                }`}
              >
                WorkSpot
              </span>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink
                href="/search"
                icon={<Search size={16} />}
                label="Search"
                isDark={showSolidNav}
              />
              <NavLink
                href="/map"
                icon={<MapIcon size={16} />}
                label="Map"
                isDark={showSolidNav}
              />

              {/* --- DYNAMIC LOCATIONS DROPDOWN (Hover) --- */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => setIsLocationsOpen(true)}
                onMouseLeave={() => setIsLocationsOpen(false)}
              >
                <button
                  className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-default ${
                    isLocationsOpen
                      ? showSolidNav
                        ? "bg-brand-primary/5 text-brand-primary"
                        : "bg-white/20 text-white"
                      : showSolidNav
                      ? "text-gray-500 hover:text-brand-primary hover:bg-gray-50"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Globe size={16} /> Locations{" "}
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${
                      isLocationsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Content */}
                <div
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-200 ${
                    isLocationsOpen
                      ? "opacity-100 visible translate-y-0"
                      : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="w-72 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-5 grid gap-6">
                      {/* USA Section */}
                      {dynamicLocations.usa.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            <span className="text-lg leading-none">🇺🇸</span>{" "}
                            United States
                          </div>
                          <div className="space-y-1">
                            {dynamicLocations.usa.map((city) => (
                              <Link
                                key={city.url}
                                href={city.url}
                                onClick={() => setIsLocationsOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                {city.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* BD Section */}
                      {dynamicLocations.bd.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            <span className="text-lg leading-none">🇧🇩</span>{" "}
                            Bangladesh
                          </div>
                          <div className="space-y-1">
                            {dynamicLocations.bd.map((city) => (
                              <Link
                                key={city.url}
                                href={city.url}
                                onClick={() => setIsLocationsOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                              >
                                {city.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Link
                      href="/map"
                      className="block p-3 bg-gray-50 text-center text-xs font-bold text-brand-accent hover:underline border-t border-gray-100 hover:bg-orange-50 transition-colors"
                    >
                      View Global Map →
                    </Link>
                  </div>
                </div>
              </div>

              <NavLink
                href="/mission"
                icon={<Compass size={16} />}
                label="Mission"
                isDark={showSolidNav}
              />

              <div
                className={`w-px h-6 mx-4 transition-colors ${
                  showSolidNav ? "bg-gray-200" : "bg-white/20"
                }`}
              ></div>

              {/* AUTH SECTION */}
              {user ? (
                <Link
                  href="/profile"
                  className={`flex items-center gap-3 pl-2 py-1 pr-1 rounded-full border transition-all group ${
                    showSolidNav
                      ? "border-transparent hover:bg-gray-50 hover:border-gray-200"
                      : "border-white/20 hover:bg-white/10 hover:border-white/40"
                  }`}
                >
                  <span
                    className={`text-sm font-bold pl-2 ${
                      showSolidNav ? "text-gray-700" : "text-white"
                    }`}
                  >
                    {firstName}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full border-2 shadow-sm overflow-hidden group-hover:scale-105 transition-transform ${
                      showSolidNav
                        ? "bg-gray-100 border-white"
                        : "bg-white/10 border-white/50"
                    }`}
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${
                          showSolidNav ? "text-gray-400" : "text-white/70"
                        }`}
                      >
                        <User size={18} />
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ml-2 ${
                    showSolidNav
                      ? "bg-brand-primary text-white hover:bg-brand-accent hover:shadow-brand-accent/20"
                      : "bg-white text-brand-primary hover:bg-gray-100"
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors z-50 ${
                showSolidNav
                  ? "text-brand-primary bg-gray-50 hover:bg-gray-100"
                  : "text-white bg-white/10 hover:bg-white/20"
              }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 md:hidden pt-28 px-6 overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 text-center pb-20">
          <MobileLink href="/search" onClick={() => setIsOpen(false)}>
            Explore Spaces
          </MobileLink>
          <MobileLink href="/map" onClick={() => setIsOpen(false)}>
            View Map
          </MobileLink>

          {/* MOBILE LOCATIONS LIST (Dynamic) */}
          <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
            <div className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
              <Globe size={12} /> Top Locations
            </div>
            <div className="grid grid-cols-2 gap-4">
              {dynamicLocations.usa.length > 0 && (
                <div>
                  <div className="font-bold text-brand-primary mb-2 text-sm">
                    🇺🇸 USA
                  </div>
                  {dynamicLocations.usa.map((c) => (
                    <Link
                      key={c.url}
                      href={c.url}
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-600 py-1 text-sm hover:text-brand-accent truncate"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {dynamicLocations.bd.length > 0 && (
                <div>
                  <div className="font-bold text-brand-primary mb-2 text-sm">
                    🇧🇩 BD
                  </div>
                  {dynamicLocations.bd.map((c) => (
                    <Link
                      key={c.url}
                      href={c.url}
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-600 py-1 text-sm hover:text-brand-accent truncate"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MobileLink href="/mission" onClick={() => setIsOpen(false)}>
            Our Mission
          </MobileLink>
          <hr className="border-gray-100 my-2" />
          {user ? (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100"
            >
              <div className="w-12 h-12 rounded-full bg-white border border-gray-200 overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User size={24} />
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold text-brand-primary text-lg">
                  {profile.full_name || "My Profile"}
                </p>
                <p className="text-xs text-gray-500">Manage saved places</p>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-primary/20"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

// --- HELPER: PROCESS RAW CAFES INTO MENU ITEMS ---
function processLocations(cafes: any[]) {
  const usaMap = new Map();
  const bdMap = new Map();

  // UPDATED: Added Agargaon, Bashundhara, and other common Dhaka hubs
  const dhakaHubs = [
    "Gulshan",
    "Banani",
    "Dhanmondi",
    "Uttara",
    "Mirpur",
    "Mohakhali",
    "Badda",
    "Agargaon",
    "Bashundhara",
    "Lalmatia",
    "Mohammadpur",
    "Khilgaon",
    "Farmgate",
    "Baridhara",
    "Niketon",
    "Rampura",
    "Puran Dhaka",
  ];

  cafes.forEach((c) => {
    if (c.country === "USA" || (c.location && c.location.includes("USA"))) {
      if (c.city && c.state) {
        const name = `${c.city}, ${c.state}`;
        const url = `/locations/usa/${c.state.toLowerCase()}/${c.city
          .toLowerCase()
          .replace(/ /g, "-")}`;
        usaMap.set(name, {
          name,
          url,
          count: (usaMap.get(name)?.count || 0) + 1,
        });
      }
    } else {
      // BD Logic
      const locLower = (c.location || "").toLowerCase();
      const matchedHub = dhakaHubs.find((h) =>
        locLower.includes(h.toLowerCase())
      );

      if (matchedHub) {
        const url = `/locations/bangladesh/dhaka/${matchedHub.toLowerCase()}`;
        bdMap.set(matchedHub, {
          name: matchedHub,
          url,
          count: (bdMap.get(matchedHub)?.count || 0) + 1,
        });
      }
    }
  });

  // Convert to arrays, sort by count, take top 6 (Increased from 5)
  const usa = Array.from(usaMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const bd = Array.from(bdMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return { usa, bd };
}

// --- SUB COMPONENTS ---
function NavLink({ href, icon, label, isDark }: any) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
        isActive
          ? isDark
            ? "bg-brand-primary/5 text-brand-primary"
            : "bg-white/20 text-white"
          : isDark
          ? "text-gray-500 hover:text-brand-primary hover:bg-gray-50"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      {icon} {label}
    </Link>
  );
}

function MobileLink({ href, children, onClick }: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-2xl font-bold text-gray-800 hover:text-brand-primary transition-colors"
    >
      {children}
    </Link>
  );
}
