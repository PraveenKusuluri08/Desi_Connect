# Google Places API Setup Guide

This guide will help you set up Google Places API for address suggestions in your DesiConnect app.

## 🚀 Features Added

- **Address Suggestions**: Real-time address suggestions as you type (like Uber)
- **Google Places Integration**: Powered by Google Places API
- **Fallback System**: Mock data when API is not configured
- **Debounced Search**: Optimized API calls with 300ms debounce
- **Session Tokens**: Billing optimization for Google Places API
- **Modern UI**: Beautiful, animated suggestion dropdowns

## 📋 Prerequisites

1. Google Cloud Console account
2. Billing enabled on your Google Cloud project
3. Places API enabled

## 🔧 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

### Step 2: Enable Places API

1. In Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Places API"
3. Click on "Places API" and click "Enable"

### Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key

### Step 4: Configure API Key

1. Open `config/placesConfig.ts`
2. Replace `YOUR_GOOGLE_PLACES_API_KEY` with your actual API key:

```typescript
export const PLACES_CONFIG = {
  API_KEY: 'AIzaSyYourActualApiKeyHere',
  // ... other config
};
```

### Step 5: Restrict API Key (Recommended)

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "Application restrictions", select "Android apps" and/or "iOS apps"
4. Add your app's bundle identifier
5. Under "API restrictions", select "Restrict key" and choose "Places API"

## 🎯 Usage

The address suggestions are now integrated into:

### Post Rides Screen (`app/(protected)/postrides/index.tsx`)
- "From" field with address suggestions
- "To" field with address suggestions

### Find Rides Screen (`app/(protected)/rides/index.tsx`)
- "From" field with address suggestions  
- "To" field with address suggestions

## 🔍 How It Works

1. **User Types**: As user types in address fields, the system waits 300ms (debounce)
2. **API Call**: Makes request to Google Places Autocomplete API
3. **Suggestions**: Shows up to 5 address suggestions in a dropdown
4. **Selection**: User can tap on any suggestion to auto-fill the field
5. **Fallback**: If API is not configured, shows mock data for testing

## 💰 Billing Information

- **Free Tier**: $200 credit per month
- **Places Autocomplete**: $2.83 per 1000 requests
- **Session Tokens**: Reduce billing by grouping related requests
- **Mock Data**: Available for development without API costs

## 🛠️ Components

### AddressInput Component (`components/AddressInput.tsx`)
- Reusable component with address suggestions
- Animated dropdown with smooth transitions
- Loading states and error handling
- Configurable max suggestions

### Places Service (`components/utils/placesService.ts`)
- Handles all Google Places API calls
- Session token management
- Error handling and fallbacks
- Mock data for development

### Configuration (`config/placesConfig.ts`)
- Centralized API configuration
- Environment-specific settings
- Helper functions for API key management

## 🧪 Testing

### With API Key
1. Configure your API key in `config/placesConfig.ts`
2. Run the app and test address fields
3. Type city names like "New York", "Boston", etc.

### Without API Key (Mock Data)
1. Leave the API key as `YOUR_GOOGLE_PLACES_API_KEY`
2. The app will automatically use mock data
3. Test with cities like "New York", "Boston", "Los Angeles"

## 🔧 Customization

### Change Country Restriction
Edit `config/placesConfig.ts`:
```typescript
DEFAULT_COUNTRY: 'ca', // For Canada
```

### Change Max Suggestions
Edit `config/placesConfig.ts`:
```typescript
MAX_SUGGESTIONS: 10, // Show 10 suggestions instead of 5
```

### Add More Mock Data
Edit `components/utils/placesService.ts`:
```typescript
export const mockAddressSuggestions: AddressSuggestion[] = [
  // Add your custom addresses here
];
```

## 🚨 Troubleshooting

### "No suggestions found"
- Check if API key is correctly configured
- Verify Places API is enabled in Google Cloud Console
- Check billing is enabled
- Review API key restrictions

### "Error fetching address suggestions"
- Check network connectivity
- Verify API key is valid
- Check Google Cloud Console for quota limits

### Suggestions not showing
- Ensure `showSuggestions` prop is true
- Check if input has at least 2 characters
- Verify z-index and positioning in your layout

## 📱 Platform Support

- ✅ iOS
- ✅ Android
- ✅ Web (with limitations)

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables in production
- Restrict API keys to your app's bundle ID
- Monitor API usage in Google Cloud Console

## 📈 Performance Tips

- Session tokens reduce API costs
- Debouncing prevents excessive API calls
- Mock data available for development
- Caching can be added for frequently searched addresses

## 🎨 UI Customization

The AddressInput component uses the same styling as your existing inputs. You can customize:

- Colors in the styles object
- Animation durations
- Dropdown positioning
- Icon styles

## 📞 Support

If you encounter issues:

1. Check Google Cloud Console for API errors
2. Verify API key configuration
3. Test with mock data first
4. Review network requests in browser dev tools

---

**Happy coding! 🚗✨**
