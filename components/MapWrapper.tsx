'use client'; // <--- This marks the boundary

import dynamic from 'next/dynamic';

// We move the dynamic import HERE, inside a Client Component
const CafeMap = dynamic(() => import('./CafeMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-brand-light animate-pulse rounded-2xl flex items-center justify-center text-brand-dark/20">Loading Map...</div>
});

interface MapWrapperProps {
  lat: number;
  long: number;
  title: string;
}

export default function MapWrapper({ lat, long, title }: MapWrapperProps) {
  return <CafeMap lat={lat} long={long} title={title} />;
}