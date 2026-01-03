"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the actual map component here
// This isolates the 'ssr: false' logic to the client side
const FullScreenMap = dynamic(() => import("@/components/FullScreenMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-brand-muted animate-pulse bg-gray-50">
      <Loader2 className="animate-spin mb-4 text-brand-primary" size={48} />
      <span className="font-bold text-lg">Locating Workspaces...</span>
    </div>
  ),
});

export default function MapWrapper({ cafes }: { cafes: any[] }) {
  return <FullScreenMap cafes={cafes} />;
}
