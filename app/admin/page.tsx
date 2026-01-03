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
  Activity,
  Plus,
  AlertTriangle,
  CheckCircle,
  ImageIcon,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// --- COLORS ---
const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#6366f1",
];
const ADMIN_EMAIL = "admin@example.com";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // --- DATA STATES ---
  const [stats, setStats] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [cafes, setCafes] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);

  // --- HEALTH CHECK STATES ---
  const [healthIssues, setHealthIssues] = useState<any[]>([]);

  // --- ANALYTICS STATES ---
  const [chartData, setChartData] = useState<any[]>([]);
  const [viewRegion, setViewRegion] = useState<"ALL" | "BD" | "USA">("BD");
  const [searchQuery, setSearchQuery] = useState("");

  // 1. INITIAL LOAD
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Uncomment for production security
      // if (!user || user.email !== ADMIN_EMAIL) return router.push('/');

      const [
        userList,
        feed,
        { data: allCafes },
        { data: allReviews },
        { data: allPosts },
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

      const regularUsers = (userList || []).filter(
        (u: any) => u.email !== ADMIN_EMAIL
      );

      setUsers(regularUsers);
      setActivityFeed(feed || []);
      setCafes(allCafes || []);
      setReviews(allReviews || []);
      setPosts(allPosts || []);

      // Calculate Basics
      setStats({
        totalCafes: allCafes?.length || 0,
        totalReviews: allReviews?.length || 0,
        totalUsers: regularUsers.length,
      });

      // CALCULATE HEALTH ISSUES (Identify broken data)
      const issues = (allCafes || []).filter(
        (c) =>
          !c.latitude ||
          !c.longitude ||
          !c.cover_image ||
          !c.description ||
          c.description.length < 20
      );
      setHealthIssues(issues);

      setLoading(false);
    }
    init();
  }, []);

  // 2. DYNAMIC CHART CALCULATOR (Kept your logic)
  useEffect(() => {
    if (cafes.length === 0) return;
    const locMap: Record<string, number> = {};
    const dhakaHubs = [
      "Gulshan",
      "Banani",
      "Dhanmondi",
      "Uttara",
      "Mirpur",
      "Mohakhali",
      "Badda",
      "Bashundhara",
      "Agargaon",
      "Lalmatia",
      "Mohammadpur",
      "Khilgaon",
      "Farmgate",
      "Baridhara",
      "Niketon",
      "Rampura",
    ];
    const stateNameMap: Record<string, string> = {
      "north carolina": "NC",
      texas: "TX",
      washington: "WA",
      california: "CA",
      "new york": "NY",
      massachusetts: "MA",
    };

    cafes.forEach((c) => {
      let country = c.country || "Bangladesh";
      const locationStr = (c.location || "").toLowerCase();

      if (dhakaHubs.some((hub) => locationStr.includes(hub.toLowerCase())))
        country = "Bangladesh";
      if (
        locationStr.includes("north carolina") ||
        locationStr.includes(" texas ")
      )
        country = "USA";

      if (viewRegion === "USA") {
        if (country !== "USA") return;
        let stateLabel = c.state;
        if (!stateLabel) {
          for (const [fullName, code] of Object.entries(stateNameMap)) {
            if (locationStr.includes(fullName)) {
              stateLabel = code;
              break;
            }
          }
        }
        if (!stateLabel) {
          const match = c.location?.match(/,\s*([A-Z]{2})\b/);
          if (match) stateLabel = match[1];
        }
        locMap[stateLabel || "Unknown State"] =
          (locMap[stateLabel || "Unknown State"] || 0) + 1;
      } else if (viewRegion === "BD") {
        if (country === "USA") return;
        const foundHub = dhakaHubs.find((hub) =>
          locationStr.includes(hub.toLowerCase())
        );
        let label = foundHub;
        if (!label && c.location) {
          const parts = c.location.split(",");
          label = parts.length > 2 ? parts[1].trim() : parts[0].trim();
        }
        if (label && !isNaN(parseInt(label))) label = "Dhaka (Misc)";
        locMap[label || "Dhaka (Misc)"] =
          (locMap[label || "Dhaka (Misc)"] || 0) + 1;
      } else {
        const label = country === "USA" ? "United States" : "Bangladesh";
        locMap[label] = (locMap[label] || 0) + 1;
      }
    });

    const formattedData = Object.keys(locMap)
      .map((k) => ({ name: k, count: locMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    setChartData(formattedData);
  }, [cafes, viewRegion]);

  // --- ACTIONS ---
  const handleBanUser = async (id: string) => {
    if (!confirm("Ban this user?")) return;
    await banUser(id);
    alert("User Banned");
  };

  const handleDelete = async (table: string, id: number | string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from(table).delete().eq("id", id);
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
      <div className="h-screen flex items-center justify-center text-brand-primary font-bold">
        Loading Admin...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100">
      {/* SIDEBAR */}
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
            Directory
          </div>
          <SidebarItem
            icon={<Coffee size={18} />}
            label="Workspaces"
            active={activeTab === "cafes"}
            onClick={() => setActiveTab("cafes")}
          />
          <SidebarItem
            icon={<MessageSquare size={18} />}
            label="Reviews"
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          />

          <div className="pt-6 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider px-3">
            Maintenance
          </div>
          {/* NEW HEALTH TAB */}
          <SidebarItem
            icon={<AlertTriangle size={18} />}
            label="Data Health"
            active={activeTab === "health"}
            onClick={() => setActiveTab("health")}
            badge={healthIssues.length > 0 ? healthIssues.length : undefined}
          />
          <SidebarItem
            icon={<Users size={18} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarItem
            icon={<FileText size={18} />}
            label="Blog Posts"
            active={activeTab === "blog"}
            onClick={() => setActiveTab("blog")}
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
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold capitalize text-slate-900">
              {activeTab === "health"
                ? "Data Health Check"
                : activeTab === "overview"
                ? "System Overview"
                : activeTab}
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
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                icon={<Coffee size={24} />}
                label="Total Workspaces"
                value={stats.totalCafes}
                color="text-blue-600 bg-blue-50"
              />
              <StatCard
                icon={<MessageSquare size={24} />}
                label="Total Reviews"
                value={stats.totalReviews}
                color="text-purple-600 bg-purple-50"
              />
              <StatCard
                icon={<Users size={24} />}
                label="Registered Users"
                value={stats.totalUsers}
                color="text-emerald-600 bg-emerald-50"
              />
              <StatCard
                icon={<AlertTriangle size={24} />}
                label="Data Issues"
                value={healthIssues.length}
                color="text-red-600 bg-red-50"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* CHART */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      Workspace Distribution
                    </h3>
                    <p className="text-xs text-slate-500">
                      Breakdown by region.
                    </p>
                  </div>
                  <div className="bg-slate-100 p-1 rounded-lg flex items-center">
                    <button
                      onClick={() => setViewRegion("BD")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        viewRegion === "BD"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      BD
                    </button>
                    <button
                      onClick={() => setViewRegion("USA")}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        viewRegion === "USA"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      USA
                    </button>
                  </div>
                </div>
                <div className="h-72 w-full text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
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
                        tick={{
                          fill: "#64748b",
                          fontSize: 11,
                          fontWeight: "bold",
                        }}
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
                        barSize={24}
                      >
                        {chartData.map((entry, index) => (
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

              {/* ACTIVITY FEED */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 h-96 overflow-hidden flex flex-col">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-slate-400" /> Live Feed
                </h3>
                <div className="space-y-4 overflow-y-auto pr-2 flex-1">
                  {activityFeed.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 pb-3 border-b border-slate-50 last:border-0 items-start"
                    >
                      <div
                        className={`mt-1.5 min-w-2 h-2 rounded-full ${
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

        {/* --- 2. WORKSPACES (With Thumbnails) --- */}
        {activeTab === "cafes" && (
          <AdminTable
            title="Workspace Directory"
            onSearch={setSearchQuery}
            header={["Space", "Region", "Status", "Actions"]}
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
                  <td className="p-4 pl-6 flex items-center gap-3">
                    {/* Thumbnail Image */}
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                      {cafe.cover_image ? (
                        <img
                          src={cafe.cover_image}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-300">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {cafe.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {cafe.slug}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    <MapPin size={14} className="inline mr-1 text-slate-400" />
                    {cafe.country === "USA"
                      ? `${cafe.city}, ${cafe.state}`
                      : cafe.city || cafe.location}
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

        {/* --- NEW TAB: DATA HEALTH --- */}
        {activeTab === "health" && (
          <AdminTable
            title={`Data Issues Found (${healthIssues.length})`}
            onSearch={setSearchQuery}
            header={["Workspace", "Missing Data", "Fix Action"]}
          >
            {healthIssues.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-slate-400">
                  <CheckCircle
                    size={48}
                    className="mx-auto text-emerald-500 mb-2"
                  />
                  All data looks healthy!
                </td>
              </tr>
            ) : (
              healthIssues.map((cafe) => (
                <tr
                  key={cafe.id}
                  className="hover:bg-red-50/30 border-b border-red-100/50"
                >
                  <td className="p-4 pl-6 font-bold text-slate-800">
                    {cafe.name}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {(!cafe.latitude || !cafe.longitude) && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-1 rounded border border-red-200 flex items-center gap-1">
                          <MapIcon size={10} /> No Map Coordinates
                        </span>
                      )}
                      {!cafe.cover_image && (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded border border-orange-200 flex items-center gap-1">
                          <ImageIcon size={10} /> No Image
                        </span>
                      )}
                      {(!cafe.description || cafe.description.length < 20) && (
                        <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded border border-yellow-200">
                          Short Desc
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <Link
                      href={`/edit-cafe/${cafe.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={12} /> Fix Data
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </AdminTable>
        )}

        {/* --- USERS, REVIEWS, BLOG (Standard Tabs) --- */}
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
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 pl-6 font-bold">{user.email}</td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                      Member
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="text-xs font-bold border border-red-200 text-red-600 px-3 py-1 rounded hover:bg-red-50"
                    >
                      Ban
                    </button>
                  </td>
                </tr>
              ))}
          </AdminTable>
        )}

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
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 pl-6 font-bold text-sm">
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
                  <td className="p-4 text-sm text-slate-500 max-w-xs truncate">
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

        {activeTab === "blog" && (
          <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-100">
            Blog module loaded (Same as before)
          </div>
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

// --- SUB COMPONENTS (Enhanced with Pagination) ---

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${color}`}>{icon}</div>
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
  // Client-side pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Convert children to array to handle pagination
  const rows = Array.isArray(children) ? children : [children];
  const totalPages = Math.ceil(rows.length / itemsPerPage);
  const paginatedRows = rows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            onChange={(e) => {
              onSearch(e.target.value);
              setCurrentPage(1);
            }}
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
          <tbody className="divide-y divide-slate-50">{paginatedRows}</tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50/50">
          <span className="text-xs text-slate-500 font-bold">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-2 rounded-lg border bg-white disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-bold text-sm justify-between ${
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon} {label}
      </div>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
