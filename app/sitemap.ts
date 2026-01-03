import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

const BASE_URL = "https://workspot-bd.com"; // CHANGE THIS TO YOUR REAL DOMAIN

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Fetch all unique Cities from DB
  // Note: Supabase doesn't have "DISTINCT" in the JS client easily, so we fetch minimal data
  const { data: cafes } = await supabase
    .from("cafes")
    .select("country, state, city, updated_at");

  // 2. Create Unique Location Sets
  const locations = new Set();
  const sitemapEntries: MetadataRoute.Sitemap = [];

  cafes?.forEach((cafe) => {
    // Construct unique key
    const uniqueKey =
      `${cafe.country}-${cafe.state}-${cafe.city}`.toLowerCase();

    if (!locations.has(uniqueKey) && cafe.country && cafe.city) {
      locations.add(uniqueKey);

      // Handle URL Construction
      const countrySlug = cafe.country.toLowerCase().replace(/\s+/g, "-");
      const stateSlug = cafe.state ? cafe.state.toLowerCase() : "all"; // Fallback
      const citySlug = cafe.city.toLowerCase().replace(/\s+/g, "-");

      sitemapEntries.push({
        url: `${BASE_URL}/locations/${countrySlug}/${stateSlug}/${citySlug}`,
        lastModified: new Date(cafe.updated_at || new Date()),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  });

  // 3. Add Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/add-cafe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...sitemapEntries];
}
