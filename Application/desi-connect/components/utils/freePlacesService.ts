// Free alternative APIs for address suggestions
// These APIs don't require API keys and are free to use

export interface FreeAddressSuggestion {
  id: string;
  title: string;
  subtitle: string;
  fullAddress: string;
  placeId: string;
}

class FreePlacesService {
  // OpenStreetMap Nominatim API (Free, no API key required)
  async searchNominatim(input: string): Promise<FreeAddressSuggestion[]> {
    if (!input || input.length < 2) return [];

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(input)}` +
        `&format=json` +
        `&limit=5` +
        `&addressdetails=1` +
        `&countrycodes=us` // Restrict to US
      );

      const data = await response.json();

      return data.map((item: any, index: number) => ({
        id: `nominatim-${index}`,
        title: item.name || item.display_name.split(',')[0],
        subtitle: item.display_name.split(',').slice(1, 3).join(',').trim(),
        fullAddress: item.display_name,
        placeId: `nominatim-${item.place_id}`,
      }));
    } catch (error) {
      console.error('Error fetching from Nominatim:', error);
      return [];
    }
  }

  // MapBox Geocoding API (Free tier: 100,000 requests/month)
  async searchMapbox(input: string): Promise<FreeAddressSuggestion[]> {
    if (!input || input.length < 2) return [];

    // Note: You can get a free Mapbox token at https://account.mapbox.com/
    // For now, we'll use the public endpoint (limited)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(input)}.json?` +
        `access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw&` +
        `country=us&` +
        `limit=5`
      );

      const data = await response.json();

      return data.features.map((feature: any, index: number) => ({
        id: `mapbox-${index}`,
        title: feature.text,
        subtitle: feature.place_name.split(',').slice(1, 3).join(',').trim(),
        fullAddress: feature.place_name,
        placeId: feature.id,
      }));
    } catch (error) {
      console.error('Error fetching from Mapbox:', error);
      return [];
    }
  }

  // Here Geocoding API (Free tier: 250,000 requests/month)
  async searchHere(input: string): Promise<FreeAddressSuggestion[]> {
    if (!input || input.length < 2) return [];

    // Note: You can get a free Here API key at https://developer.here.com/
    // For now, we'll use a demo key (limited)
    try {
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?` +
        `q=${encodeURIComponent(input)}&` +
        `apiKey=YOUR_HERE_API_KEY&` +
        `limit=5&` +
        `countryCode=US`
      );

      const data = await response.json();

      return data.items.map((item: any, index: number) => ({
        id: `here-${index}`,
        title: item.title,
        subtitle: item.address.city + ', ' + item.address.state,
        fullAddress: item.address.label,
        placeId: item.id,
      }));
    } catch (error) {
      console.error('Error fetching from Here:', error);
      return [];
    }
  }

  // Combined search using multiple free APIs
  async searchAllFreeAPIs(input: string): Promise<FreeAddressSuggestion[]> {
    if (!input || input.length < 2) return [];

    try {
      // Try Nominatim first (most reliable free option)
      const nominatimResults = await this.searchNominatim(input);
      
      if (nominatimResults.length > 0) {
        return nominatimResults;
      }

      // Fallback to Mapbox if Nominatim fails
      const mapboxResults = await this.searchMapbox(input);
      
      if (mapboxResults.length > 0) {
        return mapboxResults;
      }

      // If both fail, return empty array
      return [];
    } catch (error) {
      console.error('Error searching free APIs:', error);
      return [];
    }
  }

  // Get suggestions with fallback to mock data
  async getAddressSuggestions(input: string): Promise<FreeAddressSuggestion[]> {
    // Try free APIs first
    const freeResults = await this.searchAllFreeAPIs(input);
    
    if (freeResults.length > 0) {
      return freeResults;
    }

    // Fallback to mock data if all APIs fail
    return this.getMockSuggestions(input);
  }

  // Enhanced mock data for fallback
  private getMockSuggestions(input: string): FreeAddressSuggestion[] {
    const mockData: FreeAddressSuggestion[] = [
      {
        id: 'mock-1',
        title: 'New York',
        subtitle: 'NY, United States',
        fullAddress: 'New York, NY, United States',
        placeId: 'mock-ny',
      },
      {
        id: 'mock-2',
        title: 'Boston',
        subtitle: 'MA, United States',
        fullAddress: 'Boston, MA, United States',
        placeId: 'mock-boston',
      },
      {
        id: 'mock-3',
        title: 'Los Angeles',
        subtitle: 'CA, United States',
        fullAddress: 'Los Angeles, CA, United States',
        placeId: 'mock-la',
      },
      {
        id: 'mock-4',
        title: 'Chicago',
        subtitle: 'IL, United States',
        fullAddress: 'Chicago, IL, United States',
        placeId: 'mock-chicago',
      },
      {
        id: 'mock-5',
        title: 'Miami',
        subtitle: 'FL, United States',
        fullAddress: 'Miami, FL, United States',
        placeId: 'mock-miami',
      },
      {
        id: 'mock-6',
        title: 'San Francisco',
        subtitle: 'CA, United States',
        fullAddress: 'San Francisco, CA, United States',
        placeId: 'mock-sf',
      },
      {
        id: 'mock-7',
        title: 'Seattle',
        subtitle: 'WA, United States',
        fullAddress: 'Seattle, WA, United States',
        placeId: 'mock-seattle',
      },
      {
        id: 'mock-8',
        title: 'Austin',
        subtitle: 'TX, United States',
        fullAddress: 'Austin, TX, United States',
        placeId: 'mock-austin',
      },
    ];

    const lowercaseInput = input.toLowerCase();
    return mockData.filter(suggestion => 
      suggestion.title.toLowerCase().includes(lowercaseInput) ||
      suggestion.subtitle.toLowerCase().includes(lowercaseInput) ||
      suggestion.fullAddress.toLowerCase().includes(lowercaseInput)
    );
  }
}

// Create singleton instance
export const freePlacesService = new FreePlacesService();

// Helper function to get free address suggestions
export const getFreeAddressSuggestions = async (input: string): Promise<FreeAddressSuggestion[]> => {
  return await freePlacesService.getAddressSuggestions(input);
};
