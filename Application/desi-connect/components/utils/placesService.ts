// Google Places API service for address suggestions
// You'll need to get a Google Places API key from Google Cloud Console

import { getPlacesConfig, isPlacesApiConfigured } from '../../config/placesConfig';

const config = getPlacesConfig();
const GOOGLE_PLACES_API_KEY = config.API_KEY;
const GOOGLE_PLACES_BASE_URL = config.BASE_URL;

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
}

export interface AddressSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  placeId: string;
}

class PlacesService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || GOOGLE_PLACES_API_KEY;
  }

  // Get address suggestions based on user input
  async getAddressSuggestions(input: string, sessionToken?: string): Promise<AddressSuggestion[]> {
    if (!input || input.length < 2) {
      return [];
    }

    // Check if API is properly configured
    if (!isPlacesApiConfigured()) {
      console.log('Google Places API not configured, using mock data');
      return getMockAddressSuggestions(input);
    }

    try {
      const response = await fetch(
        `${GOOGLE_PLACES_BASE_URL}/autocomplete/json?` +
        `input=${encodeURIComponent(input)}` +
        `&key=${this.apiKey}` +
        `&types=${config.DEFAULT_TYPES}` +
        `&components=country:${config.DEFAULT_COUNTRY}` +
        (sessionToken ? `&sessiontoken=${sessionToken}` : '')
      );

      const data = await response.json();

      if (data.status === 'OK' && data.predictions) {
        return data.predictions.map((prediction: PlacePrediction) => ({
          id: prediction.place_id,
          title: prediction.structured_formatting.main_text,
          subtitle: prediction.structured_formatting.secondary_text,
          fullAddress: prediction.description,
          placeId: prediction.place_id,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      return [];
    }
  }

  // Get detailed information about a specific place
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const response = await fetch(
        `${GOOGLE_PLACES_BASE_URL}/details/json?` +
        `place_id=${placeId}` +
        `&fields=place_id,formatted_address,geometry,name,types` +
        `&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.result) {
        return data.result;
      }

      return null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  }

  // Reverse geocoding - get address from coordinates
  async getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?` +
        `latlng=${lat},${lng}` +
        `&key=${this.apiKey}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }

      return null;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  // Generate a session token for billing optimization
  generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Create a singleton instance
export const placesService = new PlacesService();

// Comprehensive mock data for development/testing when API key is not available
export const mockAddressSuggestions: AddressSuggestion[] = [
  // Major US Cities
  {
    id: '1',
    title: 'New York',
    subtitle: 'NY, United States',
    fullAddress: 'New York, NY, United States',
    placeId: 'ChIJOwg_06VPwokRYv534QaPC8g',
  },
  {
    id: '2',
    title: 'Boston',
    subtitle: 'MA, United States',
    fullAddress: 'Boston, MA, United States',
    placeId: 'ChIJGzE9DS1l44kRoOhiASS_fHg',
  },
  {
    id: '3',
    title: 'Los Angeles',
    subtitle: 'CA, United States',
    fullAddress: 'Los Angeles, CA, United States',
    placeId: 'ChIJE9on3F3HwoAR9AhGJW_fL-I',
  },
  {
    id: '4',
    title: 'Chicago',
    subtitle: 'IL, United States',
    fullAddress: 'Chicago, IL, United States',
    placeId: 'ChIJ7cv00DwsDogRAMDACa2m4K8',
  },
  {
    id: '5',
    title: 'Miami',
    subtitle: 'FL, United States',
    fullAddress: 'Miami, FL, United States',
    placeId: 'ChIJ9cr6ECcE2YgR4rXXqRrqVrY',
  },
  {
    id: '6',
    title: 'Seattle',
    subtitle: 'WA, United States',
    fullAddress: 'Seattle, WA, United States',
    placeId: 'ChIJVTPokywQkFQRmtVEaUZlJRA',
  },
  {
    id: '7',
    title: 'San Francisco',
    subtitle: 'CA, United States',
    fullAddress: 'San Francisco, CA, United States',
    placeId: 'ChIJIQBpAG2ahYAR_6128GcTUEo',
  },
  {
    id: '8',
    title: 'Philadelphia',
    subtitle: 'PA, United States',
    fullAddress: 'Philadelphia, PA, United States',
    placeId: 'ChIJ60u11Ni3xokRwVg-jNgU9Yk',
  },
  {
    id: '9',
    title: 'Houston',
    subtitle: 'TX, United States',
    fullAddress: 'Houston, TX, United States',
    placeId: 'ChIJAYWNSLS4QIYROgV9F9YkuEo',
  },
  {
    id: '10',
    title: 'Phoenix',
    subtitle: 'AZ, United States',
    fullAddress: 'Phoenix, AZ, United States',
    placeId: 'ChIJ0R8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '11',
    title: 'San Antonio',
    subtitle: 'TX, United States',
    fullAddress: 'San Antonio, TX, United States',
    placeId: 'ChIJrw5TMjlfZ4YR7TqyQ7qLwVY',
  },
  {
    id: '12',
    title: 'San Diego',
    subtitle: 'CA, United States',
    fullAddress: 'San Diego, CA, United States',
    placeId: 'ChIJSx6SrQ9T2YARed8VUN0AhC8',
  },
  {
    id: '13',
    title: 'Dallas',
    subtitle: 'TX, United States',
    fullAddress: 'Dallas, TX, United States',
    placeId: 'ChIJ1-4MIxa6RIYRL9xKC8e9avE',
  },
  {
    id: '14',
    title: 'San Jose',
    subtitle: 'CA, United States',
    fullAddress: 'San Jose, CA, United States',
    placeId: 'ChIJ9T_5iuTKj4ARe3GfygqMnbk',
  },
  {
    id: '15',
    title: 'Austin',
    subtitle: 'TX, United States',
    fullAddress: 'Austin, TX, United States',
    placeId: 'ChIJLwPMoJm1RIYRetTpD6XJ7uI',
  },
  // Airports
  {
    id: '16',
    title: 'JFK Airport',
    subtitle: 'Queens, NY, United States',
    fullAddress: 'John F. Kennedy International Airport, Queens, NY, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '17',
    title: 'LAX Airport',
    subtitle: 'Los Angeles, CA, United States',
    fullAddress: 'Los Angeles International Airport, Los Angeles, CA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '18',
    title: 'O\'Hare Airport',
    subtitle: 'Chicago, IL, United States',
    fullAddress: 'O\'Hare International Airport, Chicago, IL, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  // Universities
  {
    id: '19',
    title: 'MIT',
    subtitle: 'Cambridge, MA, United States',
    fullAddress: 'Massachusetts Institute of Technology, Cambridge, MA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '20',
    title: 'Harvard University',
    subtitle: 'Cambridge, MA, United States',
    fullAddress: 'Harvard University, Cambridge, MA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '21',
    title: 'Stanford University',
    subtitle: 'Stanford, CA, United States',
    fullAddress: 'Stanford University, Stanford, CA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '22',
    title: 'UCLA',
    subtitle: 'Los Angeles, CA, United States',
    fullAddress: 'University of California, Los Angeles, Los Angeles, CA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  // Popular Landmarks
  {
    id: '23',
    title: 'Times Square',
    subtitle: 'New York, NY, United States',
    fullAddress: 'Times Square, New York, NY, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '24',
    title: 'Golden Gate Bridge',
    subtitle: 'San Francisco, CA, United States',
    fullAddress: 'Golden Gate Bridge, San Francisco, CA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
  {
    id: '25',
    title: 'Disneyland',
    subtitle: 'Anaheim, CA, United States',
    fullAddress: 'Disneyland, Anaheim, CA, United States',
    placeId: 'ChIJkR8Ff07J1oYRmX9MHMf0Lms',
  },
];

// Enhanced mock function for development with better search
export const getMockAddressSuggestions = (input: string): AddressSuggestion[] => {
  if (!input || input.length < 2) return [];
  
  const lowercaseInput = input.toLowerCase();
  
  // First, try exact matches
  let exactMatches = mockAddressSuggestions.filter(suggestion => 
    suggestion.title.toLowerCase() === lowercaseInput ||
    suggestion.fullAddress.toLowerCase().includes(lowercaseInput)
  );
  
  // Then, try partial matches
  let partialMatches = mockAddressSuggestions.filter(suggestion => 
    suggestion.title.toLowerCase().includes(lowercaseInput) ||
    suggestion.subtitle.toLowerCase().includes(lowercaseInput) ||
    suggestion.fullAddress.toLowerCase().includes(lowercaseInput)
  );
  
  // Remove duplicates and combine results
  const allMatches = [...exactMatches, ...partialMatches];
  const uniqueMatches = allMatches.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.id === suggestion.id)
  );
  
  // Return up to 8 suggestions
  return uniqueMatches.slice(0, 8);
};
