"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Briefcase,
  DollarSign,
  Clock,
  Plus,
  Loader2,
  ExternalLink,
  X,
  CheckCircle,
  Building2,
  Globe,
  Link as LinkIcon,
  AlignLeft,
  Search,
} from "lucide-react";

export default function GigsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState("All");

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    job_type: "Freelance",
    location_type: "Remote",
    salary_range: "",
    apply_link: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchJobs() {
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (data) setJobs(data);
    setLoading(false);
  }

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to post a job.");
    setSubmitting(true);

    const { error } = await supabase
      .from("jobs")
      .insert({ user_id: user.id, ...formData });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setIsModalOpen(false);
      fetchJobs();
      setFormData({
        title: "",
        company_name: "",
        job_type: "Freelance",
        location_type: "Remote",
        salary_range: "",
        apply_link: "",
        description: "",
      });
    }
    setSubmitting(false);
  };

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((j) => j.job_type === filter);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-[#0f172a] pt-36 pb-24 px-6 relative overflow-hidden shrink-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
            WorkSpot Careers
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Find Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Big Opportunity
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Curated remote roles for developers, designers, and marketers in our
            global community.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-6xl -mt-10 relative z-20 pb-24 flex-1">
        {/* CONTROL BAR */}
        <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto p-1 scrollbar-hide">
            {["All", "Full-time", "Part-time", "Freelance", "Contract"].map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                    filter === type
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {type}
                </button>
              )
            )}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search roles..."
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              onClick={() =>
                user
                  ? setIsModalOpen(true)
                  : alert("Please log in to post a job!")
              }
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} /> Post a Job
            </button>
          </div>
        </div>

        {/* JOB FEED */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-sm font-medium">Fetching opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Briefcase size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No open roles found
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              There are no active listings for this category right now. Check
              back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all group flex flex-col md:flex-row gap-6 relative overflow-hidden"
              >
                {/* Status Stripe */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                {/* Company Logo Placeholder */}
                <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-2xl shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors uppercase">
                  {job.company_name.charAt(0)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex gap-2 shrink-0">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wide rounded-md">
                        {job.job_type}
                      </span>
                      {job.location_type === "Remote" && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-bold uppercase tracking-wide rounded-md">
                          Remote
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-4 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={16} className="text-slate-400" />{" "}
                      {job.company_name}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                        <DollarSign size={16} className="text-emerald-500" />{" "}
                        {job.salary_range}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-400" /> Posted{" "}
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-5 line-clamp-2 md:line-clamp-none pr-8">
                    {job.description}
                  </p>

                  <a
                    href={
                      job.apply_link.includes("@")
                        ? `mailto:${job.apply_link}`
                        : job.apply_link
                    }
                    target="_blank"
                    className="inline-flex items-center gap-2 text-white bg-slate-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                  >
                    Apply Now <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* PREMIUM POST JOB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsModalOpen(false)}
          ></div>

          <div className="bg-white rounded-3xl w-full max-w-3xl relative z-10 shadow-2xl animate-fade-in-up h-[90vh] flex flex-col overflow-hidden">
            {/* Header (Fixed) */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Post a Listing
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  Reach thousands of remote workers instantly.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <form
                id="jobForm"
                onSubmit={handlePostJob}
                className="space-y-8 pb-4"
              >
                {/* Section 1: The Basics */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Briefcase size={12} />
                    </div>
                    The Role
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Job Title"
                      icon={<Briefcase size={16} />}
                      placeholder="e.g. Senior Product Designer"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <InputGroup
                      label="Company Name"
                      icon={<Building2 size={16} />}
                      placeholder="e.g. Acme Inc."
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          company_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                {/* Section 2: Details */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center">
                      <AlignLeft size={12} />
                    </div>
                    Specifics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        Employment Type
                      </label>
                      <div className="relative">
                        <Briefcase
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <select
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                          value={formData.job_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              job_type: e.target.value,
                            })
                          }
                        >
                          <option>Freelance</option>
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
                        Work Location
                      </label>
                      <div className="relative">
                        <Globe
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <select
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                          value={formData.location_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location_type: e.target.value,
                            })
                          }
                        >
                          <option>Remote</option>
                          <option>Hybrid</option>
                          <option>On-site</option>
                        </select>
                      </div>
                    </div>
                    <InputGroup
                      label="Salary / Budget"
                      icon={<DollarSign size={16} />}
                      placeholder="e.g. $60k - $80k"
                      value={formData.salary_range}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary_range: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Section 3: Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <AlignLeft size={12} />
                    </div>
                    About the Job
                  </h3>
                  <div className="relative">
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[160px] resize-none leading-relaxed"
                      placeholder="Describe the responsibilities, requirements, and perks..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Section 4: Application */}
                <div>
                  <InputGroup
                    label="Application Link or Email"
                    icon={<LinkIcon size={16} />}
                    placeholder="https://... or mailto:hr@acme.com"
                    value={formData.apply_link}
                    onChange={(e) =>
                      setFormData({ ...formData, apply_link: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-slate-400 mt-2 ml-1">
                    Applicants will be directed to this link to apply.
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Action (Fixed at Bottom) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  document.getElementById("jobForm")?.requestSubmit()
                }
                disabled={submitting}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <CheckCircle size={16} />
                )}
                {submitting ? "Publishing..." : "Publish Job Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB COMPONENT: PRO INPUT GROUP ---
function InputGroup({
  label,
  icon,
  placeholder,
  value,
  onChange,
  required,
}: any) {
  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-slate-700 mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
        <input
          required={required}
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm group-focus-within:bg-white"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
