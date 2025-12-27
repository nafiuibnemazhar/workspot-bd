"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor";
// We use dynamic import for the Map because it needs the browser window
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Dynamically import the MapPicker (disables server-side rendering for this component)
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400">
      Loading Map...
    </div>
  ),
});

export default function AddCafePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [user, setUser] = useState<any>(null);

  // State for the new PRO database fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address_text: "",
    avg_price: "",
    lat: 23.7937,
    long: 90.4066,
    wifi: true,
    ac: true,
    generator: false,
    outlets: true,
    // NEW FIELDS
    opening_time: "09:00",
    closing_time: "22:00",
    contact_number: "",
  });

  // Check if user is logged in
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Kick them to login if not authenticated
      } else {
        setUser(user);
      }
    }
    checkUser();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, long: lng }));
  };

  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove weird chars
      .replace(/[\s_-]+/g, "-") // Replace spaces with dashes
      .replace(/^-+|-+$/g, ""); // Trim dashes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in");
    setUploading(true);

    try {
      let imageUrl = null;

      // 1. Upload Image
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
        imageUrl = publicUrl;
      }

      // 2. Prepare Amenities JSON
      const amenitiesJson = {
        wifi: formData.wifi,
        ac: formData.ac,
        generator: formData.generator,
        outlets: formData.outlets,
      };

      const slug =
        createSlug(formData.name) + "-" + Date.now().toString().slice(-4);

      // 3. Insert into Supabase (New Schema)
      const { error: insertError } = await supabase.from("cafes").insert([
        {
          owner_id: user.id,
          name: formData.name,
          slug: slug, // <--- SAVING THE SLUG HERE
          description: formData.description,
          address_text: formData.address_text,
          avg_price: parseFloat(formData.avg_price),
          latitude: formData.lat,
          longitude: formData.long,
          cover_image: imageUrl,
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          contact_number: formData.contact_number,
          amenities: amenitiesJson,
          city: "Dhaka",
          is_verified: true,
        },
      ]);

      if (insertError) throw insertError;

      router.push("/");
    } catch (error: any) {
      console.error("Error:", error);
      alert("Failed to publish: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!user) return null; // Don't show form until check is done

  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand-dark/50 hover:text-brand-orange mb-4 text-sm font-bold"
        >
          <ArrowLeft size={16} /> Cancel
        </Link>
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8">
          Add a Workspace
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-beige shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-brand-dark">
                Basic Info
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Cafe Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-orange outline-none"
                    placeholder="e.g. North End Coffee"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Description
                  </label>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Description & Highlights
                    </label>
                    <div className="prose-sm">
                      <RichEditor
                        value={formData.description}
                        onChange={(val) =>
                          setFormData({ ...formData, description: val })
                        }
                        placeholder="Tell us about the vibe, the coffee, and the internet speed..."
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Tip: Use headings and bullet points for better visibility
                      on Google.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Avg Price (Tk)
                    </label>
                    <input
                      type="number"
                      name="avg_price"
                      required
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      placeholder="300"
                      value={formData.avg_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Address Area
                    </label>
                    <input
                      type="text"
                      name="address_text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      placeholder="e.g. Gulshan 2"
                      value={formData.address_text}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Opens At
                    </label>
                    <input
                      type="time"
                      name="opening_time"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.opening_time}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Closes At
                    </label>
                    <input
                      type="time"
                      name="closing_time"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                      value={formData.closing_time}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-beige shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-brand-dark">
                Amenities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-brand-orange">
                  <input
                    type="checkbox"
                    name="wifi"
                    checked={formData.wifi}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-orange"
                  />
                  <span className="font-medium">Fast Wifi</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-brand-orange">
                  <input
                    type="checkbox"
                    name="ac"
                    checked={formData.ac}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-orange"
                  />
                  <span className="font-medium">Air Conditioned</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-brand-orange">
                  <input
                    type="checkbox"
                    name="generator"
                    checked={formData.generator}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-orange"
                  />
                  <span className="font-medium">Generator Backup</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:border-brand-orange">
                  <input
                    type="checkbox"
                    name="outlets"
                    checked={formData.outlets}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-orange"
                  />
                  <span className="font-medium">Power Outlets</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Map & Image */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-brand-beige shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-brand-dark">
                Location
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Click on the map to pin the exact location.
              </p>
              <MapPicker onLocationSelect={handleLocationSelect} />
              <div className="mt-2 text-xs text-gray-400 font-mono">
                Lat: {formData.lat.toFixed(4)}, Long: {formData.long.toFixed(4)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-brand-beige shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-brand-dark">
                Cover Photo
              </h3>
              <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden group hover:border-brand-orange transition-colors">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-brand-dark/40">
                    <UploadCloud size={32} className="mb-2" />
                    <p className="text-sm font-bold">Upload Image</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-brand-dark text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-orange transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {uploading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save size={18} />
              )}{" "}
              {uploading ? "Publishing..." : "Publish Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
