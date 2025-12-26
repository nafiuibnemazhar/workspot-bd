export type ACAvailability = 'Full' | 'Partial' | 'None';

export interface CafeSpecs {
  hasGenerator: boolean;
  wifiSpeed: number;
  avgCoffeePrice: number;
  acAvailability: ACAvailability;
  coordinates: {
    lat: number;
    long: number;
  };
}

// UPDATE THIS INTERFACE
export interface Cafe {
  id: string;
  title: string;
  slug: string;
  cafeSpecs: CafeSpecs;
  // New field below:
  featuredImage?: {
    node: {
      sourceUrl: string;
    };
  };
}