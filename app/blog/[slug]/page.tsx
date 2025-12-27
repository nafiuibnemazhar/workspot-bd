"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DOMPurify from "dompurify";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function SinglePostPage() {
  const params = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", params.slug)
        .single();

      setPost(data);
      setLoading(false);
    }
    fetchPost();
  }, [params.slug]);

  if (loading)
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
        Loading...
      </div>
    );
  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Post not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-brand-primary text-white pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Image Blur Effect */}
        {post.cover_image && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img
              src={post.cover_image}
              className="w-full h-full object-cover blur-3xl scale-110"
            />
          </div>
        )}

        <div className="container mx-auto max-w-3xl relative z-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white font-bold mb-8 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Journal
          </Link>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm font-medium text-white/60">
            <span className="flex items-center gap-2">
              <Calendar size={14} />{" "}
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-2">
              <User size={14} /> By Editor
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 -mt-10 relative z-20 pb-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-border max-w-4xl mx-auto">
          {/* Main Cover Image */}
          {post.cover_image && (
            <img
              src={post.cover_image}
              className="w-full h-64 md:h-[400px] object-cover rounded-2xl mb-12 shadow-sm"
            />
          )}

          {/* THE CONTENT RENDERER */}
          {/* 'prose-lg' makes the text larger and easier to read */}
          <article
            className="prose prose-lg prose-slate max-w-none text-brand-muted leading-loose 
                prose-headings:font-bold prose-headings:text-brand-primary 
                prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content),
            }}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
