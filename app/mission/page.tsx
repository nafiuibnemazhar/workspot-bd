import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Coffee, Users } from "lucide-react";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      {/* 1. Hero Text Section */}
      <div className="bg-brand-primary text-white pt-40 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-accent/20 text-brand-accent text-sm font-bold tracking-widest uppercase mb-6 border border-brand-accent/20">
            Our Manifesto
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
            Building the operating system for <br />
            <span className="text-brand-accent">remote work in Dhaka.</span>
          </h1>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
            We believe you shouldn't have to worry about WiFi passwords or power
            cuts. You should just focus on your best work.
          </p>
        </div>
      </div>

      {/* 2. Visual & Story Split */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left: Image Placeholder */}
          <div className="relative h-[500px] w-full bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-2xl group">
            {/* Replace this src with a real photo of people working later */}
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              alt="Team working"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/80 to-transparent flex items-end p-8">
              <p className="text-white font-bold text-lg">
                "Work where you feel most alive."
              </p>
            </div>
          </div>

          {/* Right: The Story */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-brand-primary">
              Why we started WorkSpot
            </h2>
            <div className="prose prose-lg text-brand-muted leading-relaxed">
              <p>
                Dhaka is a city of energy, but for digital nomads, freelancers,
                and students, it can be a city of interruptions. The constant
                search for a quiet corner with a stable connection kills
                productivity.
              </p>
              <p>
                We built WorkSpot to solve the{" "}
                <strong className="text-brand-primary">
                  "Where can I work?"
                </strong>{" "}
                problem once and for all.
              </p>
            </div>

            {/* Value Props List */}
            <div className="space-y-4 pt-4">
              <ValueItem text="Verified Internet Speeds" />
              <ValueItem text="Guaranteed Generator Backup" />
              <ValueItem text="Quiet Zones for Calls" />
              <ValueItem text="Community Verified Reviews" />
            </div>

            <div className="pt-6">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 text-brand-primary font-bold border-b-2 border-brand-primary hover:text-brand-accent hover:border-brand-accent transition-colors pb-1"
              >
                Start Exploring Spaces <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. The "Impact" Grid */}
      <div className="bg-white border-y border-brand-border py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="text-yellow-500" size={32} />}
              title="Productivity First"
              desc="We only list places that understand 'Work'. No loud music, no dim lights."
            />
            <FeatureCard
              icon={<Users className="text-blue-500" size={32} />}
              title="Community Driven"
              desc="Data is updated by real users. Found a broken outlet? Flag it instantly."
            />
            <FeatureCard
              icon={<Coffee className="text-brown-500" size={32} />}
              title="Support Local"
              desc="We help local cafe owners fill their empty tables during off-peak hours."
            />
          </div>
        </div>
      </div>

      {/* 4. Bottom CTA */}
      <div className="container mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-brand-primary mb-6">
          Ready to find your flow?
        </h2>
        <div className="flex justify-center gap-4">
          <Link
            href="/map"
            className="bg-brand-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-accent transition-colors shadow-lg hover:shadow-xl"
          >
            View Map
          </Link>
          <Link
            href="/add-cafe"
            className="bg-white text-brand-primary border border-brand-border px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
            Add a Space
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
