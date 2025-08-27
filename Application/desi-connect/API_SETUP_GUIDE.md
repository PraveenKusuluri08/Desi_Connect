# 🗺️ API Setup Guide - Fix 403 Errors

## The Problem
You're seeing a **403 Forbidden** error because the demo API keys have limited usage or are invalid.

## 🔧 How to Fix This

### Option 1: Get Free OpenRouteService API Key (Recommended)

1. **Go to**: https://openrouteservice.org/dev/#/signup
2. **Sign up** for a free account
3. **Get your API key** from the dashboard
4. **Replace** the key in `components/utils/routeService.ts`:

```typescript
// Replace this line:
private static readonly OPENROUTE_API_KEY = '5b3ce3597851110001cf6248e4c8c1c8c0c94c0c8c0c94c0c8c0c94c0c8c0c8c';

// With your actual key:
private static readonly OPENROUTE_API_KEY = 'your_actual_api_key_here';
```

### Option 2: Get Free Mapbox API Key

1. **Go to**: https://account.mapbox.com/access-tokens/
2. **Sign up** for a free account
3. **Get your access token**
4. **Replace** the token in `components/utils/routeService.ts`:

```typescript
// Replace this line:
private static readonly MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';

// With your actual token:
private static readonly MAPBOX_ACCESS_TOKEN = 'your_actual_mapbox_token_here';
```

### Option 3: Use Fallback Routing (No API Key Needed)

The app will automatically use **fallback routing** if API calls fail. This creates curved routes that look realistic but aren't based on real roads.

## 🚀 What You Get After Setup

✅ **Real road routing** with actual street paths  
✅ **Multiple route options** (fastest, shortest, avoid tolls)  
✅ **Live traffic consideration**  
✅ **Turn-by-turn navigation**  
✅ **Real-time location tracking**  
✅ **Route recalculation** when you deviate  

## 🔄 Current Status

The app is working with **fallback routing** right now, which means:
- ✅ Routes are displayed (curved lines)
- ✅ Distance and time are calculated
- ✅ Navigation features work
- ⚠️ Routes don't follow actual roads (straight lines with curves)

## 📱 Test the App Now

1. **Fill in pickup and destination** addresses
2. **Tap "View Route on Map"**
3. **See the route** (currently using fallback)
4. **Tap "Start Navigation"** to test real-time tracking

The app will work perfectly once you add a real API key! 🎉
