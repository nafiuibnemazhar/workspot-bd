"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  User,
  MapPin,
  Star,
  Store,
  Loader2,
  Calendar,
  ExternalLink,
  Globe,
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Facebook,
} from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [cafes, setCafes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("listings");

  useEffect(() => {
    async function fetchData() {
      const usernameOrId = params.username as string;

      // 1. Resolve Profile (Handle Username OR ID)
      let { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", usernameOrId)
        .maybeSingle();

      // Fallback: If no username match, try UUID
      if (!userProfile) {
        const { data: idProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", usernameOrId)
          .maybeSingle();
        userProfile = idProfile;
      }

      if (!userProfile) {
        setLoading(false);
        return; // User not found
      }

      setProfile(userProfile);

      // 2. Fetch User's Contributions (Cafes)
      const { data: userCafes } = await supabase
        .from("cafes")
        .select("*")
        .eq("owner_id", userProfile.id)
        .order("created_at", { ascending: false });
      setCafes(userCafes || []);

      // 3. Fetch User's Reviews
      const { data: userReviews } = await supabase
        .from("reviews")
        .select("*, cafes(name, slug, cover_image)")
        .eq("user_id", userProfile.id)
        .order("created_at", { ascending: false });
      setReviews(userReviews || []);

      setLoading(false);
    }

    fetchData();
  }, [params.username]);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-brand-primary font-bold">
        <Loader2 className="animate-spin mr-2" /> Loading Profile...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          User not found
        </h1>
        <p className="text-gray-500 mb-6">
          The explorer you are looking for has vanished.
        </p>
        <Link
          href="/"
          className="bg-brand-primary text-white px-6 py-2 rounded-lg font-bold"
        >
          Return Home
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="h-56 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl -mt-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* PROFILE HEADER */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                    alt={profile.full_name}
                  />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 w-full pt-4">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                {profile.full_name || "Anonymous User"}
              </h1>

              {/* PROFESSIONAL INFO BADGES */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {profile.username && (
                  <p className="text-brand-accent font-mono text-sm">
                    @{profile.username}
                  </p>
                )}
                {profile.role && (
                  <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                    {profile.role}
                  </span>
                )}
                {profile.work_status && (
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded border ${
                      profile.work_status === "Open to Work"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : profile.work_status === "Hiring"
                        ? "bg-purple-50 text-purple-700 border-purple-100"
                        : "bg-gray-50 text-gray-600 border-gray-100"
                    }`}
                  >
                    {profile.work_status}
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-lg">
                {profile.bio || "This user is busy exploring new workspaces."}
              </p>

              {/* SOCIAL LINKS */}
              <div className="flex gap-3 mb-6 flex-wrap">
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-brand-primary hover:text-white transition-colors text-gray-500"
                    title="Website"
                  >
                    <Globe size={16} />
                  </a>
                )}
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-gray-900 hover:text-white transition-colors text-gray-500"
                    title="GitHub"
                  >
                    <Github size={16} />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-[#0077b5] hover:text-white transition-colors text-gray-500"
                    title="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-black hover:text-white transition-colors text-gray-500"
                    title="Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                )}
                {profile.facebook_url && (
                  <a
                    href={profile.facebook_url}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-[#1877F2] hover:text-white transition-colors text-gray-500"
                    title="Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                )}
                {profile.instagram_url && (
                  <a
                    href={profile.instagram_url}
                    target="_blank"
                    className="p-2 bg-gray-50 rounded-full hover:bg-pink-600 hover:text-white transition-colors text-gray-500"
                    title="Instagram"
                  >
                    <Instagram size={16} />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2">
                  <Store size={18} className="text-brand-primary" />
                  <span className="text-gray-700">{cafes.length}</span>{" "}
                  Contributions
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-gray-400" />
                  <span className="text-gray-500">
                    Joined{" "}
                    {new Date(profile.updated_at || new Date()).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="border-t border-gray-100 px-8 flex gap-8">
            <button
              onClick={() => setActiveTab("listings")}
              className={`py-5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "listings"
                  ? "border-brand-accent text-brand-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Store size={16} /> Workspaces Found
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "reviews"
                  ? "border-brand-accent text-brand-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Star size={16} /> Reviews
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mt-8">
          {/* TAB 1: LISTINGS */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              {cafes.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">
                    No workspaces added yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cafes.map((cafe) => (
                    <Link
                      key={cafe.id}
                      href={`/cafe/${cafe.slug}`}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col h-full"
                    >
                      <div className="h-48 bg-gray-100 relative overflow-hidden">
                        <img
                          src={cafe.cover_image}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-brand-primary transition-colors">
                          {cafe.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                          <MapPin size={12} /> {cafe.city},{" "}
                          {cafe.country === "USA" ? cafe.state : "Dhaka"}
                        </p>
                        <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-gray-500">
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star size={12} fill="currentColor" />{" "}
                            {cafe.rating || "New"}
                          </span>
                          <span className="flex items-center gap-1 hover:text-brand-primary">
                            View Details <ExternalLink size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">
                    No reviews written yet.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6"
                  >
                    <img
                      src={review.cafes?.cover_image}
                      className="w-20 h-20 rounded-xl object-cover bg-gray-100 hidden sm:block"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={`/cafe/${review.cafes?.slug}`}
                          className="font-bold text-brand-primary hover:underline"
                        >
                          {review.cafes?.name}
                        </Link>
                        <div className="bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold text-yellow-700 flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {review.rating}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm italic">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
