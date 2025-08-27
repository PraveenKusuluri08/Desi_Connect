// Google Places API Configuration
// Get your API key from: https://console.cloud.google.com/apis/credentials

export const PLACES_CONFIG = {
  // Replace with your actual Google Places API key
  API_KEY: 'YOUR_GOOGLE_PLACES_API_KEY',
  
  // API endpoints
  BASE_URL: 'https://maps.googleapis.com/maps/api/place',
  GEOCODING_URL: 'https://maps.googleapis.com/maps/api/geocode',
  
  // Default settings
  DEFAULT_COUNTRY: 'us', // Restrict to US by default
  DEFAULT_TYPES: 'geocode', // Address types
  MAX_SUGGESTIONS: 5,
  DEBOUNCE_DELAY: 300, // milliseconds
  
  // Session token settings
  SESSION_TOKEN_LIFETIME: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Environment-specific configurations
export const getPlacesConfig = () => {
  // You can add environment-specific logic here
  // For example, different API keys for development/production
  
  if (__DEV__) {
    // Development settings
    return {
      ...PLACES_CONFIG,
      // You can override settings for development here
    };
  }
  
  // Production settings
  return PLACES_CONFIG;
};

// Helper function to check if API key is configured
export const isPlacesApiConfigured = (): boolean => {
  const config = getPlacesConfig();
  return config.API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY' && config.API_KEY.length > 0;
};

// Helper function to get API key
export const getPlacesApiKey = (): string => {
  const config = getPlacesConfig();
  return config.API_KEY;
};
