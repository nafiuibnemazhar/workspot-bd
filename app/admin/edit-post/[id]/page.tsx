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
  Calendar,
  User,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image: "",
    author_name: "",
    scheduled_at: "",
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        alert("Error fetching post");
        router.push("/blog");
      } else {
        // Format date for input field (YYYY-MM-DDTHH:MM)
        const dateStr = data.scheduled_at
          ? new Date(data.scheduled_at).toISOString().slice(0, 16)
          : "";

        setFormData({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt || "",
          content: data.content || "",
          cover_image: data.cover_image || "",
          author_name: data.author_name || "WorkSpot Editor",
          scheduled_at: dateStr,
        });
        setLoading(false);
      }
    }
    fetchPost();
  }, [params.id]);

  // 2. Handle Update
  const handleUpdate = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("posts")
      .update({
        title: formData.title,
        slug: formData.slug, // Manually editable slug
        excerpt: formData.excerpt,
        content: formData.content,
        author_name: formData.author_name,
        scheduled_at: formData.scheduled_at
          ? new Date(formData.scheduled_at).toISOString()
          : new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Post Updated!");
      router.push(`/blog/${formData.slug}`);
    }
    setSaving(false);
  };

  // 3. Handle Delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase.from("posts").delete().eq("id", params.id);
    if (!error) router.push("/blog");
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
              href="/blog"
              className="p-2 bg-white rounded-full border hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-extrabold text-brand-primary">
              Edit Post
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
          {/* Left: Editor */}
          <div className="lg:col-span-2 space-y-6">
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full p-4 text-3xl font-extrabold bg-transparent border-none focus:ring-0 placeholder:text-gray-300 text-brand-primary"
              placeholder="Post Title"
            />

            <div className="bg-white rounded-xl shadow-sm border border-brand-border min-h-[500px]">
              <RichEditor
                value={formData.content}
                onChange={(val) => setFormData({ ...formData, content: val })}
              />
            </div>
          </div>

          {/* Right: Meta Controls */}
          <div className="space-y-6">
            {/* SEO Slug Control */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <LinkIcon size={18} /> SEO Slug
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
              <p className="text-xs text-gray-400 mt-2">
                Keep it short and keyword rich.
              </p>
            </div>

            {/* Scheduling */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Calendar size={18} /> Publish Date
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
                Leave as is to publish immediately.
              </p>
            </div>

            {/* Author Info */}
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
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm mb-2"
                placeholder="Author Name"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white p-6 rounded-3xl border border-brand-border">
              <h3 className="font-bold text-lg mb-2">Excerpt</h3>
              <textarea
                rows={4}
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
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
