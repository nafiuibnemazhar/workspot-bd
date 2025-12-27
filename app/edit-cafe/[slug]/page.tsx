"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-2xl" />,
});

export default function EditCafePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address_text: "",
    avg_price: "",
    opening_time: "09:00",
    closing_time: "22:00",
    contact_number: "",
    lat: 23.7937,
    long: 90.4066,
    wifi: false,
    ac: false,
    generator: false,
    outlets: false,
    cover_image: "", // Stores the OLD image URL
  });

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");
      setUser(user);

      const { data: cafe, error } = await supabase
        .from("cafes")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (error || !cafe) {
        alert("Could not load cafe.");
        router.push("/");
        return;
      }

      if (cafe.owner_id !== user.id) {
        alert("You do not have permission to edit this workspace.");
        router.push("/");
        return;
      }

      setFormData({
        name: cafe.name,
        description: cafe.description || "",
        address_text: cafe.address_text || "",
        avg_price: cafe.avg_price.toString(),
        opening_time: cafe.opening_time || "09:00",
        closing_time: cafe.closing_time || "22:00",
        contact_number: cafe.contact_number || "",
        lat: cafe.latitude,
        long: cafe.longitude,
        wifi: cafe.amenities?.wifi || false,
        ac: cafe.amenities?.ac || false,
        generator: cafe.amenities?.generator || false,
        outlets: cafe.amenities?.outlets || false,
        cover_image: cafe.cover_image || "",
      });
      // Set initial preview to the existing image
      if (cafe.cover_image) setPreviewUrl(cafe.cover_image);

      setLoading(false);
    }
    loadData();
  }, [params.slug, router]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show new image immediately
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrl = formData.cover_image;

      // 1. If a NEW file was selected, upload it
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("cafe-images")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("cafe-images").getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // 2. Update Database
      const amenitiesJson = {
        wifi: formData.wifi,
        ac: formData.ac,
        generator: formData.generator,
        outlets: formData.outlets,
      };

      const { error } = await supabase
        .from("cafes")
        .update({
          name: formData.name,
          description: formData.description,
          address_text: formData.address_text,
          avg_price: parseFloat(formData.avg_price),
          latitude: formData.lat,
          longitude: formData.long,
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          contact_number: formData.contact_number,
          amenities: amenitiesJson,
          cover_image: finalImageUrl, // Save the new (or old) URL
        })
        .eq("slug", params.slug);

      if (error) throw error;

      router.push(`/cafe/${params.slug}`);
    } catch (error: any) {
      alert("Error updating: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    const { error } = await supabase
      .from("cafes")
      .delete()
      .eq("slug", params.slug);
    if (error) alert("Error deleting");
    else router.push("/");
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading editor...
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-brand-primary">
            Edit Workspace
          </h1>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} /> Delete Page
          </button>
        </div>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4">Basic Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Avg Price
                    </label>
                    <input
                      type="number"
                      name="avg_price"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                      value={formData.avg_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      name="contact_number"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                      value={formData.contact_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Opens
                    </label>
                    <input
                      type="time"
                      name="opening_time"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                      value={formData.opening_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Closes
                    </label>
                    <input
                      type="time"
                      name="closing_time"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200"
                      value={formData.closing_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {["wifi", "ac", "generator", "outlets"].map((key) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-brand-accent"
                  >
                    <input
                      type="checkbox"
                      name={key}
                      checked={(formData as any)[key]}
                      onChange={handleChange}
                      className="w-5 h-5 text-brand-accent"
                    />
                    <span className="font-medium capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4">Location</h3>

              {/* 1. The Map (Now receives initialLat/Lng) */}
              <MapPicker
                initialLat={formData.lat}
                initialLng={formData.long}
                onLocationSelect={(lat, long) =>
                  setFormData((prev) => ({ ...prev, lat, long }))
                }
              />
              <p className="text-xs text-gray-400 mt-2 mb-4">
                Click map to pin exact location.
              </p>

              {/* 2. Manual Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="lat"
                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono"
                    value={formData.lat}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-500 uppercase">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="long"
                    className="w-full p-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-mono"
                    value={formData.long}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* NEW: Image Upload Section */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4">Cover Image</h3>

              <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden group hover:border-brand-accent transition-colors cursor-pointer">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-brand-muted/40">
                    <UploadCloud size={32} className="mb-2" />
                    <p className="text-sm font-bold">Change Image</p>
                  </div>
                )}
                {/* The invisible file input overlay */}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileSelect}
                />

                {/* Overlay text on hover */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white font-bold flex items-center gap-2">
                    <ImageIcon size={18} /> Change Photo
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/cafe/${params.slug}`}
                className="flex-1 py-4 text-center border border-brand-border rounded-xl font-bold hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-primary text-white py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors flex justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={20} />
                )}{" "}
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
