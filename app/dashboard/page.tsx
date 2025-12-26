"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_DASHBOARD_CAFES } from "@/lib/queries"; // Updated import
import Navbar from "@/components/Navbar";
import { Plus, Coffee, Loader2, LogOut, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();

  // 1. Security Check
  useEffect(() => {
    const token = localStorage.getItem("workspot_token");
    if (!token) router.push("/login");
  }, [router]);

  // 2. Fetch ALL Data (Admin Mode)
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_CAFES, {
    // We add this to ensure we don't get cached "empty" results
    fetchPolicy: "network-only",
    context: {
      headers: {
        authorization:
          typeof window !== "undefined"
            ? `Bearer ${localStorage.getItem("workspot_token")}`
            : "",
      },
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("workspot_token");
    localStorage.removeItem("workspot_user");
    router.push("/login");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-brand-light">
        <Loader2 className="animate-spin text-brand-orange" size={40} />
      </div>
    );

  // Real Data from WordPress
  const cafes = data?.cafes?.nodes || [];
  const userName = data?.viewer?.name || "Admin";

  return (
    <div className="min-h-screen bg-brand-light">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark">
              Admin Dashboard
            </h1>
            <p className="text-brand-dark/50">
              Managing platform as{" "}
              <span className="font-bold text-brand-orange">{userName}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>
            <Link
              href="/add-cafe"
              className="flex items-center gap-2 bg-brand-dark text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-orange transition-all shadow-lg hover:shadow-brand-orange/20"
            >
              <Plus size={18} />
              Add Cafe
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* REAL STAT: Total Cafes */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-beige relative overflow-hidden">
            <div className="relative z-10">
              <div className="text-brand-dark/40 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                <Coffee size={14} /> Total Cafes
              </div>
              <div className="text-4xl font-extrabold text-brand-dark">
                {cafes.length}
              </div>
            </div>
            {/* Decorative blob */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-orange/10 rounded-full" />
          </div>

          {/* PLACEHOLDER STAT: Views */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-beige opacity-60">
            <div className="text-brand-dark/40 font-bold uppercase text-xs mb-2 flex items-center gap-2">
              <TrendingUp size={14} /> Views (Coming Soon)
            </div>
            <div className="text-4xl font-extrabold text-brand-dark">--</div>
          </div>

          {/* PLACEHOLDER STAT: Users */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-beige opacity-60">
            <div className="text-brand-dark/40 font-bold uppercase text-xs mb-2 flex items-center gap-2">
              <Users size={14} /> Active Users (Coming Soon)
            </div>
            <div className="text-4xl font-extrabold text-brand-orange">--</div>
          </div>
        </div>

        {/* The Real Data Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-brand-beige overflow-hidden">
          <div className="px-8 py-6 border-b border-brand-beige flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-brand-dark">All Listings</h2>
            <button
              onClick={() => refetch()}
              className="text-xs font-bold text-brand-orange hover:underline"
            >
              Refresh List
            </button>
          </div>

          {cafes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-brand-light/50 text-xs uppercase text-brand-dark/50 font-bold">
                  <tr>
                    <th className="px-8 py-4">Cafe Name</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Created</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-beige/30">
                  {cafes.map((cafe: any) => (
                    <tr
                      key={cafe.id}
                      className="hover:bg-brand-light/30 transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="font-bold text-brand-dark">
                          {cafe.title}
                        </div>
                        <div className="text-xs text-brand-dark/40">
                          {cafe.slug}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                            cafe.status === "publish"
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                          }`}
                        >
                          {cafe.status === "publish" ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-brand-dark/60 font-medium">
                        {new Date(cafe.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <Link
                          href={`/cafe/${cafe.slug}`}
                          className="text-sm font-bold text-brand-dark hover:text-brand-orange mr-4"
                        >
                          View
                        </Link>
                        <button className="text-sm font-bold text-brand-dark/40 hover:text-brand-dark">
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center justify-center">
              <div className="bg-brand-light p-6 rounded-full mb-6 border border-brand-beige">
                <Coffee size={40} className="text-brand-dark/20" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                No Cafes Found
              </h3>
              <p className="text-brand-dark/50 mb-8 max-w-sm mx-auto">
                Your database is empty or the connection is lost. Try adding a
                cafe manually in WordPress to test.
              </p>
              <Link
                href="/add-cafe"
                className="text-brand-orange font-bold hover:underline"
              >
                Create First Listing &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
