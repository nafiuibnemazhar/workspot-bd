"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor"; // Reusing your Tiptap editor!
import {
  ArrowLeft,
  UploadCloud,
  Save,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";

export default function WriteBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "", // HTML content
    cover_image: "",
  });

  // Auto-generate slug from title
  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, title, slug });
  };

  // Image Upload Logic
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setPreviewUrl(URL.createObjectURL(file));

    // Upload to Supabase
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      const { data } = supabase.storage
        .from("blog-images")
        .getPublicUrl(fileName);
      setFormData((prev) => ({ ...prev, cover_image: data.publicUrl }));
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content)
      return alert("Title and Content are required!");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("You must be logged in.");

    const { error } = await supabase.from("posts").insert([
      {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        cover_image: formData.cover_image,
        published: true,
        author_id: user.id,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/blog"); // Go to blog home
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 bg-white rounded-full border hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-extrabold text-brand-primary">
              Write New Article
            </h1>
          </div>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-accent transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Save size={20} />
            )}{" "}
            Publish
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Article Title..."
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full p-4 text-3xl font-extrabold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 text-brand-primary"
            />

            {/* The Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-border min-h-[500px]">
              <RichEditor
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
                placeholder="Tell your story..."
              />
            </div>
          </div>

          {/* Right: Meta Data */}
          <div className="space-y-6">
            {/* Cover Image */}
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
                    <span className="text-sm font-bold">Upload</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-2">Short Summary</h3>
              <textarea
                rows={4}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                placeholder="Small text for SEO and preview cards..."
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
              />
            </div>

            {/* Slug (URL) */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-2">URL Slug</h3>
              <div className="flex items-center gap-1 text-gray-400 text-xs bg-gray-50 p-2 rounded-lg break-all">
                <span>workspot.bd/blog/</span>
                <span className="text-brand-primary font-mono">
                  {formData.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
