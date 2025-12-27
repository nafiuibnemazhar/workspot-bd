import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MissionPage() {
  return (
    <div className="min-h-screen bg-brand-surface font-sans">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-20 max-w-3xl">
        <span className="text-brand-accent font-bold tracking-widest uppercase text-sm">
          Our Mission
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-brand-primary mt-4 mb-8 leading-tight">
          Making Dhaka remote-work friendly.
        </h1>

        <div className="prose prose-lg text-brand-muted leading-relaxed space-y-6">
          <p>
            Dhaka is a bustling metropolis, but for remote workers, freelancers,
            and students, finding a quiet place with reliable amenities is a
            daily struggle.
          </p>
          <p>
            We built <strong>WorkSpot</strong> to solve one simple problem:{" "}
            <span className="text-brand-primary font-bold">
              "Where can I work from today?"
            </span>
          </p>
          <p>
            No more walking into a cafe only to find there are no outlets, the
            WiFi is broken, or it's too loud to take a call. We verify Internet
            speed, power backup, and overall "workability" so you can be
            productive instantly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard number="50+" label="Verified Spaces" />
          <StatCard number="100%" label="Free to Use" />
          <StatCard number="Dhaka" label="Focused" />
        </div>
      </div>
      <Footer />
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-brand-border text-center">
      <div className="text-3xl font-extrabold text-brand-primary mb-1">
        {number}
      </div>
      <div className="text-sm text-gray-400 font-bold uppercase">{label}</div>
    </div>
  );
}
