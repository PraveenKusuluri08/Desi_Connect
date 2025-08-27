import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function LocationPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // State management
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pickup');
  const [isConvertingAddresses, setIsConvertingAddresses] = useState(false);
  const [addressesConverted, setAddressesConverted] = useState(false);
  
  // Navigation states
  const [isNavigationMode, setIsNavigationMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [remainingDistance, setRemainingDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isRecalculatingRoute, setIsRecalculatingRoute] = useState(false);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  
  // Refs
  const mapRef = useRef(null);
  const routeCalculatedRef = useRef(false);
  const navigationIntervalRef = useRef(null);

  // Convert addresses to coordinates when component mounts
  useEffect(() => {
    if (params.pickupAddress && params.destinationAddress && !addressesConverted) {
      convertAddressesToCoordinates();
    }
  }, [params, addressesConverted]);

  // Calculate route when both locations are set
  useEffect(() => {
    if (pickupLocation && destinationLocation && !routeCalculatedRef.current) {
      calculateRoute();
    }
  }, [pickupLocation, destinationLocation]);

  // Navigation mode effects
  useEffect(() => {
    if (isNavigationMode) {
      startLocationTracking();
      startNavigationUpdates();
    } else {
      stopLocationTracking();
      stopNavigationUpdates();
    }

    return () => {
      stopLocationTracking();
      stopNavigationUpdates();
    };
  }, [isNavigationMode]);

  const convertAddressesToCoordinates = async () => {
    try {
      setIsConvertingAddresses(true);
      
      // Convert pickup address
      const pickupCoords = await Location.geocodeAsync(params.pickupAddress);
      if (pickupCoords.length > 0) {
        setPickupLocation({
          latitude: pickupCoords[0].latitude,
          longitude: pickupCoords[0].longitude,
          title: params.pickupAddress
        });
      }

      // Convert destination address
      const destCoords = await Location.geocodeAsync(params.destinationAddress);
      if (destCoords.length > 0) {
        setDestinationLocation({
          latitude: destCoords[0].latitude,
          longitude: destCoords[0].longitude,
          title: params.destinationAddress
        });
      }

      setAddressesConverted(true);
    } catch (error) {
      console.error('Error converting addresses:', error);
      Alert.alert('Error', 'Could not find the locations. Please check the addresses.');
    } finally {
      setIsConvertingAddresses(false);
    }
  };

  const calculateRoute = async () => {
    if (!pickupLocation || !destinationLocation || routeCalculatedRef.current) return;
    
    try {
      setIsCalculatingRoute(true);
      routeCalculatedRef.current = true;

      // Create Google Maps-style route
      const routeResult = createGoogleMapsRoute(pickupLocation, destinationLocation);
      
      setRouteCoordinates(routeResult.coordinates);
      setRouteInfo({
        distance: `${routeResult.distance.toFixed(1)} km`,
        duration: `${Math.round(routeResult.duration)} min`,
        coordinates: routeResult.coordinates,
        trafficInfo: 'Route optimized',
        routeOptions: ['Fastest', 'Shortest', 'Avoid Tolls']
      });

      // Google Maps-style animation
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(routeResult.coordinates, {
          edgePadding: { top: 80, right: 40, bottom: 150, left: 40 },
          animated: true,
        });
      }

      // Trigger panel expansion like Google Maps
      setTimeout(() => {
        setIsPanelExpanded(true);
      }, 1000);
      
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const createGoogleMapsRoute = (pickup, destination) => {
    const distance = calculateDistance(pickup, destination);
    const duration = Math.round(distance / 45); // Google Maps average speed
    
    // Create smooth curved route like Google Maps
    const coordinates = [];
    const steps = Math.max(20, Math.floor(distance * 10));
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const lat = pickup.latitude + (destination.latitude - pickup.latitude) * progress;
      const lng = pickup.longitude + (destination.longitude - pickup.longitude) * progress;
      
      // Add Google Maps-style curve
      const curve = Math.sin(progress * Math.PI) * (distance * 0.0001);
      coordinates.push({
        latitude: lat + curve,
        longitude: lng
      });
    }
    
    return {
      coordinates: coordinates,
      distance: distance,
      duration: duration
    };
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Map editing disabled - feature removed
  const handleMapPress = (event) => {
    // Map editing is disabled - no action taken
    return;
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        title: 'Current Location'
      };

      if (activeTab === 'pickup') {
        setPickupLocation(newLocation);
      } else {
        setDestinationLocation(newLocation);
      }
      
      routeCalculatedRef.current = false;
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 3000,
          distanceInterval: 10,
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const startNavigationUpdates = () => {
    navigationIntervalRef.current = setInterval(() => {
      if (userLocation && destinationLocation) {
        const remaining = calculateDistance(userLocation, destinationLocation);
        setRemainingDistance(`${remaining.toFixed(1)} km`);
        
        const speed = 45; // km/h average
        const timeRemaining = (remaining / speed) * 60;
        setEta(`${Math.round(timeRemaining)} min`);
      }
    }, 5000);
  };

  const stopNavigationUpdates = () => {
    if (navigationIntervalRef.current) {
      clearInterval(navigationIntervalRef.current);
      navigationIntervalRef.current = null;
    }
  };

  const startNavigation = () => {
    setIsNavigationMode(true);
    setCurrentStep({
      instruction: 'Continue straight',
      icon: 'arrow-forward',
      distance: '2.5 km'
    });
  };

  const stopNavigation = () => {
    setIsNavigationMode(false);
    setCurrentStep(null);
    setRemainingDistance(null);
    setEta(null);
  };

  const getMapRegion = () => {
    if (pickupLocation && destinationLocation) {
      const midLat = (pickupLocation.latitude + destinationLocation.latitude) / 2;
      const midLon = (pickupLocation.longitude + destinationLocation.longitude) / 2;
      
      const latDiff = Math.abs(pickupLocation.latitude - destinationLocation.latitude);
      const lonDiff = Math.abs(pickupLocation.longitude - destinationLocation.longitude);
      
      return {
        latitude: midLat,
        longitude: midLon,
        latitudeDelta: Math.max(latDiff * 1.2, 0.01),
        longitudeDelta: Math.max(lonDiff * 1.2, 0.01),
      };
    }
    
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Location Picker</Text>
          <Text style={styles.headerSubtitle}>
            {pickupLocation && destinationLocation ? 'Route Preview' : 'Select Locations'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={getMapRegion()}
          onPress={handleMapPress}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={isNavigationMode}
          mapType="standard"
          showsTraffic={true}
          showsBuildings={true}
          showsIndoors={true}
          showsCompass={true}
          showsScale={true}
          showsPointsOfInterest={true}
          showsIndoorLevelPicker={true}
          showsMapToolbar={false}
          rotateEnabled={false}
          scrollEnabled={true}
          zoomEnabled={true}
          pitchEnabled={false}
          toolbarEnabled={false}
          loadingEnabled={true}
          loadingIndicatorColor="#3B82F6"
          loadingBackgroundColor="rgba(0,0,0,0.8)"
          maxZoomLevel={20}
          minZoomLevel={10}
        >
          {/* Pickup Marker */}
          {pickupLocation && (
            <Marker
              coordinate={pickupLocation}
              title="Pickup Location"
              description={pickupLocation.title}
            >
              <View style={styles.pickupMarker}>
                <Ionicons name="location" size={24} color="#3B82F6" />
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>A</Text>
                </View>
              </View>
            </Marker>
          )}

          {/* Destination Marker */}
          {destinationLocation && (
            <Marker
              coordinate={destinationLocation}
              title="Destination"
              description={destinationLocation.title}
            >
              <View style={styles.destinationMarker}>
                <Ionicons name="flag" size={24} color="#EF4444" />
                <View style={styles.markerLabel}>
                  <Text style={styles.markerLabelText}>B</Text>
                </View>
              </View>
            </Marker>
          )}

          {/* Route Line */}
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={6}
              strokeColor="#3B82F6"
              lineDashPattern={[0]}
              geodesic={true}
            />
          )}

          {/* User Location Marker (Navigation Mode) */}
          {isNavigationMode && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
            >
              <View style={styles.userLocationMarker}>
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Loading Overlays */}
        {(isLoading || isConvertingAddresses) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              {isConvertingAddresses ? 'Finding locations...' : 'Loading...'}
            </Text>
          </View>
        )}

        {isCalculatingRoute && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Calculating route...</Text>
          </View>
        )}

        {/* Navigation Overlay */}
        {isNavigationMode && (
          <View style={styles.navigationOverlay}>
            <View style={styles.navigationHeader}>
              <View style={styles.navigationInfo}>
                <Text style={styles.navigationTitle}>Navigation Active</Text>
                <Text style={styles.navigationSubtitle}>
                  {remainingDistance && eta ? `${remainingDistance} • ${eta}` : 'Calculating...'}
                </Text>
              </View>
              <Pressable style={styles.stopNavigationButton} onPress={stopNavigation}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            {currentStep && (
              <View style={styles.navigationStep}>
                <Ionicons name={currentStep.icon} size={24} color="#3B82F6" />
                <View style={styles.stepInfo}>
                  <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>
                  <Text style={styles.stepDistance}>{currentStep.distance}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Floating Buttons */}
        <View style={styles.floatingButtons}>
          <Pressable style={styles.floatingButton}>
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.floatingButton}>
            <Ionicons name="compass" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Bottom Panel */}
      <Animatable.View 
        animation={pickupLocation && destinationLocation ? "slideInUp" : "slideInUp"}
        duration={500}
        style={[
          styles.bottomPanel,
          pickupLocation && destinationLocation && routeInfo && styles.bottomPanelExpanded,
          isPanelExpanded && routeInfo && styles.bottomPanelNavigation
        ]}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)']}
          style={styles.bottomPanelContent}
        >
          {/* Tab Selector */}
          <View style={styles.tabSelector}>
            <Pressable
              style={[styles.tab, activeTab === 'pickup' && styles.activeTab]}
              onPress={() => setActiveTab('pickup')}
            >
              <Ionicons 
                name="location" 
                size={16} 
                color={activeTab === 'pickup' ? '#3B82F6' : '#666666'} 
              />
              <Text style={[styles.tabText, activeTab === 'pickup' && styles.activeTabText]}>
                Pickup
              </Text>
            </Pressable>
            
            <Pressable
              style={[styles.tab, activeTab === 'destination' && styles.activeTab]}
              onPress={() => setActiveTab('destination')}
            >
              <Ionicons 
                name="flag" 
                size={16} 
                color={activeTab === 'destination' ? '#3B82F6' : '#666666'} 
              />
              <Text style={[styles.tabText, activeTab === 'destination' && styles.activeTabText]}>
                Destination
              </Text>
            </Pressable>
          </View>

          {/* Location Info */}
          <View style={styles.locationInfo}>
            {activeTab === 'pickup' ? (
              <View>
                <Text style={styles.locationLabel}>Pickup Location</Text>
                <Text style={styles.locationText}>
                  {pickupLocation ? pickupLocation.title : 'Not set'}
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationText}>
                  {destinationLocation ? destinationLocation.title : 'Not set'}
                </Text>
              </View>
            )}
          </View>

          {/* Route Info */}
          {routeInfo && (
            <View style={styles.routeInfo}>
              <View style={styles.routeStat}>
                <Ionicons name="time" size={16} color="#666666" />
                <Text style={styles.routeStatText}>{routeInfo.duration}</Text>
              </View>
              <View style={styles.routeStat}>
                <Ionicons name="map" size={16} color="#666666" />
                <Text style={styles.routeStatText}>{routeInfo.distance}</Text>
              </View>
              {routeInfo.trafficInfo && (
                <View style={styles.routeStat}>
                  <Ionicons name="car" size={16} color="#666666" />
                  <Text style={styles.routeStatText}>{routeInfo.trafficInfo}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleUseCurrentLocation}
            >
              <Ionicons name="navigate" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Use Current Location</Text>
            </Pressable>
          </View>

          {/* Navigation Button */}
          {routeInfo && !isNavigationMode && (
            <Pressable
              style={styles.startNavigationButton}
              onPress={startNavigation}
            >
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.startNavigationGradient}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.startNavigationText}>Start Navigation</Text>
              </LinearGradient>
            </Pressable>
          )}
        </LinearGradient>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  pickupMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#3B82F6',
    position: 'relative',
  },
  destinationMarker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#EF4444',
    position: 'relative',
  },
  markerLabel: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userLocationMarker: {
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  floatingButtons: {
    position: 'absolute',
    right: 20,
    bottom: 200,
    gap: 10,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 20,
    paddingTop: 40,
  },
  navigationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  navigationInfo: {
    flex: 1,
  },
  navigationTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigationSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  stopNavigationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigationStep: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
  },
  stepInfo: {
    marginLeft: 15,
    flex: 1,
  },
  stepInstruction: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stepDistance: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
  },
  bottomPanelExpanded: {
    maxHeight: '60%',
  },
  bottomPanelNavigation: {
    maxHeight: '70%',
    transform: [{ translateY: -20 }],
  },
  bottomPanelContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#3B82F6',
  },
  locationInfo: {
    marginBottom: 20,
  },
  locationLabel: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 5,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  routeInfo: {
    flexDirection: 'row',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  routeStatText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#333333',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  startNavigationButton: {
    marginTop: 10,
  },
  startNavigationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  startNavigationText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
