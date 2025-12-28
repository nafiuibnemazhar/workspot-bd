"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";
import StarRating from "@/components/StarRating";
import ReviewSection from "@/components/ReviewSection";
import FavoriteButton from "@/components/FavoriteButton";
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
  X,
  Link as LinkIcon,
  Linkedin,
  Twitter,
  Send,
} from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";

const ViewMap = dynamic(() => import("@/components/ViewMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />,
});

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

const isOpenNow = (openTime: string, closeTime: string) => {
  if (!openTime || !closeTime) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(":").map(Number);
  const [closeH, closeM] = closeTime.split(":").map(Number);
  const openMinutes = openH * 60 + openM;
  let closeMinutes = closeH * 60 + closeM;
  if (closeMinutes < openMinutes) closeMinutes += 24 * 60;
  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
};

// --- ICONS ---
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
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      fill="#25D366"
    />
  </svg>
);
const MessengerIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 2C7.373 2 2 6.97 2 13.1c0 3.5 1.97 6.64 5.06 8.55-.23 1.18-.77 2.62-.81 2.73-.1.25.11.52.34.39 1.5-.8 3.35-1.59 4.38-1.93 1.07.3 2.21.46 3.4.46 6.63 0 12-4.97 12-11.1S20.63 2 14 2zm2 14.1l-3.1-3.3-6.1 3.3 6.7-7.1 3.1 3.3 6-3.3-6.6 7.1z"
      fill="#0099FF"
    />
  </svg>
);

export default function CafeDetails() {
  const params = useParams();
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

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

  const handleGetDirections = () => {
    if (!cafe) return;

    let url = "";

    if (cafe.latitude && cafe.longitude) {
      // Option A: Precise Navigation (Lat/Long)
      // "dir/?api=1" triggers the Route Finder
      // "destination" sets the target. Google automatically assumes "origin = My Location"
      url = `https://www.google.com/maps/dir/?api=1&destination=${cafe.latitude},${cafe.longitude}`;
    } else {
      // Option B: Search Navigation (Name + Address)
      const query = encodeURIComponent(`${cafe.name} ${cafe.location || ""}`);
      url = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    }

    window.open(url, "_blank");
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
    (currentUser.email === "admin@example.com" ||
      currentUser.id === cafe.owner_id);
  const openStatus = isOpenNow(cafe.opening_time, cafe.closing_time);

  return (
    <div className="min-h-screen bg-brand-surface font-sans relative">
      <Navbar />

      {isOwner && (
        <Link
          href={`/edit-cafe/${params.slug}`}
          className="fixed bottom-8 right-8 z-50 bg-brand-primary text-white px-6 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 hover:scale-105 hover:bg-brand-accent transition-all border-2 border-white/20 animate-fade-in-up cursor-pointer"
        >
          <Edit size={20} /> Edit Page
        </Link>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={cafe.name}
      />

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
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all flex items-center gap-2 cursor-pointer"
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
                  <div className="flex items-center gap-2">
                    {/* NEW FAVORITE BUTTON */}
                    <FavoriteButton cafeId={cafe.id} />
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-brand-primary transition-colors border border-gray-200 cursor-pointer"
                      title="Share this page"
                    >
                      <Share2 size={20} />
                    </button>
                  </div>
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

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-brand-border mb-8">
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

            <ReviewSection cafeId={cafe.id} />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-brand-border">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-brand-muted font-medium">Status</span>
                  <span
                    className={`text-lg font-extrabold ${
                      openStatus ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {openStatus ? "Open Now" : "Closed"}
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

                  {/* UPDATED PHONE SECTION - CLICKABLE */}
                  {cafe.contact_number && (
                    <a
                      href={`tel:${cafe.contact_number}`}
                      className="flex items-center gap-3 text-brand-muted hover:text-brand-primary transition-colors group cursor-pointer"
                    >
                      <div className="p-2 bg-gray-50 rounded-full group-hover:bg-brand-primary/10 transition-colors">
                        <Phone size={18} />
                      </div>
                      <span className="font-bold group-hover:underline">
                        {cafe.contact_number}
                      </span>
                    </a>
                  )}
                </div>

                <button
                  onClick={handleGetDirections}
                  className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
                >
                  <MapPin size={18} /> Get Directions
                </button>

                {(cafe.instagram_url ||
                  cafe.facebook_url ||
                  cafe.google_map) && (
                  <div className="flex items-center justify-center gap-4 mt-6">
                    {cafe.google_map && (
                      <a
                        href={cafe.google_map}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                        title="View Google Listing"
                      >
                        <GoogleIcon size={20} />
                      </a>
                    )}
                    {cafe.instagram_url && (
                      <a
                        href={cafe.instagram_url}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-pink-600 hover:bg-pink-50 hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                        title="Instagram"
                      >
                        <Instagram size={20} />
                      </a>
                    )}
                    {cafe.facebook_url && (
                      <a
                        href={cafe.facebook_url}
                        target="_blank"
                        className="p-3 rounded-full bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all border border-gray-100 cursor-pointer"
                        title="Facebook"
                      >
                        <Facebook size={20} />
                      </a>
                    )}
                  </div>
                )}
              </div>

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

function ShareModal({
  isOpen,
  onClose,
  url,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}) {
  if (!isOpen) return null;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`Check out ${title} on WorkSpot!`);
  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl transform transition-all scale-100 animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-brand-primary">
            Share this space
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <a
            href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#DCF8C6] flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
              <WhatsAppIcon size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">WhatsApp</span>
          </a>
          <a
            href={`fb-messenger://share/?link=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0099FF] group-hover:scale-110 transition-transform">
              <MessengerIcon size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">Messenger</span>
          </a>
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center text-[#24A1DE] group-hover:scale-110 transition-transform">
              <Send size={24} />
            </div>
            <span className="text-xs font-medium text-gray-600">Telegram</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1877F2] group-hover:scale-110 transition-transform">
              <Facebook size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">Feed</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
              <Twitter size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">X</span>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0A66C2] group-hover:scale-110 transition-transform">
              <Linkedin size={28} />
            </div>
            <span className="text-xs font-medium text-gray-600">LinkedIn</span>
          </a>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
          <span className="text-sm text-gray-500 truncate max-w-[200px]">
            {url}
          </span>
          <button
            onClick={handleCopy}
            className="text-brand-primary font-bold text-sm hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon size={14} /> Copy
          </button>
        </div>
      </div>
    </div>
  );
}
