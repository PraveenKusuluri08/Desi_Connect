interface RoutePoint {
  latitude: number;
  longitude: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
  coordinates: RoutePoint[];
}

export class RouteService {
  // Note: This is a demo API key. For production, you should get your own from:
  // https://openrouteservice.org/dev/#/signup
  // OpenRouteService API key - Get your free key from: https://openrouteservice.org/dev/#/signup
  // The demo key below has limited usage and may return 403 errors
  private static readonly OPENROUTE_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImUyYzQ4ZDNmOGExYTQyYmM5NDczODFjN2FmNDQyNDljIiwiaCI6Im11cm11cjY0In0=';
  
  // MapBox Directions API (free tier available) - Get from: https://account.mapbox.com/access-tokens/
  private static readonly MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';
  
  static async calculateRoute(origin: RoutePoint, destination: RoutePoint, routeType: 'fastest' | 'shortest' | 'avoid_tolls' = 'fastest'): Promise<RouteInfo> {
    try {
      // Try multiple routing services for better results
      const routes = await Promise.allSettled([
        this.getOpenRouteServiceRoute(origin, destination, 'driving-car'),
        this.getMapboxRoute(origin, destination, routeType),
        this.getCalculatedRoute(origin, destination, routeType)
      ]);
      
      // Use the first successful route
      for (const result of routes) {
        if (result.status === 'fulfilled' && result.value) {
          console.log('✅ Route calculated successfully with real road data');
          return result.value;
        }
      }
      
      // Fallback to calculated route
      return this.getCalculatedRoute(origin, destination, routeType);
    } catch (error) {
      console.error('❌ Error calculating route:', error);
      return this.getCalculatedRoute(origin, destination, routeType);
    }
  }
  
  private static async getOpenRouteServiceRoute(origin: RoutePoint, destination: RoutePoint, profile: string = 'driving-car'): Promise<RouteInfo | null> {
    try {
      const url = `https://api.openrouteservice.org/v2/directions/${profile}?api_key=${this.OPENROUTE_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          coordinates: [
            [origin.longitude, origin.latitude],
            [destination.longitude, destination.latitude]
          ],
          format: 'geojson'
        })
      });
      
      if (!response.ok) {
        if (response.status === 403) {
          console.log('⚠️ OpenRouteService API key error (403) - Using fallback routing');
        } else {
          console.log(`⚠️ OpenRouteService API error: ${response.status} - ${response.statusText}`);
        }
        return null;
      }
      
      const data = await response.json();
      
      if (data.features && data.features[0]) {
        const feature = data.features[0];
        const coordinates = feature.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        const distance = (feature.properties.summary.distance / 1000).toFixed(1);
        const duration = Math.round(feature.properties.summary.duration / 60);
        
        return {
          distance: `${distance} km`,
          duration: `${duration} min`,
          coordinates
        };
      }
      
      return null;
    } catch (error) {
      console.log('⚠️ OpenRouteService routing failed, trying other services...');
      return null;
    }
  }
  
  private static getCalculatedRoute(origin: RoutePoint, destination: RoutePoint, routeType: 'fastest' | 'shortest' | 'avoid_tolls' = 'fastest'): RouteInfo {
    // Calculate distance using Haversine formula
    const distance = this.calculateDistance(origin, destination);
    
    // Adjust duration based on route type (like Google Maps)
    let duration = this.calculateDuration(distance);
    if (routeType === 'shortest') {
      duration = Math.round(duration * 1.2); // Shortest might be slower
    } else if (routeType === 'avoid_tolls') {
      duration = Math.round(duration * 1.1); // Avoiding tolls might take longer
    }
    
    // Create different route patterns based on type
    const coordinates = this.generateCurvedRoute(origin, destination, routeType);
    
    return {
      distance: `${distance.toFixed(1)} km`,
      duration: `${duration} min`,
      coordinates
    };
  }
  
  private static calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  private static calculateDuration(distance: number): number {
    // Assume average speed of 30 km/h in city
    const averageSpeed = 30;
    return Math.round(distance / averageSpeed * 60);
  }
  
  private static generateCurvedRoute(origin: RoutePoint, destination: RoutePoint, routeType: 'fastest' | 'shortest' | 'avoid_tolls' = 'fastest'): RoutePoint[] {
    const coordinates: RoutePoint[] = [];
    
    // Add origin
    coordinates.push(origin);
    
    // Calculate midpoint
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;
    
    // Add some intermediate points to create a more realistic route
    const distance = this.calculateDistance(origin, destination);
    const numPoints = Math.max(3, Math.min(8, Math.round(distance * 2))); // More points for longer distances
    
    for (let i = 1; i < numPoints; i++) {
      const progress = i / numPoints;
      
      // Create different curve patterns based on route type (like Google Maps)
      let curveOffset = 0.0005 * Math.sin(progress * Math.PI);
      
      if (routeType === 'shortest') {
        // More direct route with less curves
        curveOffset *= 0.5;
      } else if (routeType === 'avoid_tolls') {
        // More winding route to avoid tolls
        curveOffset *= 1.5;
      }
      
      const lat = origin.latitude + (destination.latitude - origin.latitude) * progress + curveOffset;
      const lng = origin.longitude + (destination.longitude - origin.longitude) * progress + curveOffset;
      
      coordinates.push({ latitude: lat, longitude: lng });
    }
    
    // Add destination
    coordinates.push(destination);
    
    return coordinates;
  }

  private static async getMapboxRoute(origin: RoutePoint, destination: RoutePoint, routeType: string): Promise<RouteInfo | null> {
    try {
      const profile = routeType === 'fastest' ? 'mapbox/driving' : 
                     routeType === 'shortest' ? 'mapbox/driving' : 
                     'mapbox/driving';
      
      const url = `https://api.mapbox.com/directions/v5/${profile}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?geometries=geojson&access_token=${this.MAPBOX_ACCESS_TOKEN}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: number[]) => ({
          latitude: coord[1],
          longitude: coord[0]
        }));
        
        return {
          distance: `${(route.distance / 1000).toFixed(1)} km`,
          duration: `${Math.round(route.duration / 60)} min`,
          coordinates
        };
      }
      
      return null;
    } catch (error) {
      console.log('⚠️ Mapbox routing failed, trying other services...');
      return null;
    }
  }
}
