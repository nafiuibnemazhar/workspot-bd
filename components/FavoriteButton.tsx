"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

export default function FavoriteButton({ cafeId }: { cafeId: number }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, [cafeId]);

  async function checkStatus() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);

    // Check if this cafe is in their favorites
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .eq("cafe_id", cafeId)
      .single();

    if (data) setIsFavorited(true);
    setLoading(false);
  }

  const toggleFavorite = async () => {
    if (!userId) return alert("Please login to save this workspace.");

    // Optimistic Update (Instant UI change)
    const newState = !isFavorited;
    setIsFavorited(newState);

    if (newState) {
      // Add
      await supabase
        .from("favorites")
        .insert([{ user_id: userId, cafe_id: cafeId }]);
    } else {
      // Remove
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("cafe_id", cafeId);
    }
  };

  if (loading)
    return <div className="w-10 h-10 bg-gray-100 rounded-full animate-pulse" />;

  return (
    <button
      onClick={toggleFavorite}
      className={`p-3 rounded-full border transition-all hover:scale-110 active:scale-95 shadow-sm group ${
        isFavorited
          ? "bg-red-50 border-red-100 text-red-500"
          : "bg-white border-gray-200 text-gray-400 hover:text-red-400"
      }`}
      title={isFavorited ? "Remove from Saved" : "Save for later"}
    >
      <Heart
        size={20}
        className={`transition-all ${
          isFavorited ? "fill-red-500" : "group-hover:fill-red-100"
        }`}
      />
    </button>
  );
}
