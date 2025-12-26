import Link from 'next/link';
import { Cafe } from '@/types';
import { Wifi, Zap, Coffee, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CafeCardProps {
  cafe: Cafe;
}

const CafeCard = ({ cafe }: CafeCardProps) => {
  const { hasGenerator, wifiSpeed, avgCoffeePrice, acAvailability } = cafe.cafeSpecs;
  // Safe access to the image URL
  const imageUrl = cafe.featuredImage?.node?.sourceUrl;

  return (
    <Link href={`/cafe/${cafe.slug}`} className="block group h-full">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-brand-beige/30 h-full">
        
        {/* IMAGE SECTION (NEW) */}
        <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={cafe.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 bg-brand-light">
                    <Coffee size={40} />
                </div>
            )}
            
            {/* Overlay Badge for Generator */}
            {hasGenerator && (
                 <div className="absolute top-3 right-3 bg-brand-dark/90 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                    <Zap size={10} className="fill-brand-orange text-brand-orange" />
                    POWER SAFE
                 </div>
            )}
        </div>

        {/* CONTENT SECTION */}
        <div className="p-5 flex-1 flex flex-col">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-1">
                {cafe.title}
                </h2>
                <p className="text-xs text-brand-dark/50 mt-1 font-medium">Dhaka, Bangladesh</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-light/30 border border-brand-beige/30">
                    <Wifi size={16} className="text-brand-orange" />
                    <span className="text-sm font-bold text-brand-dark">{wifiSpeed} Mbps</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-brand-light/30 border border-brand-beige/30">
                    <Coffee size={16} className="text-brand-orange" />
                    <span className="text-sm font-bold text-brand-dark">৳{avgCoffeePrice}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex items-center justify-between border-t border-brand-beige/30 pt-3">
                <div className="flex items-center gap-1.5 text-brand-dark/60">
                    <Thermometer size={14} />
                    <span className="text-xs font-semibold">{acAvailability} AC</span>
                </div>
                <span className="text-xs font-bold text-brand-orange group-hover:translate-x-1 transition-transform">
                    View &rarr;
                </span>
            </div>
        </div>
      </div>
    </Link>
  );
};

export default CafeCard;