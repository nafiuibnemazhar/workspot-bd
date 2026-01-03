import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Zap,
  Globe,
  ShieldCheck,
  Wifi,
} from "lucide-react";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      {/* 1. HERO: The Core Promise */}
      <div className="bg-brand-primary text-white pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-accent/20 text-brand-accent text-sm font-bold tracking-widest uppercase mb-6 border border-brand-accent/20">
            Our Manifesto
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
            We are building the <br />
            <span className="text-brand-accent">
              search engine for deep work.
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The world is your office, but not every coffee shop is a workspace.
            We verify the essentials—WiFi, power, and quiet—so you never have to
            guess.
          </p>
        </div>
      </div>

      {/* 2. THE STORY: The Universal Struggle */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* ... inside the split grid ... */}

          {/* Left: Image Placeholder */}
          <div className="relative h-125 w-full bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl group">
            <img
              src="/mission.jpg" // <--- CHANGED THIS
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              alt="Deep work session"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 to-transparent flex items-end p-8">
              <p className="text-white font-bold text-lg italic">
                "Productivity shouldn't be a gamble."
              </p>
            </div>
          </div>

          {/* Right: The Solution */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-brand-primary">
              Why we exist
            </h2>
            <div className="prose prose-lg text-brand-muted leading-relaxed">
              <p>
                Remote work gave us freedom, but it also gave us a new problem:{" "}
                <strong>The Logistics of "Where."</strong>
              </p>
              <p>
                Every remote worker knows the anxiety of walking into a cafe
                before a meeting, praying the WiFi works and the music isn't too
                loud. We believe that finding a place to work should be as
                reliable as opening your laptop.
              </p>
              <p>
                We are creating a standardized{" "}
                <strong>"Work-Ready" protocol</strong>. When you see a spot on
                our platform, you know exactly what you're walking into.
              </p>
            </div>

            {/* Universal Value Props */}
            <div className="space-y-4 pt-4">
              <ValueItem text="Standardized Connectivity Scoring" />
              <ValueItem text="Verified Power Outlet Availability" />
              <ValueItem text="Objective Noise Level Ratings" />
              <ValueItem text="Community-Driven Reliability" />
            </div>

            <div className="pt-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-brand-primary font-bold border-b-2 border-brand-primary hover:text-brand-accent hover:border-brand-accent transition-colors pb-1"
              >
                Start Your Search <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. IMPACT GRID: What User Gets */}
      <div className="bg-white border-y border-brand-border py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ShieldCheck className="text-green-500" size={32} />}
              title="Eliminate Uncertainty"
              desc="Stop buying $5 coffees just to find out the WiFi is broken. We verify the infrastructure before you arrive."
            />
            <FeatureCard
              icon={<Wifi className="text-blue-500" size={32} />}
              title="The Speed Standard"
              desc="We don't just say 'WiFi Available'. We verify if it's fast enough for a 4K Zoom call."
            />
            <FeatureCard
              icon={<Zap className="text-yellow-500" size={32} />}
              title="Power to the People"
              desc="Filter specifically for spots with accessible outlets so your workflow is never interrupted by a dead battery."
            />
          </div>
        </div>
      </div>

      {/* 4. CTA: Universal Call to Action */}
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-brand-primary mb-6">
          Your best work is waiting.
        </h2>
        <div className="flex justify-center gap-4">
          <Link
            href="/search"
            className="bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg hover:shadow-xl"
          >
            Find a Workspace
          </Link>
          <Link
            href="/add-cafe"
            className="bg-white text-brand-primary border border-brand-border px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Verify a Location
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Sub-components
function ValueItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-green-100 text-green-600 p-1 rounded-full">
        <CheckCircle2 size={16} />
      </div>
      <span className="font-medium text-brand-primary">{text}</span>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-brand-surface border border-brand-border hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="mb-4 bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-brand-primary mb-2">{title}</h3>
      <p className="text-brand-muted leading-relaxed">{desc}</p>
    </div>
  );
}
