// We keep this server-side for SEO performance
import { client } from "@/lib/apollo";
import { gql } from "@apollo/client";
import Navbar from "@/components/Navbar"; // Assuming you have this
import ClientHome from "@/components/ClientHome"; // We will create this next
import { Cafe } from "@/types";

// 1. The GraphQL Query
const GET_CAFES = gql`
  query GetCafes {
    cafes {
      nodes {
        id
        title
        slug
        # Add this block 👇
        featuredImage {
          node {
            sourceUrl
          }
        }
        cafeSpecs {
          hasGenerator
          wifiSpeed
          avgCoffeePrice
          acAvailability
          coordinates {
            lat
            long
          }
        }
      }
    }
  }
`;

export default async function Home() {
  // 2. Fetch data from WordPress (Server Side)
  // We use "no-cache" so you see updates instantly during development
  const { data } = await client.query({
    query: GET_CAFES,
    fetchPolicy: "no-cache", 
  });

  const realCafes: Cafe[] = data?.cafes?.nodes || [];

  return (
    <main className="min-h-screen bg-brand-light">
      <Navbar />
      {/* We pass the real data to a Client Component to handle Search/Filtering */}
      <ClientHome initialCafes={realCafes} />
    </main>
  );
}