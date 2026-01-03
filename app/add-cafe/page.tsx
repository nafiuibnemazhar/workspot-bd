"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor";
import {
  ArrowLeft,
  Plus,
  Loader2,
  MapPin,
  UploadCloud,
  Clock,
  Star,
  Facebook,
  Instagram,
  Phone,
  Globe,
  Map as MapIcon,
} from "lucide-react";
import Link from "next/link";

// --- GLOBAL CONSTANTS ---
const COUNTRIES = ["USA", "Bangladesh"];

const US_STATES = [
  { code: "NC", name: "North Carolina" },
  { code: "TX", name: "Texas" },
  { code: "WA", name: "Washington" },
  { code: "CA", name: "California" },
  { code: "NY", name: "New York" },
];

const BD_HUBS = [
  "Gulshan",
  "Banani",
  "Dhanmondi",
  "Uttara",
  "Mirpur",
  "Agargaon",
  "Mohammadpur",
];

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

    // --- LOCATION FIELDS ---
    country: "USA",
    state: "",
    city: "",
    address_street: "",
    // -----------------------

    google_map: "",
    contact_number: "",
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

  const isUSA = formData.country === "USA";
  const currencySymbol = isUSA ? "$" : "৳";

  // Auto-fill coordinates if Google Map link is pasted
  useEffect(() => {
    if (formData.google_map.includes("@")) {
      const parts = formData.google_map.split("@")[1].split(",");
      if (parts.length >= 2) {
        setFormData((prev) => ({
          ...prev,
          latitude: parts[0],
          longitude: parts[1],
        }));
      }
    }
  }, [formData.google_map]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("cafes")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("cafes").getPublicUrl(filePath);
      setFormData({ ...formData, cover_image: data.publicUrl });
      setPreview(data.publicUrl);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert("Name is required");
    if (!formData.city)
      return alert(isUSA ? "City is required" : "Area is required");
    if (isUSA && !formData.state) return alert("State is required for USA");

    setSubmitting(true);

    const finalSlug =
      formData.slug ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Math.floor(Math.random() * 1000);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Backward compatibility location string
    let legacyLocation = isUSA
      ? `${formData.address_street}, ${formData.city}, ${formData.state}`
      : `${formData.address_street}, ${formData.city}, Dhaka`;

    const payload = {
      name: formData.name,
      slug: finalSlug,
      description: formData.description,

      country: formData.country,
      state: isUSA ? formData.state : null,
      city: isUSA ? formData.city : "Dhaka",
      location: isUSA
        ? legacyLocation
        : `${formData.city}, ${formData.address_street}`,

      address_street: formData.address_street,

      google_map: formData.google_map,
      contact_number: formData.contact_number,
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
    };

    const { error } = await supabase.from("cafes").insert([payload]);

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
        {/* Header */}
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
                Add Workspace
              </h1>
              <p className="text-sm text-gray-500">
                Contribute to the global database
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
              className="bg-brand-primary text-white px-8 py-2.5 rounded-xl font-bold hover:bg-brand-accent transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/20 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}{" "}
              Publish
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN (MAIN CONTENT) */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Basic Info */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                  01
                </span>{" "}
                Basic Info
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
                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-brand-accent/20 outline-none font-bold text-lg"
                    placeholder="e.g. Brew Coffee Bar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
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
            </div>

            {/* 2. Cover Image */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                  02
                </span>{" "}
                Cover Image
              </h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-brand-accent hover:bg-brand-accent/5 transition-all ${
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
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-xl shadow-md"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-blue-50 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-2">
                      <UploadCloud size={32} />
                    </div>
                    <h4 className="text-gray-900 font-bold">
                      Click to upload image
                    </h4>
                  </div>
                )}
              </div>
            </div>

            {/* 3. LOCATION */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">
                  03
                </span>{" "}
                Location Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COUNTRY */}
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <select
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          country: e.target.value,
                          state: "",
                          city: "",
                        })
                      }
                      className="w-full pl-10 p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none font-bold text-gray-800"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* USA FIELDS */}
                {isUSA && (
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        State
                      </label>
                      <select
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                      >
                        <option value="">Select State...</option>
                        {US_STATES.map((s) => (
                          <option key={s.code} value={s.code}>
                            {s.name} ({s.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                        placeholder="e.g. Cary"
                      />
                    </div>
                  </>
                )}

                {/* BD FIELDS */}
                {!isUSA && (
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Neighborhood (Area)
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                    >
                      <option value="">Select Area...</option>
                      {BD_HUBS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                {/* SHARED ADDRESS */}
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {isUSA ? "Street Address" : "House / Road / Block"}
                  </label>
                  <input
                    type="text"
                    value={formData.address_street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address_street: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none"
                    placeholder={isUSA ? "123 Main St" : "House 5, Road 11"}
                  />
                </div>

                {/* GOOGLE MAPS & COORDS */}
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
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-blue-600"
                    placeholder="https://goo.gl/maps/..."
                  />
                  <p className="text-xs text-gray-400 mt-1 ml-1">
                    Tip: Pasting a map link will auto-fill Lat/Lng below if
                    available.
                  </p>
                </div>

                {/* --- LAT/LONG FIELDS (ADDED BACK) --- */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <MapIcon size={14} className="text-gray-400" /> Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none font-mono text-sm"
                    placeholder="e.g. 35.7915"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                    <MapIcon size={14} className="text-gray-400" /> Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none font-mono text-sm"
                    placeholder="e.g. -78.7811"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (META) */}
          <div className="space-y-6">
            {/* 4. Operations */}
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
                    Avg Price ({currencySymbol})
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {currencySymbol}
                    </span>
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
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Amenities */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 mb-4">
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

            {/* 6. Social & Contact */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-md font-bold text-gray-900 mb-4">
                Contact & Social
              </h3>
              <div className="space-y-3">
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_number: e.target.value,
                      })
                    }
                    className="w-full pl-9 p-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-bold"
                    placeholder="Phone number"
                  />
                </div>
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
