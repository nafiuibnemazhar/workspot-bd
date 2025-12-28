"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getAdminUsers,
  banUser,
  getActivityFeed,
  toggleFeaturedCafe,
} from "./actions";
import Link from "next/link";
import {
  LayoutDashboard,
  Coffee,
  FileText,
  Users,
  MessageSquare,
  LogOut,
  TrendingUp,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  MapPin,
  Star,
  Ban,
  CheckCircle,
  Zap,
  Activity,
  Plus, // Fixed: Added Plus
  ArrowUpRight,
  Filter,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

// --- COLORS ---
const BRAND_PRIMARY = "#1e293b";
const ACCENT_COLOR = "#3b82f6";
const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];

// --- ADMIN CONFIG ---
const ADMIN_EMAIL = "admin@example.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // --- DATA STATES ---
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]); // Blog Posts
  const [reviews, setReviews] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // --- ANALYTICS STATES ---
  const [marketSaturation, setMarketSaturation] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. INITIAL LOAD
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Uncomment for production security:
      // if (!user || user.email !== ADMIN_EMAIL) return router.push('/');

      const [
        userList,
        feed,
        { data: allCafes },
        { data: allReviews },
        { data: allPosts }, // Fetch Blogs
      ] = await Promise.all([
        getAdminUsers(),
        getActivityFeed(),
        supabase
          .from("cafes")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("reviews")
          .select("*, cafes(name)")
          .order("created_at", { ascending: false }),
        supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      // FILTER OUT SUPER ADMIN FROM USER LIST
      const regularUsers = (userList || []).filter(
        (u: any) => u.email !== ADMIN_EMAIL
      );

      setUsers(regularUsers);
      setActivityFeed(feed || []);
      setCafes(allCafes || []);
      setReviews(allReviews || []);
      setPosts(allPosts || []);

      processAnalytics(allCafes || [], allReviews || [], regularUsers);
      setLoading(false);
    }
    init();
  }, []);

  // 2. INTELLIGENT ANALYTICS PROCESSING
  const processAnalytics = (cafes: any[], reviews: any[], users: any[]) => {
    setStats({
      totalCafes: cafes.length,
      totalReviews: reviews.length,
      totalUsers: users.length,
      pendingBlogs: 0, // Placeholder
    });

    // A. Market Saturation (Meaningful Location Data)
    // Answers: "Which areas have the most cafes?"
    const locMap: Record<string, number> = {};
    cafes.forEach((c) => {
      const area = c.location.split(",")[0].trim();
      locMap[area] = (locMap[area] || 0) + 1;
    });
    const barData = Object.keys(locMap)
      .map((k) => ({ name: k, count: locMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 Areas
    setMarketSaturation(barData);

    // B. Platform Velocity (Growth)
    // Answers: "Are people actually using the app?"
    const growthMap: Record<string, number> = {};
    reviews.forEach((r) => {
      const date = new Date(r.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      growthMap[date] = (growthMap[date] || 0) + 1;
    });
    // Create last 7 days buckets
    const chartData = Object.keys(growthMap).map((date) => ({
      date,
      reviews: growthMap[date],
    }));
    setGrowthData(chartData);
  };

  // --- ACTIONS ---
  const handleBanUser = async (id: string) => {
    if (!confirm("Ban this user for 100 years?")) return;
    await banUser(id);
    alert("User Banned");
  };

  const handleDelete = async (table: string, id: number | string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await supabase.from(table).delete().eq("id", id);
    // Optimistic Update
    if (table === "posts") setPosts(posts.filter((p) => p.id !== id));
    if (table === "cafes") setCafes(cafes.filter((c) => c.id !== id));
    if (table === "reviews") setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleToggleFeature = async (id: number, currentStatus: boolean) => {
    await toggleFeaturedCafe(id, !currentStatus);
    setCafes(
      cafes.map((c) =>
        c.id === id ? { ...c, is_featured: !currentStatus } : c
      )
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 text-brand-primary font-bold">
        Loading WorkSpot Admin...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100">
      {/* SIDEBAR - MODERNIZED */}
      <aside className="w-72 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            Admin.
          </h2>
        </div>
        <nav className="flex-1 px-6 space-y-1">
          <SidebarItem
            icon={<TrendingUp size={18} />}
            label="Dashboard"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <div className="pt-6 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
            Management
          </div>
          <SidebarItem
            icon={<Coffee size={18} />}
            label="Workspaces"
            active={activeTab === "cafes"}
            onClick={() => setActiveTab("cafes")}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label="Blog Posts"
            active={activeTab === "blog"}
            onClick={() => setActiveTab("blog")}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarItem
            icon={<MessageSquare size={18} />}
            label="Reviews"
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          />
        </nav>
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-slate-500 hover:text-red-600 hover:bg-red-50 w-full p-3 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 p-10">
        {/* TOP HEADER */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize text-slate-900">
              {activeTab === "overview" ? "System Overview" : activeTab}
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your directory efficiently.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center gap-2"
            >
              View Live Site <ExternalLink size={14} />
            </Link>
            {/* DYNAMIC ACTIONS */}
            {activeTab === "cafes" && (
              <Link href="/add-cafe" className="btn-primary">
                <Plus size={18} /> Add Workspace
              </Link>
            )}
            {activeTab === "blog" && (
              <Link href="/admin/write" className="btn-primary">
                <Plus size={18} /> Write Article
              </Link>
            )}
          </div>
        </div>

        {/* --- 1. OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI CARDS - GRID OF 4 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<Coffee size={24} />}
                label="Active Workspaces"
                value={stats.totalCafes}
                color="text-blue-600 bg-blue-50"
                trend="+2 this week"
              />
              <StatCard
                icon={<MessageSquare size={24} />}
                label="Total Reviews"
                value={stats.totalReviews}
                color="text-purple-600 bg-purple-50"
                trend="+15% growth"
              />
              <StatCard
                icon={<Users size={24} />}
                label="Registered Users"
                value={stats.totalUsers}
                color="text-emerald-600 bg-emerald-50"
                trend="Steady increase"
              />
              <StatCard
                icon={<Zap size={24} />}
                label="System Health"
                value="98%"
                color="text-orange-600 bg-orange-50"
                trend="All systems go"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CHART 1: MARKET SATURATION (Valuable) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Market Saturation
                    </h3>
                    <p className="text-xs text-slate-500">
                      Top areas by cafe density. Look for under-served areas.
                    </p>
                  </div>
                </div>
                <div className="h-72 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={marketSaturation}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={true}
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 20px -5px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                        barSize={32}
                      >
                        {marketSaturation.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* CHART 2: RECENT ACTIVITY */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 h-[400px] overflow-hidden flex flex-col">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-slate-400" /> Live Feed
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                  {activityFeed.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 items-start"
                    >
                      <div
                        className={`mt-1.5 min-w-[8px] h-2 rounded-full ${
                          item.type === "review"
                            ? "bg-purple-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm text-slate-700 leading-snug mb-1">
                          {item.type === "review" ? (
                            <>
                              <span className="font-bold text-slate-900">
                                {item.user_name}
                              </span>{" "}
                              rated{" "}
                              <span className="text-blue-600 font-medium">
                                {item.cafes?.name}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-blue-600">
                                New Space:
                              </span>{" "}
                              {item.name} was added.
                            </>
                          )}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wide">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. WORKSPACES --- */}
        {activeTab === "cafes" && (
          <AdminTable
            title="Workspace Directory"
            onSearch={setSearchQuery}
            header={["Name", "Location", "Status", "Actions"]}
          >
            {cafes
              .filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((cafe) => (
                <tr
                  key={cafe.id}
                  className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors"
                >
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900">{cafe.name}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      ID: {cafe.id}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <MapPin size={14} className="inline mr-1 text-slate-400" />{" "}
                    {cafe.location}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() =>
                        handleToggleFeature(cafe.id, cafe.is_featured)
                      }
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all border ${
                        cafe.is_featured
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                    >
                      {cafe.is_featured ? "Featured" : "Standard"}
                    </button>
                  </td>
                  <td className="p-4 text-right pr-6 flex justify-end gap-2">
                    <Link
                      href={`/cafe/${cafe.slug}`}
                      target="_blank"
                      className="action-icon-btn"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <Link
                      href={`/edit-cafe/${cafe.slug}`}
                      className="action-icon-btn text-blue-600"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete("cafes", cafe.id)}
                      className="action-icon-btn text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

        {/* --- 3. BLOG POSTS (RESTORED) --- */}
        {activeTab === "blog" && (
          <AdminTable
            title="Content Management"
            onSearch={setSearchQuery}
            header={["Article Title", "Status", "Author", "Actions"]}
          >
            {posts
              .filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-slate-50/80 border-b border-slate-100 transition-colors"
                >
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900">{post.title}</div>
                    <div className="text-xs text-slate-400">/{post.slug}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        post.published
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-yellow-50 text-yellow-600 border-yellow-100"
                      }`}
                    >
                      {post.published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {post.author_name}
                  </td>
                  <td className="p-4 text-right pr-6 flex justify-end gap-2">
                    <Link
                      href={`/admin/write?id=${post.id}`}
                      className="action-icon-btn text-blue-600"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete("posts", post.id)}
                      className="action-icon-btn text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

        {/* --- 4. USERS (FILTERED) --- */}
        {activeTab === "users" && (
          <AdminTable
            title="Registered Users"
            onSearch={setSearchQuery}
            header={["User", "Joined", "Role", "Actions"]}
          >
            {users
              .filter((u) =>
                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/80 border-b border-slate-100"
                >
                  <td className="p-4 pl-6">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                        {user.email?.charAt(0).toUpperCase()}
                      </div>
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                      Member
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all ml-auto flex items-center gap-1 w-fit"
                    >
                      <Ban size={12} /> Ban
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

        {/* --- 5. REVIEWS --- */}
        {activeTab === "reviews" && (
          <AdminTable
            title="Moderation Queue"
            onSearch={setSearchQuery}
            header={["Author", "Workspace", "Rating", "Content", "Actions"]}
          >
            {reviews
              .filter((r) =>
                r.comment.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-slate-50/80 border-b border-slate-100"
                >
                  <td className="p-4 pl-6 font-bold text-sm text-slate-900">
                    {review.user_name}
                  </td>
                  <td className="p-4 text-sm text-blue-600 font-medium">
                    {review.cafes?.name}
                  </td>
                  <td className="p-4">
                    <div className="flex text-yellow-400">
                      <Star size={14} fill="currentColor" />{" "}
                      <span className="text-slate-600 text-xs ml-1 font-bold">
                        {review.rating}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate italic">
                    "{review.comment}"
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleDelete("reviews", review.id)}
                      className="action-icon-btn text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}
      </main>

      <style jsx global>{`
        .btn-primary {
          @apply px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all;
        }
        .action-icon-btn {
          @apply p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all;
        }
      `}</style>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ icon, label, value, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
        <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-full border border-slate-100">
          {trend}
        </span>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
          {label}
        </p>
      </div>
    </div>
  );
}

function AdminTable({ title, onSearch, header, children }: any) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Filter records..."
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white rounded-xl text-sm border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-400 font-bold tracking-wider">
              {header.map((h: string) => (
                <th
                  key={h}
                  className="p-4 first:pl-6 last:pr-6 last:text-right"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {icon} {label}
    </button>
  );
}
