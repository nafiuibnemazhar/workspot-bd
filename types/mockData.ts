import { Cafe } from './index';

export const mockCafes: Cafe[] = [
  {
    id: '1',
    title: 'North End Coffee Roasters - Gulshan',
    slug: 'north-end-gulshan',
    cafeSpecs: {
      hasGenerator: true,
      wifiSpeed: 50,
      avgCoffeePrice: 350,
      acAvailability: 'Full',
      coordinates: {
        lat: 23.7925,
        long: 90.4078,
      },
    },
  },
  {
    id: '2',
    title: 'Tabaq Coffee - Jamuna Future Park',
    slug: 'tabaq-jfp',
    cafeSpecs: {
      hasGenerator: true,
      wifiSpeed: 30,
      avgCoffeePrice: 400,
      acAvailability: 'Full',
      coordinates: {
        lat: 23.8134,
        long: 90.4242,
      },
    },
  },
  {
    id: '3',
    title: 'Crimson Cup - Dhanmondi',
    slug: 'crimson-cup-dhanmondi',
    cafeSpecs: {
      hasGenerator: false, // Simulating a power issue for filtering practice
      wifiSpeed: 20,
      avgCoffeePrice: 300,
      acAvailability: 'Partial',
      coordinates: {
        lat: 23.7461,
        long: 90.3742,
      },
    },
  },
];