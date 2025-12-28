"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

export default function EditCafePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. UPDATED STATE: Added 'rating'
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    location: "",
    google_map: "",
    facebook_url: "",
    instagram_url: "",
    opening_time: "",
    closing_time: "",
    has_wifi: false,
    has_ac: false,
    has_parking: false,
    has_socket: false,
    rating: 0, // Default 0
  });

  // 2. FETCH DATA
  useEffect(() => {
    async function fetchCafe() {
      const { data, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (error) {
        alert("Error fetching cafe");
        router.push("/");
      } else {
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          location: data.location || "",
          google_map: data.google_map || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          opening_time: data.opening_time || "",
          closing_time: data.closing_time || "",
          has_wifi: data.has_wifi,
          has_ac: data.has_ac,
          has_parking: data.has_parking,
          has_socket: data.has_socket,
          rating: data.rating || 0, // Load existing rating
        });
        setLoading(false);
      }
    }
    fetchCafe();
  }, [params.slug]);

  // 3. SAVE UPDATE
  const handleUpdate = async () => {
    setSaving(true);

    // Auto-generate slug if empty (safety check)
    const finalSlug =
      formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const { error } = await supabase
      .from("cafes")
      .update({
        name: formData.name,
        slug: finalSlug,
        description: formData.description,
        location: formData.location,
        google_map: formData.google_map,
        facebook_url: formData.facebook_url,
        instagram_url: formData.instagram_url,
        opening_time: formData.opening_time,
        closing_time: formData.closing_time,
        has_wifi: formData.has_wifi,
        has_ac: formData.has_ac,
        has_parking: formData.has_parking,
        has_socket: formData.has_socket,
        rating: formData.rating, // Save the rating
      })
      .eq("slug", params.slug);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Cafe Updated!");
      router.push(`/cafe/${finalSlug}`);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this cafe?")) return;
    const { error } = await supabase
      .from("cafes")
      .delete()
      .eq("slug", params.slug);
    if (!error) router.push("/");
  };

  if (loading) return <div className="p-20 text-center">Loading Editor...</div>;

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/cafe/${params.slug}`}
              className="p-2 bg-white rounded-full border hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-extrabold text-brand-primary">
              Edit Cafe
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"
            >
              <Trash2 size={20} />
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-accent transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={20} />
              )}{" "}
              Update
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">
                  Cafe Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all font-bold text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Description
                </label>
                <RichEditor
                  value={formData.description}
                  onChange={(val) =>
                    setFormData({ ...formData, description: val })
                  }
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-border space-y-6">
              <h3 className="font-bold text-lg">Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Opening Time
                  </label>
                  <input
                    type="time"
                    value={formData.opening_time}
                    onChange={(e) =>
                      setFormData({ ...formData, opening_time: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Closing Time
                  </label>
                  <input
                    type="time"
                    value={formData.closing_time}
                    onChange={(e) =>
                      setFormData({ ...formData, closing_time: e.target.value })
                    }
                    className="w-full p-3 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              {/* NEW: RATING INPUT */}
              <div>
                <label className="block text-sm font-bold mb-2">
                  Rating (0 - 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseFloat(e.target.value),
                    })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-accent outline-none"
                  placeholder="e.g. 4.5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Location (Short Address)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">
                  Google Maps Link
                </label>
                <input
                  type="text"
                  value={formData.google_map}
                  onChange={(e) =>
                    setFormData({ ...formData, google_map: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Instagram URL
                </label>
                <input
                  type="text"
                  value={formData.instagram_url}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram_url: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">
                  Facebook URL
                </label>
                <input
                  type="text"
                  value={formData.facebook_url}
                  onChange={(e) =>
                    setFormData({ ...formData, facebook_url: e.target.value })
                  }
                  className="w-full p-3 rounded-xl border border-gray-200"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>
          </div>

          {/* Right: Toggles & Meta */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4">Amenities</h3>
              <div className="space-y-3">
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
                  label="Parking Available"
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

            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <LinkIcon size={18} /> Slug
              </h3>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm font-mono text-brand-accent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Toggle Helper
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
    <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
      <span className="text-brand-primary font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-brand-accent"
      />
    </label>
  );
}
