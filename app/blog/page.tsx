"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

export default function BlogHome() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    }
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      {/* Header */}
      <div className="bg-brand-primary text-white pt-32 pb-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          WorkSpot <span className="text-brand-accent">Journal</span>
        </h1>
        <p className="text-brand-muted max-w-2xl mx-auto text-lg">
          Guides, reviews, and news about the remote work culture in Dhaka.
        </p>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-6 py-16 max-w-6xl">
        {loading ? (
          <div className="text-center py-20 text-brand-muted">
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-brand-border">
            <h3 className="text-xl font-bold text-brand-primary">
              No articles yet.
            </h3>
            <p className="text-brand-muted">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                href={`/blog/${post.slug}`}
                key={post.id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-brand-border hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 overflow-hidden relative">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-primary flex items-center justify-center text-white/20 font-bold text-2xl">
                      No Image
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-accent mb-3 uppercase tracking-wider">
                    <Calendar size={12} />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>

                  <h2 className="text-xl font-bold text-brand-primary mb-3 leading-tight group-hover:text-brand-accent transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-brand-muted text-sm line-clamp-3 mb-4 flex-1">
                    {post.excerpt || "Click to read more..."}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-bold text-brand-primary mt-auto pt-4 border-t border-gray-100">
                    <User size={16} className="text-gray-400" />
                    <span>Editor</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
