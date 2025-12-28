"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Link as LinkIcon,
  MapPin,
  Image as ImageIcon,
  UploadCloud,
  Clock,
  DollarSign,
  Star,
  Globe,
  Facebook,
  Instagram,
} from "lucide-react";
import Link from "next/link";

export default function AddCafePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    google_map: "",
    latitude: "",
    longitude: "",
    cover_image: "",
    instagram_url: "",
    facebook_url: "",
    opening_time: "",
    closing_time: "",
    has_wifi: false,
    has_ac: false,
    has_parking: false,
    has_socket: false,
    rating: 0,
    avg_price: 0,
  });

  // 1. IMAGE UPLOAD LOGIC
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Upload to 'cafes' bucket
      const { error: uploadError } = await supabase.storage
        .from("cafes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data } = supabase.storage.from("cafes").getPublicUrl(filePath);

      setFormData({ ...formData, cover_image: data.publicUrl });
      setPreview(data.publicUrl);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.location) {
      alert("Please fill in at least the Name and Location.");
      return;
    }

    setSubmitting(true);

    const finalSlug =
      formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("cafes").insert([
      {
        name: formData.name,
        slug: finalSlug,
        description: formData.description,
        location: formData.location,
        google_map: formData.google_map,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        cover_image: formData.cover_image,
        instagram_url: formData.instagram_url,
        facebook_url: formData.facebook_url,
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        avg_price: formData.avg_price,
        rating: formData.rating,
        has_wifi: formData.has_wifi,
        has_ac: formData.has_ac,
        has_parking: formData.has_parking,
        has_socket: formData.has_socket,
        owner_id: user?.id,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push(`/cafe/${finalSlug}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-28">
        {/* HEADER ACTION BAR */}
        <div className="flex justify-between items-center mb-8 sticky top-24 z-20 bg-gray-50/90 backdrop-blur-sm py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2.5 bg-white rounded-full border border-gray-200 hover:bg-gray-100 text-gray-600 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Add New Workspace
              </h1>
              <p className="text-sm text-gray-500">
                Create a new listing for the directory
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-brand-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}{" "}
              Publish Listing
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT COLUMN: MAIN CONTENT --- */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. ESSENTIALS */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                  01
                </span>
                Basic Information
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all font-bold text-lg text-gray-900 placeholder-gray-400"
                    placeholder="e.g. North End Coffee Roasters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="prose-editor-wrapper">
                    <RichEditor
                      value={formData.description}
                      onChange={(val) =>
                        setFormData({ ...formData, description: val })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. MEDIA UPLOAD */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                  02
                </span>
                Cover Image
              </h3>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all hover:border-brand-accent hover:bg-brand-accent/5 group ${
                  preview
                    ? "border-brand-accent bg-brand-accent/5"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />

                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-brand-accent">
                    <Loader2 className="animate-spin" size={32} />
                    <span className="font-bold">Uploading...</span>
                  </div>
                ) : preview ? (
                  <div className="w-full relative group">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                      <p className="text-white font-bold flex items-center gap-2">
                        <ImageIcon /> Change Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} />
                    </div>
                    <h4 className="text-gray-900 font-bold">
                      Click to upload image
                    </h4>
                    <p className="text-gray-400 text-sm">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. LOCATION */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">
                  03
                </span>
                Location Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Short Address
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full pl-12 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none"
                      placeholder="e.g. Banani, Road 11"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none font-mono text-sm"
                    placeholder="23.7937"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none font-mono text-sm"
                    placeholder="90.4066"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Google Maps Link
                  </label>
                  <input
                    type="text"
                    value={formData.google_map}
                    onChange={(e) =>
                      setFormData({ ...formData, google_map: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none text-sm text-blue-600"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR --- */}
          <div className="space-y-6">
            {/* 4. OPERATIONS */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" /> Operational
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Opens
                  </label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) =>
                      setFormData({ ...formData, opening_time: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Closes
                  </label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) =>
                      setFormData({ ...formData, closing_time: e.target.value })
                    }
                    className="w-full p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Avg Price (Tk)
                  </label>
                  <div className="relative">
                    <DollarSign
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="number"
                      value={formData.avg_price || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          avg_price: parseInt(e.target.value),
                        })
                      }
                      className="w-full pl-8 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold"
                      placeholder="400"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    Rating (0-5)
                  </label>
                  <div className="relative">
                    <Star
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      max="5"
                      value={formData.rating || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: parseFloat(e.target.value),
                        })
                      }
                      className="w-full pl-8 p-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-bold"
                      placeholder="4.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. AMENITIES */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                Amenities
              </h3>
              <div className="space-y-1">
                <Toggle
                  label="Free Wi-Fi"
                  checked={formData.has_wifi}
                  onChange={(v) => setFormData({ ...formData, has_wifi: v })}
                />
                <Toggle
                  label="Air Conditioned"
                  checked={formData.has_ac}
                  onChange={(v) => setFormData({ ...formData, has_ac: v })}
                />
                <Toggle
                  label="Parking"
                  checked={formData.has_parking}
                  onChange={(v) => setFormData({ ...formData, has_parking: v })}
                />
                <Toggle
                  label="Power Sockets"
                  checked={formData.has_socket}
                  onChange={(v) => setFormData({ ...formData, has_socket: v })}
                />
              </div>
            </div>

            {/* 6. SOCIALS & SEO */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                Social & Meta
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Instagram
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={formData.instagram_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagram_url: e.target.value,
                      })
                    }
                    className="w-full pl-9 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                    placeholder="Instagram URL"
                  />
                </div>
                <div className="relative">
                  <Facebook
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={formData.facebook_url}
                    onChange={(e) =>
                      setFormData({ ...formData, facebook_url: e.target.value })
                    }
                    className="w-full pl-9 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                    placeholder="Facebook URL"
                  />
                </div>
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <label className="text-xs font-bold text-gray-500 mb-1 block">
                    URL Slug
                  </label>
                  <div className="relative">
                    <LinkIcon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                      className="w-full pl-8 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-brand-accent"
                      placeholder="auto-generated"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors group">
      <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-primary">
        {label}
      </span>
      <div
        className={`w-12 h-6 rounded-full p-1 transition-colors relative ${
          checked ? "bg-brand-primary" : "bg-gray-200"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="hidden"
      />
    </label>
  );
}
