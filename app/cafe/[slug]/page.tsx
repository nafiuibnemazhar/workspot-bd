import { mockCafes } from '@/types/mockData';
import { notFound } from 'next/navigation';
import { Wifi, Zap, Coffee, Thermometer, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MapWrapper from '@/components/MapWrapper'; // <--- Import the wrapper normally

// This function generates the list of valid URLs for static export
export function generateStaticParams() {
  return mockCafes.map((cafe) => ({
    slug: cafe.slug,
  }));
}

// UPDATE: In Next.js 15, params is a Promise. We must type it as Promise and await it.
export default async function CafeDetails({ params }: { params: Promise<{ slug: string }> }) {
  
  // 1. Await the params to get the slug (Crucial Fix for Next.js 15)
  const { slug } = await params;

  // 2. Find the cafe that matches the URL slug
  const cafe = mockCafes.find((c) => c.slug === slug);

  // 3. If cafe doesn't exist, show 404 page
  if (!cafe) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-brand-light py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-brand-dark/60 hover:text-brand-orange mb-8 transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={16} />
          Back to Directory
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-brand-beige overflow-hidden">
          
          {/* Header Banner (Simulated) */}
          <div className="h-48 bg-brand-beige/30 flex items-center justify-center border-b border-brand-beige">
             <span className="text-brand-dark/20 text-4xl font-bold uppercase tracking-widest">Cafe Image Placeholder</span>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">{cafe.title}</h1>
                    <div className="flex items-center gap-2 text-brand-dark/60">
                        <MapPin size={18} />
                        <span className="font-medium">Dhaka, Bangladesh</span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
                    cafe.cafeSpecs.hasGenerator 
                    ? 'bg-brand-beige border-brand-beige text-brand-dark' 
                    : 'bg-red-50 border-red-100 text-red-600'
                }`}>
                    <Zap size={20} className={cafe.cafeSpecs.hasGenerator ? "fill-brand-dark" : ""} />
                    <span className="font-bold">{cafe.cafeSpecs.hasGenerator ? 'Generator Available' : 'No Generator'}</span>
                </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Spec 1 */}
                <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-beige/50">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-brand-orange">
                            <Wifi size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-dark/50 uppercase tracking-wide">WiFi Speed</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark pl-1">{cafe.cafeSpecs.wifiSpeed} <span className="text-lg font-medium text-brand-dark/40">Mbps</span></p>
                </div>

                {/* Spec 2 */}
                <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-beige/50">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-brand-orange">
                            <Coffee size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-dark/50 uppercase tracking-wide">Avg. Price</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark pl-1">৳{cafe.cafeSpecs.avgCoffeePrice} <span className="text-lg font-medium text-brand-dark/40">/ cup</span></p>
                </div>

                 {/* Spec 3 */}
                 <div className="p-6 bg-brand-light/30 rounded-2xl border border-brand-beige/50">
                     <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-brand-orange">
                            <Thermometer size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-dark/50 uppercase tracking-wide">Comfort</span>
                    </div>
                    <p className="text-2xl font-bold text-brand-dark pl-1">{cafe.cafeSpecs.acAvailability} <span className="text-lg font-medium text-brand-dark/40">AC</span></p>
                </div>

            </div>

            {/* Location Section */}
            <div className="mt-10 pt-10 border-t border-brand-beige">
                <h2 className="text-xl font-bold text-brand-dark mb-6">Location & Directions</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-80">
                    {/* The Map Component */}
                    <div className="h-64 md:h-full">
                        <MapWrapper 
                            lat={cafe.cafeSpecs.coordinates.lat} 
                            long={cafe.cafeSpecs.coordinates.long} 
                            title={cafe.title}
                        />
                    </div>

                    {/* Directions Logic */}
                    <div className="flex flex-col justify-center bg-brand-light/30 p-8 rounded-2xl border border-brand-beige/50">
                        <p className="text-brand-dark/70 mb-6">
                            Located in the heart of Dhaka. Click below to open Google Maps for real-time navigation.
                        </p>
                        <a 
                            href={cafe.cafeSpecs.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${cafe.cafeSpecs.coordinates.lat},${cafe.cafeSpecs.coordinates.long}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-brand-dark text-white text-center px-8 py-4 rounded-xl font-bold hover:bg-brand-orange transition-colors duration-300 flex items-center justify-center gap-2"
                        >
                            <MapPin size={20} />
                            Open in Google Maps
                        </a>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}