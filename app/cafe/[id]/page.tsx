"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import {
  Wifi,
  Zap,
  Wind,
  Power,
  MapPin,
  Share2,
  Star,
  ArrowLeft,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Dynamic Map Import
const ViewMap = dynamic(() => import("@/components/ViewMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />,
});

export default function CafeDetails() {
  const params = useParams();
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCafe() {
      // 1. Get the ID safely
      const cafeId = params?.id;

      if (!cafeId) return;

      try {
        console.log("Fetching Cafe ID:", cafeId);

        const { data, error } = await supabase
          .from("cafes")
          .select("*")
          .eq("id", cafeId)
          .maybeSingle(); // Use maybeSingle() instead of single() to avoid crashes

        if (error) throw error;

        if (!data) {
          setError("This cafe does not exist.");
        } else {
          setCafe(data);
        }
      } catch (err: any) {
        console.error("Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCafe();
  }, [params?.id]);

  // --- RENDER STATES ---

  if (loading)
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-accent"></div>
      </div>
    );

  if (error || !cafe)
    return (
      <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <ArrowLeft size={24} />
        </div>
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Oops!</h2>
        <p className="text-brand-muted mb-6">
          {error || "We couldn't find that workspace."}
        </p>
        <Link
          href="/"
          className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-accent transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );

  // --- SUCCESS STATE (The actual page) ---
  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      {/* Hero Image */}
      <div className="relative h-[50vh] w-full bg-brand-primary">
        {cafe.cover_image ? (
          <img
            src={cafe.cover_image}
            className="w-full h-full object-cover opacity-80"
            alt={cafe.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl font-bold">
            No Image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-transparent to-transparent"></div>
        <div className="absolute top-24 left-6 md:left-20">
          <Link
            href="/"
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-brand-border mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-extrabold text-brand-primary mb-2">
                    {cafe.name}
                  </h1>
                  <p className="text-brand-muted flex items-center gap-2 text-lg">
                    <MapPin size={18} className="text-brand-accent" />
                    {cafe.address_text || "Dhaka, Bangladesh"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button className="p-3 rounded-full bg-brand-surface hover:bg-brand-border transition-colors text-brand-primary">
                    <Share2 size={20} />
                  </button>
                  <div className="flex items-center gap-1 font-bold text-brand-primary">
                    <Star
                      size={18}
                      className="text-brand-accent fill-brand-accent"
                    />{" "}
                    4.9
                  </div>
                </div>
              </div>

              <div className="border-t border-brand-border my-8"></div>

              <h3 className="text-xl font-bold text-brand-primary mb-4">
                About this space
              </h3>
              <p className="text-brand-muted leading-relaxed text-lg">
                {cafe.description || "No description provided."}
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-border">
              <h3 className="text-xl font-bold text-brand-primary mb-6">
                Amenities
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <AmenityItem
                  icon={<Wifi />}
                  label="Fast Wifi"
                  active={cafe.amenities?.wifi}
                />
                <AmenityItem
                  icon={<Zap />}
                  label="Generator"
                  active={cafe.amenities?.generator}
                />
                <AmenityItem
                  icon={<Wind />}
                  label="Air Con"
                  active={cafe.amenities?.ac}
                />
                <AmenityItem
                  icon={<Power />}
                  label="Outlets"
                  active={cafe.amenities?.outlets}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-brand-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-brand-muted font-medium">
                    Average Price
                  </span>
                  <span className="text-2xl font-extrabold text-brand-primary">
                    ৳ {cafe.avg_price}
                  </span>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-brand-muted">
                    <Clock size={18} />
                    <span>Open 9:00 AM - 10:00 PM</span>
                  </div>
                </div>
                <button className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors">
                  Get Directions
                </button>
              </div>

              <div className="bg-white rounded-3xl p-2 shadow-sm border border-brand-border h-64">
                <ViewMap
                  lat={cafe.latitude}
                  lng={cafe.longitude}
                  name={cafe.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Helper
function AmenityItem({
  icon,
  label,
  active,
}: {
  icon: any;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        active
          ? "border-brand-accent/30 bg-brand-accent/5"
          : "border-gray-100 opacity-50 grayscale"
      }`}
    >
      <div className={`${active ? "text-brand-accent" : "text-gray-400"}`}>
        {icon}
      </div>
      <span
        className={`font-bold ${
          active ? "text-brand-primary" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
