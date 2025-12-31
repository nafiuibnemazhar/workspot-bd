"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  User,
  MapPin,
  Star,
  Heart,
  Edit2,
  Loader2,
  Camera,
  LogOut,
  Settings,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("reviews"); // 'reviews' | 'favorites'

  // Data States
  const [profile, setProfile] = useState<any>({});
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  // Form State (for editing)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    website: "",
  });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);

    // 1. Fetch Profile Details
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || "",
        bio: profileData.bio || "",
        website: profileData.website || "",
      });
    }

    // 2. Fetch User Reviews
    const { data: userReviews } = await supabase
      .from("reviews")
      .select("*, cafes(name, slug, cover_image)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReviews(userReviews || []);

    // 3. Fetch Favorites
    const { data: userFavs } = await supabase
      .from("favorites")
      .select("*, cafes(*)") // Get full cafe details
      .eq("user_id", user.id);
    setFavorites(userFavs || []);

    setLoading(false);
  }

  // --- ACTIONS ---

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);

    const updates = {
      id: user.id, // ID is required for upsert
      full_name: editForm.full_name,
      bio: editForm.bio,
      website: editForm.website,
      updated_at: new Date().toISOString(),
    };

    // UPSERT: Create if missing, Update if exists
    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setProfile({ ...profile, ...updates });
      setIsEditing(false);
      // Tell Navbar to refresh!
      window.dispatchEvent(new Event("user-updated"));
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 1. Upload File
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      return alert("Upload failed: " + uploadError.message);
    }

    // 2. Get URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // 3. Save to DB (UPSERT)
    const { error: dbError } = await supabase.from("profiles").upsert({
      id: user.id,
      avatar_url: data.publicUrl,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      alert("File uploaded but profile not saved: " + dbError.message);
    } else {
      setProfile({ ...profile, avatar_url: data.publicUrl });
      // Tell Navbar to refresh!
      window.dispatchEvent(new Event("user-updated"));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-brand-primary font-bold">
        Loading Profile...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />

      {/* HEADER BANNER */}
      <div className="h-48 bg-brand-primary relative">
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-blue-900 opacity-50"></div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl -mt-20 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* PROFILE HEADER */}
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-300" />
                )}
              </div>
              {/* Camera Icon Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 bg-brand-accent text-white rounded-full shadow-md hover:scale-110 transition-transform cursor-pointer"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4 max-w-md animate-fade-in">
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, full_name: e.target.value })
                    }
                    className="w-full text-2xl font-bold border-b-2 border-brand-accent focus:outline-none pb-1"
                    placeholder="Your Name"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-accent h-24"
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-accent transition-colors flex items-center gap-2"
                    >
                      {saving && <Loader2 className="animate-spin" size={14} />}{" "}
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                      {profile.full_name || "Anonymous User"}
                    </h1>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed max-w-lg">
                      {profile.bio ||
                        "No bio yet. Click edit to introduce yourself!"}
                    </p>
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-400">
                      <span>{reviews.length} Reviews</span>
                      <span>•</span>
                      <span>{favorites.length} Saved</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABS */}
          <div className="border-t border-gray-100 px-8 flex gap-8">
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "reviews"
                  ? "border-brand-accent text-brand-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Star size={16} /> My Reviews
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === "favorites"
                  ? "border-brand-accent text-brand-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <Heart size={16} /> Saved Places
            </button>
            <button
              onClick={handleLogout}
              className="ml-auto py-4 text-sm font-bold text-red-500 flex items-center gap-2 hover:opacity-80"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mt-8">
          {/* 1. REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {reviews.length === 0 ? (
                <EmptyState
                  label="You haven't written any reviews yet."
                  icon={<Star size={32} />}
                />
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex gap-6 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={review.cafes?.cover_image}
                      className="w-24 h-24 rounded-xl object-cover bg-gray-100 hidden sm:block"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <Link
                          href={`/cafe/${review.cafes?.slug}`}
                          className="font-bold text-lg text-brand-primary hover:text-brand-accent"
                        >
                          {review.cafes?.name}
                        </Link>
                        <div className="bg-yellow-50 px-2 py-1 rounded-md text-xs font-bold text-yellow-700 border border-yellow-100 flex items-center gap-1">
                          <Star size={12} fill="currentColor" /> {review.rating}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                        "{review.comment}"
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. FAVORITES TAB */}
          {activeTab === "favorites" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favorites.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    label="No saved places yet."
                    icon={<Heart size={32} />}
                  />
                </div>
              ) : (
                favorites.map((fav) => (
                  <Link
                    href={`/cafe/${fav.cafes.slug}`}
                    key={fav.id}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:border-brand-accent transition-all group"
                  >
                    <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden">
                      <img
                        src={fav.cafes.cover_image}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <h3 className="font-bold text-brand-primary mb-1 group-hover:text-brand-accent">
                        {fav.cafes.name}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <MapPin size={12} /> {fav.cafes.location}
                      </p>
                      <div className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full w-fit">
                        Saved on {new Date(fav.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label, icon }: any) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-gray-400 font-medium">{label}</p>
    </div>
  );
}
