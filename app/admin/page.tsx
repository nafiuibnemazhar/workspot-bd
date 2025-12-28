"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  LayoutDashboard,
  Coffee,
  FileText,
  MessageSquare,
  LogOut,
  TrendingUp,
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  MapPin,
  Star,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🔒 STRICT ADMIN EMAIL CHECK
const ADMIN_EMAIL = "admin@example.com"; // <--- MAKE SURE THIS MATCHES YOUR LOGIN

// Dummy Data
const GRAPH_DATA = [
  { name: "Mon", views: 400, visitors: 240 },
  { name: "Tue", views: 300, visitors: 139 },
  { name: "Wed", views: 200, visitors: 980 },
  { name: "Thu", views: 278, visitors: 390 },
  { name: "Fri", views: 189, visitors: 480 },
  { name: "Sat", views: 239, visitors: 380 },
  { name: "Sun", views: 349, visitors: 430 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // DATA STATES
  const [stats, setStats] = useState({
    totalCafes: 0,
    totalPosts: 0,
    totalReviews: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Check Security First
    checkAdmin();
  }, []);

  // 2. Fetch data only if tab changes (and user is allowed)
  useEffect(() => {
    if (!loading) {
      if (activeTab === "overview") fetchStats();
      if (activeTab === "blog") fetchPosts();
      if (activeTab === "cafes") fetchCafes();
      if (activeTab === "reviews") fetchReviews();
    }
  }, [activeTab, loading]);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 🔒 SECURITY GATE
    if (!user || user.email !== ADMIN_EMAIL) {
      router.push("/"); // Kick them out
      return; // Stop execution here
    }

    // If we pass, stop loading and show dashboard
    setLoading(false);
    fetchStats(); // Load initial stats
  }

  // --- FETCHERS ---
  async function fetchStats() {
    const { count: cafeCount } = await supabase
      .from("cafes")
      .select("*", { count: "exact", head: true });
    const { count: postCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });
    const { count: reviewCount } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true });
    setStats({
      totalCafes: cafeCount || 0,
      totalPosts: postCount || 0,
      totalReviews: reviewCount || 0,
    });
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
  }

  async function fetchCafes() {
    const { data } = await supabase
      .from("cafes")
      .select("*")
      .order("created_at", { ascending: false });
    setCafes(data || []);
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from("reviews")
      .select("*, cafes(name)")
      .order("created_at", { ascending: false });
    setReviews(data || []);
  }

  // --- ACTIONS ---
  const handleDelete = async (table: string, id: number | string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await supabase.from(table).delete().eq("id", id);

    if (table === "posts") fetchPosts();
    if (table === "cafes") fetchCafes();
    if (table === "reviews") fetchReviews();
    fetchStats();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirect home immediately
  };

  // 🔒 LOADING STATE BLOCKS VIEW
  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 text-brand-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary mb-4"></div>
        <h2 className="font-bold text-xl">Verifying Admin Access...</h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-extrabold text-brand-primary flex items-center gap-2">
            <LayoutDashboard className="text-brand-accent" /> Admin
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<TrendingUp size={20} />}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarItem
            icon={<Coffee size={20} />}
            label="Workspaces"
            active={activeTab === "cafes"}
            onClick={() => setActiveTab("cafes")}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            label="Blog Posts"
            active={activeTab === "blog"}
            onClick={() => setActiveTab("blog")}
          />
          <SidebarItem
            icon={<MessageSquare size={20} />}
            label="Reviews"
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-500 hover:text-red-500 hover:bg-red-50 w-full p-3 rounded-xl transition-colors font-bold text-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 p-8">
        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold capitalize">{activeTab}</h1>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              View Site
            </Link>
            {activeTab === "blog" && (
              <Link
                href="/admin/posts/write"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-accent shadow-lg flex items-center gap-2"
              >
                <Plus size={16} /> New Post
              </Link>
            )}
            {activeTab === "cafes" && (
              <Link
                href="/add-cafe"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-accent shadow-lg flex items-center gap-2"
              >
                <Plus size={16} /> New Cafe
              </Link>
            )}
          </div>
        </div>

        {/* --- 1. OVERVIEW TAB --- */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                icon={<Coffee size={24} />}
                label="Total Spaces"
                value={stats.totalCafes}
                color="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={<FileText size={24} />}
                label="Blog Posts"
                value={stats.totalPosts}
                color="bg-purple-50 text-purple-600"
              />
              <StatCard
                icon={<MessageSquare size={24} />}
                label="Total Reviews"
                value={stats.totalReviews}
                color="bg-orange-50 text-orange-600"
              />
            </div>

            {/* ANALYTICS GRAPH */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-6">
                Traffic Overview (Demo)
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={GRAPH_DATA}>
                    <defs>
                      <linearGradient
                        id="colorViews"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#2563EB"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#2563EB"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E5E7EB"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#2563EB"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* --- 2. WORKSPACES MANAGEMENT --- */}
        {activeTab === "cafes" && (
          <AdminTable
            title="All Workspaces"
            searchPlaceholder="Search cafes..."
            onSearch={setSearchQuery}
            header={["Name", "Location", "Rating", "Actions"]}
          >
            {cafes
              .filter((c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((cafe) => (
                <tr
                  key={cafe.id}
                  className="hover:bg-gray-50/50 border-b border-gray-100"
                >
                  <td className="p-4 pl-6 font-bold text-gray-900">
                    {cafe.name}
                  </td>
                  <td className="p-4 text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} /> {cafe.location}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md w-fit text-xs font-bold border border-yellow-100">
                      <Star
                        size={10}
                        className="fill-yellow-500 text-yellow-500"
                      />{" "}
                      {cafe.rating}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/cafe/${cafe.slug}`}
                        target="_blank"
                        className="action-btn"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <Link
                        href={`/edit-cafe/${cafe.slug}`}
                        className="action-btn text-blue-600 bg-blue-50"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete("cafes", cafe.id)}
                        className="action-btn text-red-600 bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

        {/* --- 3. BLOG MANAGEMENT --- */}
        {activeTab === "blog" && (
          <AdminTable
            title="All Blog Posts"
            searchPlaceholder="Search titles..."
            onSearch={setSearchQuery}
            header={["Title", "Status", "Author", "Actions"]}
          >
            {posts
              .filter((p) =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50/50 border-b border-gray-100"
                >
                  <td className="p-4 pl-6">
                    <div className="font-bold text-gray-900">{post.title}</div>
                    <div className="text-xs text-gray-400">/{post.slug}</div>
                  </td>
                  <td className="p-4">
                    <StatusBadge active={post.published} />
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {post.author_name}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/posts/write?id=${post.id}`}
                        className="action-btn text-blue-600 bg-blue-50"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete("posts", post.id)}
                        className="action-btn text-red-600 bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

        {/* --- 4. REVIEWS MODERATION --- */}
        {activeTab === "reviews" && (
          <AdminTable
            title="Recent Reviews"
            searchPlaceholder="Search reviews..."
            onSearch={setSearchQuery}
            header={["User", "Workspace", "Rating", "Comment", "Actions"]}
          >
            {reviews
              .filter((r) =>
                r.comment.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((review) => (
                <tr
                  key={review.id}
                  className="hover:bg-gray-50/50 border-b border-gray-100"
                >
                  <td className="p-4 pl-6 font-bold text-sm">
                    {review.user_name}
                  </td>
                  <td className="p-4 text-sm text-brand-primary">
                    {review.cafes?.name || "Unknown"}
                  </td>
                  <td className="p-4">
                    <div className="flex text-yellow-400">
                      <Star size={14} fill="currentColor" />{" "}
                      <span className="text-gray-600 text-xs ml-1 font-bold">
                        {review.rating}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                    {review.comment}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleDelete("reviews", review.id)}
                      className="action-btn text-red-600 bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}
      </main>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm ${
        active
          ? "bg-brand-primary text-white shadow-md"
          : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 font-bold mb-1">{label}</p>
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
    </div>
  );
}

function AdminTable({
  title,
  searchPlaceholder,
  onSearch,
  header,
  children,
}: any) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-lg text-gray-700">{title}</h3>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white rounded-lg text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-brand-accent/20 w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold">
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
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {active ? "Published" : "Draft"}
    </span>
  );
}
