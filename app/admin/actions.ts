"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase"; // Regular client for public data

// 1. GET ALL USERS (Only Admin Client can do this)
export async function getAdminUsers() {
  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw error;
  return users;
}

// 2. BAN USER
export async function banUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: "876000h", // 100 years
  });
  if (error) throw error;
}

// 3. GET ACTIVITY FEED (Aggregating multiple tables)
export async function getActivityFeed() {
  // Fetch recent 5 reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("created_at, rating, cafes(name), user_name")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent 5 new cafes
  const { data: cafes } = await supabase
    .from("cafes")
    .select("created_at, name, location")
    .order("created_at", { ascending: false })
    .limit(5);

  // Merge and sort
  const feed = [
    ...(reviews || []).map((r) => ({ ...r, type: "review" })),
    ...(cafes || []).map((c) => ({ ...c, type: "cafe" })),
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10); // Keep top 10

  return feed;
}

// 4. TOGGLE FEATURED
export async function toggleFeaturedCafe(id: number, status: boolean) {
  const { error } = await supabaseAdmin
    .from("cafes")
    .update({ is_featured: status })
    .eq("id", id);
  if (error) throw error;
}
