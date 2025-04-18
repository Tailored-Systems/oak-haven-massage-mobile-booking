import { config } from 'dotenv';
import { Location } from '../src/lib/utils/location';

// Load environment variables from .env file
config();

const locations = [
  {
    name: 'Alamo Heights',
    address: '4400 Broadway Street Suite 101, San Antonio, TX 78209',
  },
  {
    name: 'Bulverde',
    address: '22103 Bulverde Road Suite 101, San Antonio, TX 78259',
  },
  {
    name: 'Huebner',
    address: '15502 Huebner Road Suite 108, San Antonio, TX 78248',
  },
  {
    name: '620 - Pecan Park',
    address: '12809 North FM 620 Suite 700, Austin, TX 78750',
  }
];

async function geocodeAddress(address: string) {
  const accessToken = process.env.VITE_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('Mapbox access token not found in environment variables');
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&country=US&types=address`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return {
        coordinates: { latitude, longitude },
        formattedAddress: data.features[0].place_name
      };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

async function geocodeLocations() {
  console.log('Geocoding locations...');
  
  const geocodedLocations: Location[] = [];
  
  for (const location of locations) {
    try {
      console.log(`Geocoding ${location.name}...`);
      const result = await geocodeAddress(location.address);
      
      geocodedLocations.push({
        name: location.name,
        address: result.formattedAddress,
        coordinates: result.coordinates
      });
      
      // Add a small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Error geocoding ${location.name}:`, error);
    }
  }
  
  console.log('\nGeocoded locations:');
  console.log(JSON.stringify(geocodedLocations, null, 2));
}

geocodeLocations().catch(console.error); 