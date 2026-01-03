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
  Store,
  Share2,
  CheckCircle,
  ExternalLink,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Github,
  Facebook,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("listings");

  const [profile, setProfile] = useState<any>({});
  const [myCafes, setMyCafes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    username: "",
    bio: "",
    website: "",
    role: "",
    work_status: "Working",
    linkedin_url: "",
    twitter_url: "",
    instagram_url: "",
    github_url: "", // <--- NEW
    facebook_url: "", // <--- NEW
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

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) {
      setProfile(profileData);
      setEditForm({
        full_name: profileData.full_name || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
        website: profileData.website || "",
        role: profileData.role || "",
        work_status: profileData.work_status || "Working",
        linkedin_url: profileData.linkedin_url || "",
        twitter_url: profileData.twitter_url || "",
        instagram_url: profileData.instagram_url || "",
        github_url: profileData.github_url || "", // <--- NEW
        facebook_url: profileData.facebook_url || "", // <--- NEW
      });
    }

    // Fetch related data
    const { data: userCafes } = await supabase
      .from("cafes")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    setMyCafes(userCafes || []);
    const { data: userReviews } = await supabase
      .from("reviews")
      .select("*, cafes(name, slug, cover_image)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setReviews(userReviews || []);
    const { data: userFavs } = await supabase
      .from("favorites")
      .select("*, cafes(*)")
      .eq("user_id", user.id);
    setFavorites(userFavs || []);

    setLoading(false);
  }

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    const updates = {
      id: user.id,
      full_name: editForm.full_name,
      username: editForm.username.toLowerCase().replace(/\s+/g, ""),
      bio: editForm.bio,
      website: editForm.website,
      role: editForm.role,
      work_status: editForm.work_status,
      linkedin_url: editForm.linkedin_url,
      twitter_url: editForm.twitter_url,
      instagram_url: editForm.instagram_url,
      github_url: editForm.github_url, // <--- NEW
      facebook_url: editForm.facebook_url, // <--- NEW
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);
    if (error) {
      alert("Error saving: " + error.message);
    } else {
      setProfile({ ...profile, ...updates });
      setIsEditing(false);
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
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);
    if (uploadError) return alert("Upload failed: " + uploadError.message);
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      });
    setProfile({ ...profile, avatar_url: data.publicUrl });
    window.dispatchEvent(new Event("user-updated"));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };
  const copyPublicLink = () => {
    const linkId = profile.username || user?.id;
    const url = `${window.location.origin}/u/${linkId}`;
    navigator.clipboard.writeText(url);
    alert("Profile link copied!");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center text-brand-primary font-bold">
        <Loader2 className="animate-spin mr-2" /> Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />

      <div className="h-56 bg-brand-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl -mt-24 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-36 h-36 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={64} className="text-gray-300" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 p-2.5 bg-brand-accent text-white rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer border-2 border-white"
              >
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Info / Edit Form */}
            <div className="flex-1 w-full pt-4">
              {isEditing ? (
                <div className="space-y-6 max-w-2xl animate-fade-in">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.full_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            full_name: e.target.value,
                          })
                        }
                        className="w-full text-lg font-bold border-b border-brand-accent focus:outline-none py-1"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Username
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full text-lg font-mono text-gray-600 border-b border-brand-accent focus:outline-none py-1"
                      />
                    </div>
                  </div>

                  {/* Professional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={editForm.role}
                        onChange={(e) =>
                          setEditForm({ ...editForm, role: e.target.value })
                        }
                        className="w-full p-2 bg-gray-50 rounded border-none focus:ring-1 focus:ring-brand-accent mt-1"
                        placeholder="e.g. Frontend Developer"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">
                        Work Status
                      </label>
                      <select
                        value={editForm.work_status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            work_status: e.target.value,
                          })
                        }
                        className="w-full p-2 bg-gray-50 rounded border-none focus:ring-1 focus:ring-brand-accent mt-1"
                      >
                        <option value="Working">Working</option>
                        <option value="Open to Work">Open to Work</option>
                        <option value="Freelancing">Freelancing</option>
                        <option value="Hiring">Hiring</option>
                      </select>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                      Social & Portfolio
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <Globe
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Personal/Business Website"
                          value={editForm.website}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              website: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                      <div className="relative">
                        <Github
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="GitHub URL"
                          value={editForm.github_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              github_url: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                      <div className="relative">
                        <Linkedin
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="LinkedIn URL"
                          value={editForm.linkedin_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              linkedin_url: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                      <div className="relative">
                        <Twitter
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Twitter/X URL"
                          value={editForm.twitter_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              twitter_url: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                      <div className="relative">
                        <Facebook
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Facebook URL"
                          value={editForm.facebook_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              facebook_url: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                      <div className="relative">
                        <Instagram
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="text"
                          placeholder="Instagram URL"
                          value={editForm.instagram_url}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              instagram_url: e.target.value,
                            })
                          }
                          className="w-full pl-8 p-2 text-sm bg-gray-50 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) =>
                        setEditForm({ ...editForm, bio: e.target.value })
                      }
                      className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-accent h-24 mt-1"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-accent transition-colors flex items-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <CheckCircle size={14} />
                      )}{" "}
                      Save Profile
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
                <div className="flex flex-col md:flex-row justify-between items-start w-full gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                      {profile.full_name || "New Explorer"}
                    </h1>

                    <div className="flex items-center gap-2 mb-3">
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
                      {profile.bio || "No bio yet."}
                    </p>

                    {/* SOCIAL LINKS DISPLAY */}
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

                    <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-gray-400">
                      <div className="flex items-center gap-2">
                        <Store size={18} className="text-brand-primary" />{" "}
                        <span className="text-gray-700">{myCafes.length}</span>{" "}
                        Listings
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-yellow-500" />{" "}
                        <span className="text-gray-700">{reviews.length}</span>{" "}
                        Reviews
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart size={18} className="text-red-500" />{" "}
                        <span className="text-gray-700">
                          {favorites.length}
                        </span>{" "}
                        Saved
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={copyPublicLink}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-brand-primary rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <Share2 size={16} /> Share
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-accent transition-colors"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 px-8 flex gap-8 overflow-x-auto">
            <TabButton
              active={activeTab === "listings"}
              onClick={() => setActiveTab("listings")}
              icon={<Store size={16} />}
              label="My Listings"
            />
            <TabButton
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
              icon={<Star size={16} />}
              label="Reviews"
            />
            <TabButton
              active={activeTab === "favorites"}
              onClick={() => setActiveTab("favorites")}
              icon={<Heart size={16} />}
              label="Saved"
            />
            <button
              onClick={handleLogout}
              className="ml-auto py-5 text-sm font-bold text-red-500 flex items-center gap-2 hover:opacity-80"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Content Tabs (Same as before) */}
        <div className="mt-8">
          {activeTab === "listings" && (
            <div className="space-y-6">
              {myCafes.length === 0 ? (
                <EmptyState
                  label="You haven't added any workspaces yet."
                  icon={<Store size={32} />}
                  action={
                    <Link
                      href="/add-cafe"
                      className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-bold text-sm"
                    >
                      Add Your First Space
                    </Link>
                  }
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myCafes.map((cafe) => (
                    <div
                      key={cafe.id}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group flex flex-col"
                    >
                      <div className="h-40 bg-gray-100 relative">
                        <img
                          src={cafe.cover_image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">
                          {cafe.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                          <MapPin size={12} /> {cafe.city},{" "}
                          {cafe.country === "USA" ? cafe.state : "Dhaka"}
                        </p>
                        <div className="mt-auto flex gap-3 border-t border-gray-50 pt-4">
                          <Link
                            href={`/cafe/${cafe.slug}`}
                            className="flex-1 text-center py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 flex items-center justify-center gap-1"
                          >
                            <ExternalLink size={12} /> View
                          </Link>
                          <Link
                            href={`/edit-cafe/${cafe.slug}`}
                            className="flex-1 text-center py-2 bg-brand-primary/10 rounded-lg text-xs font-bold text-brand-primary hover:bg-brand-primary/20 flex items-center justify-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Reviews & Favorites Tabs (Same as before) */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <EmptyState label="No reviews yet." icon={<Star size={32} />} />
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

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`py-5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
        active
          ? "border-brand-accent text-brand-primary"
          : "border-transparent text-gray-400 hover:text-gray-600"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function EmptyState({ label, icon, action }: any) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
      <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="text-gray-400 font-medium">{label}</p>
      {action}
    </div>
  );
}
