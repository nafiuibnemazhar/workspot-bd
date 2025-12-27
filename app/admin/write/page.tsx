"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import RichEditor from "@/components/RichEditor";
import {
  ArrowLeft,
  UploadCloud,
  Save,
  Loader2,
  Calendar,
  User,
  Link as LinkIcon,
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
    content: "",
    cover_image: "",
    author_name: "WorkSpot Editor",
    scheduled_at: "",
  });

  // Auto-generate slug from title (only if user hasn't manually edited it)
  const handleTitleChange = (e: any) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        prev.slug === "" ||
        prev.slug ===
          prev.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "")
          ? slug
          : prev.slug,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setPreviewUrl(URL.createObjectURL(file));

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
        author_name: formData.author_name,
        scheduled_at: formData.scheduled_at
          ? new Date(formData.scheduled_at).toISOString()
          : new Date().toISOString(),
        published: true,
        author_id: user.id,
      },
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push("/blog");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-surface pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/blog"
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
            <input
              type="text"
              placeholder="Article Title..."
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full p-4 text-3xl font-extrabold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 text-brand-primary"
            />

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

            {/* SEO Slug */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <LinkIcon size={18} /> URL Slug
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
                placeholder="my-awesome-post"
              />
            </div>

            {/* Schedule Date */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} /> Schedule For
              </h3>
              <input
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
              />
              <p className="text-xs text-gray-400 mt-2">
                Leave blank to publish now.
              </p>
            </div>

            {/* Author */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <User size={18} /> Author
              </h3>
              <input
                type="text"
                value={formData.author_name}
                onChange={(e) =>
                  setFormData({ ...formData, author_name: e.target.value })
                }
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                placeholder="WorkSpot Editor"
              />
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
          </div>
        </div>
      </div>
    </div>
  );
}
