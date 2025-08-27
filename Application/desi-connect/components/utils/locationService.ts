import * as Location from 'expo-location';
import { AddressSuggestion } from './placesService';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface NearbyPlace {
  name: string;
  address: string;
  distance: number;
  type: string;
}

class LocationService {
  private hasPermission: boolean = false;

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    if (!this.hasPermission) {
      const granted = await this.requestLocationPermission();
      if (!granted) {
        return null;
      }
    }

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  // Get nearby places based on current location
  async getNearbyPlaces(): Promise<AddressSuggestion[]> {
    const location = await this.getCurrentLocation();
    
    if (!location) {
      console.log('📍 No location available, returning empty array');
      return [];
    }

    try {
      // Use reverse geocoding to get current address
      const currentAddress = await this.reverseGeocode(location.latitude, location.longitude);
      console.log('📍 Current address:', currentAddress);
      
      // Generate nearby place suggestions
      const nearbyPlaces = this.generateNearbyPlaces(location);
      
      const results = [
        // Current location as first option
        {
          id: 'current-location',
          title: 'Current Location',
          subtitle: currentAddress || 'Your current GPS location',
          fullAddress: currentAddress || 'Current Location',
          placeId: 'current-location',
        },
        // Nearby places
        ...nearbyPlaces,
      ];
      
      console.log('📍 Total nearby places:', results.length);
      return results;
    } catch (error) {
      console.error('❌ Error getting nearby places:', error);
      return [];
    }
  }

  // Reverse geocoding to get address from coordinates
  async reverseGeocode(latitude: number, longitude: number): Promise<string | null> {
    try {
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        
        return addressParts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  }

  // Generate nearby place suggestions based on location
  private generateNearbyPlaces(location: LocationData): AddressSuggestion[] {
    // This is a simplified version - in a real app, you'd use Google Places API
    // to get actual nearby places. For now, we'll generate some common nearby places.
    
    const nearbyPlaces: AddressSuggestion[] = [
      {
        id: 'nearby-gas-station',
        title: 'Gas Station',
        subtitle: 'Nearby fuel station',
        fullAddress: 'Gas Station, Near Current Location',
        placeId: 'nearby-gas-station',
      },
      {
        id: 'nearby-restaurant',
        title: 'Restaurant',
        subtitle: 'Nearby dining options',
        fullAddress: 'Restaurant, Near Current Location',
        placeId: 'nearby-restaurant',
      },
      {
        id: 'nearby-shopping',
        title: 'Shopping Center',
        subtitle: 'Nearby retail stores',
        fullAddress: 'Shopping Center, Near Current Location',
        placeId: 'nearby-shopping',
      },
      {
        id: 'nearby-hospital',
        title: 'Hospital',
        subtitle: 'Nearby medical facility',
        fullAddress: 'Hospital, Near Current Location',
        placeId: 'nearby-hospital',
      },
    ];

    return nearbyPlaces;
  }

  // Get location-based address suggestions
  async getLocationBasedSuggestions(input: string): Promise<AddressSuggestion[]> {
    console.log('📍 Getting location-based suggestions for:', input);
    
    if (!input || input.length < 2) {
      // If no input, return nearby places
      console.log('📍 No input provided, returning nearby places');
      return await this.getNearbyPlaces();
    }

    const location = await this.getCurrentLocation();
    if (!location) {
      console.log('📍 No location available');
      return [];
    }

    // For now, return nearby places that match the input
    const nearbyPlaces = await this.getNearbyPlaces();
    const lowercaseInput = input.toLowerCase();
    
    const filteredPlaces = nearbyPlaces.filter(place => 
      place.title.toLowerCase().includes(lowercaseInput) ||
      place.subtitle.toLowerCase().includes(lowercaseInput) ||
      place.fullAddress.toLowerCase().includes(lowercaseInput)
    );
    
    console.log('📍 Filtered places:', filteredPlaces.length);
    return filteredPlaces;
  }
}

// Create singleton instance
export const locationService = new LocationService();

// Helper function to get location-based suggestions
export const getLocationBasedSuggestions = async (input: string): Promise<AddressSuggestion[]> => {
  return await locationService.getLocationBasedSuggestions(input);
};
