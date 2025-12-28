"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import StarRating from "@/components/StarRating";
import {
  Wifi,
  Wind,
  Power,
  MapPin,
  Share2,
  ArrowLeft,
  Clock,
  Phone,
  Edit,
  Car,
  Instagram,
  Facebook,
  Globe,
} from "lucide-react"; // Removed 'Map'
import Link from "next/link";
import DOMPurify from "dompurify";

// Dynamic Map Import
const ViewMap = dynamic(() => import("@/components/ViewMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />,
});

// Helper: Convert "14:00:00" to "2:00 PM"
function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12; // Convert 0 to 12
  return `${h12}:${minutes} ${ampm}`;
}

// Custom Google Icon Component
const GoogleIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21l.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUser(user);

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

  const handleGetDirections = () => {
    if (!cafe) return;
    if (cafe.latitude && cafe.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        cafe.name + " " + (cafe.location || "")
      )}`;
      window.open(url, "_blank");
    }
  };

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

  const isOwner =
    currentUser &&
    (currentUser.email === "your-email@gmail.com" ||
      currentUser.id === cafe.owner_id);

  return (
    <div className="min-h-screen bg-brand-surface font-sans relative">
      <Navbar />

      {isOwner && (
        <Link
          href={`/edit-cafe/${params.slug}`}
          className="fixed bottom-8 right-8 z-50 bg-brand-primary text-white px-6 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 hover:scale-105 hover:bg-brand-accent transition-all border-2 border-white/20 animate-fade-in-up"
        >
          <Edit size={20} /> Edit Page
        </Link>
      )}

      {/* HERO */}
      <div className="relative h-[50vh] w-full bg-brand-primary">
        {cafe.cover_image ? (
          <img
            src={cafe.cover_image}
            className="w-full h-full object-cover opacity-80"
            alt={cafe.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl font-bold">
            WorkSpot
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-transparent"></div>
        <div className="absolute top-24 left-6 md:left-20">
          <Link
            href="/"
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto px-6 -mt-32 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-brand-border mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                <div>
                  <h1 className="text-4xl font-extrabold text-brand-primary mb-2">
                    {cafe.name}
                  </h1>
                  <p className="text-brand-muted flex items-center gap-2 text-lg">
                    <MapPin size={18} className="text-brand-accent" />
                    {cafe.location || "Dhaka, Bangladesh"}
                  </p>
                </div>
                <div className="flex flex-row md:flex-col items-center md:items-end gap-3 w-full md:w-auto justify-between md:justify-start">
                  <div className="flex items-center gap-2">
                    <StarRating rating={cafe.rating} />
                  </div>
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-brand-primary transition-colors border border-gray-200"
                    title="Share this page"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="border-t border-brand-border my-8"></div>
              <h3 className="text-xl font-bold text-brand-primary mb-4">
                About this space
              </h3>
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
                  active={cafe.has_wifi}
                />
                <AmenityItem
                  icon={<Car />}
                  label="Parking"
                  active={cafe.has_parking}
                />
                <AmenityItem
                  icon={<Wind />}
                  label="Air Con"
                  active={cafe.has_ac}
                />
                <AmenityItem
                  icon={<Power />}
                  label="Outlets"
                  active={cafe.has_socket}
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-brand-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-brand-muted font-medium">Status</span>
                  <span className="text-lg font-extrabold text-brand-accent">
                    Open Now
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

                {/* SOCIAL BUTTONS */}
                {(cafe.instagram_url ||
                  cafe.facebook_url ||
                  cafe.google_map) && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    {/* Google Listing (Custom G Icon) */}
                    {cafe.google_map && (
                      <a
                        href={cafe.google_map}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md transition-all border border-gray-100"
                        title="View Google Listing"
                      >
                        <GoogleIcon size={20} />
                      </a>
                    )}

                    {/* Instagram */}
                    {cafe.instagram_url && (
                      <a
                        href={cafe.instagram_url}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:shadow-md transition-all border border-gray-100"
                        title="Instagram"
                      >
                        <Instagram size={20} />
                      </a>
                    )}

                    {/* Facebook */}
                    {cafe.facebook_url && (
                      <a
                        href={cafe.facebook_url}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all border border-gray-100"
                        title="Facebook"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="bg-white rounded-3xl p-2 shadow-sm border border-brand-border h-64 overflow-hidden relative z-0">
                {cafe.latitude && cafe.longitude ? (
                  <ViewMap
                    lat={cafe.latitude}
                    lng={cafe.longitude}
                    name={cafe.name}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-brand-muted flex-col gap-2">
                    <Globe size={32} className="opacity-20" />
                    <span className="text-sm">Map coordinates missing</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
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
          : "border-gray-100 opacity-40 grayscale"
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
