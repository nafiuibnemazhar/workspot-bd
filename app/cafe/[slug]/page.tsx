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
  Phone,
  Edit,
} from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify"; // 1. IMPORT SANITIZER

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
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const slug = params?.slug;
      if (!slug) return;

      try {
        // Fetch User Session
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch Cafe Data
        const { data, error } = await supabase
          .from("cafes")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setError("This workspace does not exist.");
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

    fetchData();
  }, [params?.slug]);

  // Feature: Native Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cafe.name,
          text: `Check out ${cafe.name} on WorkSpot!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Feature: Google Maps
  const handleGetDirections = () => {
    if (!cafe) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`;
    window.open(url, "_blank");
  };

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
        <h2 className="text-2xl font-bold text-brand-primary mb-2">
          Workspace Not Found
        </h2>
        <p className="text-brand-muted mb-6">{error}</p>
        <Link
          href="/"
          className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold"
        >
          Back to Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-surface font-sans relative">
      <Navbar />

      {/* ADMIN BUTTON (Only visible to owner) */}
      {currentUser && currentUser.id === cafe.owner_id && (
        <Link
          href={`/edit-cafe/${params.slug}`}
          className="fixed bottom-8 right-8 z-50 bg-brand-primary text-white px-6 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 hover:scale-105 hover:bg-brand-accent transition-all border-2 border-white/20 animate-fade-in-up"
        >
          <Edit size={20} /> Edit Page
        </Link>
      )}

      {/* HERO IMAGE */}
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

      {/* MAIN CONTENT */}
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
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-brand-surface hover:bg-brand-border transition-colors text-brand-primary active:scale-95"
                  >
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

              {/* 2. RICH TEXT RENDERER */}
              {/* The 'prose' class automagically styles h1, h2, lists, bold, etc. */}
              <div
                className="prose prose-slate max-w-none text-brand-muted leading-relaxed prose-headings:text-brand-primary prose-a:text-brand-accent prose-strong:text-brand-primary"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    cafe.description || "No description provided."
                  ),
                }}
              />
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
                    <span>
                      {cafe.opening_time
                        ? `${formatTime(cafe.opening_time)} - ${formatTime(
                            cafe.closing_time
                          )}`
                        : "Hours not added"}
                    </span>
                  </div>

                  {cafe.contact_number && (
                    <div className="flex items-center gap-3 text-brand-muted">
                      <Phone size={18} />
                      <span>{cafe.contact_number}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGetDirections}
                  className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform active:scale-98"
                >
                  <MapPin size={18} /> Get Directions
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
// Helper: Convert "14:00:00" to "2:00 PM"
function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12; // Convert 0 to 12
  return `${h12}:${minutes} ${ampm}`;
}

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
