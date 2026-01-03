"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Coffee,
  Briefcase,
  User,
  LayoutDashboard,
  FileText,
  Map,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Data State
  const [cafes, setCafes] = React.useState<any[]>([]);
  const [jobs, setJobs] = React.useState<any[]>([]);
  const [users, setUsers] = React.useState<any[]>([]);

  // Toggle with Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Real-time Search Logic
  React.useEffect(() => {
    if (!open || search.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);

      const [cafeRes, jobRes, userRes] = await Promise.all([
        supabase
          .from("cafes")
          .select("name, slug, city")
          .ilike("name", `%${search}%`)
          .limit(3),
        supabase
          .from("jobs")
          .select("title, id, company_name")
          .ilike("title", `%${search}%`)
          .limit(3),
        supabase
          .from("profiles")
          .select("username, full_name")
          .ilike("full_name", `%${search}%`)
          .limit(3),
      ]);

      setCafes(cafeRes.data || []);
      setJobs(jobRes.data || []);
      setUsers(userRes.data || []);
      setLoading(false);
    }, 300); // 300ms Debounce

    return () => clearTimeout(timer);
  }, [search, open]);

  // Navigation Helper
  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Global Command Menu"
      className="fixed inset-0 z-[100] p-4 pt-[15vh] flex items-start justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
        {/* Input Field */}
        <div className="flex items-center border-b border-slate-100 px-4">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search workspaces, jobs, or people..."
            className="w-full py-4 text-base outline-none placeholder:text-slate-400 text-slate-900"
          />
          {loading && (
            <Loader2 className="animate-spin text-blue-500" size={18} />
          )}
        </div>

        {/* Results List */}
        <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
          <Command.Empty className="py-6 text-center text-sm text-slate-500">
            No results found.
          </Command.Empty>

          {/* 1. NAVIGATION SHORTCUTS */}
          <Command.Group
            heading="Quick Links"
            className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2"
          >
            <Item
              icon={<LayoutDashboard />}
              text="Home / Directory"
              onSelect={() => runCommand(() => router.push("/"))}
            />
            <Item
              icon={<Map />}
              text="Global Map"
              onSelect={() => runCommand(() => router.push("/map"))}
            />
            <Item
              icon={<Briefcase />}
              text="Remote Jobs"
              onSelect={() => runCommand(() => router.push("/gigs"))}
            />
            <Item
              icon={<User />}
              text="My Profile"
              onSelect={() => runCommand(() => router.push("/profile"))}
            />
          </Command.Group>

          {/* 2. DYNAMIC SEARCH RESULTS */}
          {cafes.length > 0 && (
            <Command.Group
              heading="Workspaces"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2"
            >
              {cafes.map((c) => (
                <Item
                  key={c.slug}
                  icon={<Coffee className="text-orange-500" />}
                  text={c.name}
                  sub={c.city}
                  onSelect={() =>
                    runCommand(() => router.push(`/cafe/${c.slug}`))
                  }
                />
              ))}
            </Command.Group>
          )}

          {jobs.length > 0 && (
            <Command.Group
              heading="Opportunities"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2"
            >
              {jobs.map((j) => (
                <Item
                  key={j.id}
                  icon={<Briefcase className="text-blue-500" />}
                  text={j.title}
                  sub={j.company_name}
                  onSelect={() => runCommand(() => router.push(`/gigs`))}
                />
              ))}
            </Command.Group>
          )}

          {users.length > 0 && (
            <Command.Group
              heading="People"
              className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2 mt-2"
            >
              {users.map((u) => (
                <Item
                  key={u.username}
                  icon={<User className="text-emerald-500" />}
                  text={u.full_name}
                  sub={`@${u.username}`}
                  onSelect={() =>
                    runCommand(() => router.push(`/u/${u.username}`))
                  }
                />
              ))}
            </Command.Group>
          )}
        </Command.List>

        <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50 text-[10px] text-slate-400 font-medium">
          <div className="flex gap-2">
            <span>
              Navigate{" "}
              <kbd className="bg-white border border-slate-200 rounded px-1">
                ↓
              </kbd>{" "}
              <kbd className="bg-white border border-slate-200 rounded px-1">
                ↑
              </kbd>
            </span>
            <span>
              Select{" "}
              <kbd className="bg-white border border-slate-200 rounded px-1">
                Enter
              </kbd>
            </span>
          </div>
          <span>WorkSpot Command</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

// Sub-component for Cleaner Items
function Item({ icon, text, sub, onSelect }: any) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-black cursor-pointer group transition-all text-sm aria-selected:bg-blue-50 aria-selected:text-blue-700"
    >
      <div className="w-5 h-5 flex items-center justify-center opacity-70 group-hover:opacity-100">
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold">{text}</span>
        {sub && <span className="text-xs opacity-60 font-normal">{sub}</span>}
      </div>
      <ArrowRight
        size={14}
        className="ml-auto opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 text-blue-500 transition-opacity"
      />
    </Command.Item>
  );
}
