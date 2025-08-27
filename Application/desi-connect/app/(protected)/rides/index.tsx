import { useAuth } from "@/context/AuthContext";
import { useRides } from "@/context/RidesContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";
import ReliableAddressInput from "../../../components/ReliableAddressInput";
import { AddressSuggestion } from "../../../components/utils/placesService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Modern Search Input Component (for non-address inputs)
const ModernSearchInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  delay = 0 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.searchInputContainer}
    >
      <View style={[styles.searchInputWrapper, isFocused && styles.searchInputFocused]}>
        <Ionicons name={icon} size={20} color={isFocused ? "#8B5CF6" : "#6B7280"} />
        <TextInput
          placeholder={placeholder}
          style={styles.searchInput}
          value={value}
          onChangeText={onChangeText}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </Animatable.View>
  );
};

// Popular Route Card Component
const PopularRouteCard = ({ route, onPress, delay = 0 }) => {
  return (
    <Animatable.View
      animation="fadeInRight"
      delay={delay}
    >
      <Pressable style={styles.popularRouteCard} onPress={onPress}>
        <LinearGradient
          colors={['#F3F4F6', '#E5E7EB']}
          style={styles.popularRouteGradient}
        >
          <View style={styles.popularRouteContent}>
            <View style={styles.routeLocations}>
              <Text style={styles.routeFromText}>{route.from}</Text>
              <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
              <Text style={styles.routeToText}>{route.to}</Text>
            </View>
            <View style={styles.routeStats}>
              <Text style={styles.routeTimeText}>{route.travelTime} • {route.availableSeats} available</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );
};

// Ride Card Component
const RideCard = ({ ride, onAccept, isDisabled, delay = 0 }) => {
  const formatRideDate = (dateValue) => {
    let jsDate;
    if (dateValue?.toDate) {
      jsDate = dateValue.toDate();
    } else {
      jsDate = new Date(dateValue);
    }

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (jsDate.toDateString() === now.toDateString()) {
      return `Today at ${jsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (jsDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${jsDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return jsDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
  };

  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.rideCard}
    >
      <View style={styles.rideCardHeader}>
        <View style={styles.routeInfo}>
          <View style={styles.routePath}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{ride.from}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePath}>
            <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.locationText}>{ride.to}</Text>
          </View>
        </View>
      </View>

      <View style={styles.rideCardContent}>
        <View style={styles.rideDetails}>
          <View style={styles.rideDetailItem}>
            <Ionicons name="calendar" size={16} color="#6B7280" />
            <Text style={styles.rideDetailText}>{formatRideDate(ride.date)}</Text>
          </View>
          
          <View style={styles.rideDetailItem}>
            <Ionicons name="people" size={16} color="#6B7280" />
            <Text style={styles.rideDetailText}>{ride.seats} seats available</Text>
          </View>
        </View>

        {ride.notes && (
          <View style={styles.notesSection}>
            <Ionicons name="chatbubble-ellipses" size={14} color="#6B7280" />
            <Text style={styles.notesText} numberOfLines={2}>{ride.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.rideCardFooter}>
        <Pressable
          style={[styles.acceptButton, isDisabled && styles.acceptButtonDisabled]}
          disabled={isDisabled}
          onPress={() => onAccept(ride)}
        >
          <LinearGradient
            colors={isDisabled ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#7C3AED']}
            style={styles.acceptButtonGradient}
          >
            <Ionicons
              name={isDisabled ? "checkmark-circle" : "car-sport"}
              size={18}
              color="#fff"
            />
            <Text style={styles.acceptButtonText}>
              {isDisabled ? "Already Booked" : "Join Ride"}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </Animatable.View>
  );
};

export default function FindRideScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredRides, setFilteredRides] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [isShowingPopularRoutes, setIsShowingPopularRoutes] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropFocused, setDropFocused] = useState(false);
  


  const {
    state: { rides, loading },
  } = useRides();

  // Fetch popular routes from Firebase Firestore - show actual DB routes
  const fetchPopularRoutesFromFirestore = async (ridesData) => {
    try {
      console.log('🔥 Fetching routes from Firebase Firestore...');
      console.log(`📊 Total rides in Firestore: ${ridesData.length}`);
      
      if (!ridesData || ridesData.length === 0) {
        console.log('❌ No rides found in Firestore');
        return [];
      }

      const routeFrequency = {};
      
      // Process each ride from Firestore
      ridesData.forEach((ride, index) => {
        console.log(`📍 Processing ride ${index + 1}: ${ride.from} → ${ride.to}`);
        
        const routeKey = `${ride.from.toLowerCase()}-${ride.to.toLowerCase()}`;
        if (routeFrequency[routeKey]) {
          routeFrequency[routeKey].count++;
          routeFrequency[routeKey].availableSeats += parseInt(ride.seats) || 1;
          routeFrequency[routeKey].rides.push(ride);
        } else {
          // Use actual travel time from database or estimate
          const travelTime = estimateTravelTime(ride.from, ride.to);
          
          routeFrequency[routeKey] = {
            from: ride.from,
            to: ride.to,
            count: 1,
            availableSeats: parseInt(ride.seats) || 1,
            travelTime: travelTime,
            rides: [ride],
            lastPosted: ride.date
          };
        }
      });

      // Get all unique routes from database
      const allRoutes = Object.values(routeFrequency);
      
      // Check if we have truly popular routes (appearing 2+ times)
      const popularRoutes = allRoutes.filter(route => route.count >= 2);
      
      let routesToShow;
      if (popularRoutes.length > 0) {
        // Show popular routes (appearing multiple times)
        routesToShow = popularRoutes
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        console.log('🏆 Found popular routes (appearing multiple times):');
      } else {
        // No popular routes, just show any routes currently in DB
        routesToShow = allRoutes
          .sort((a, b) => new Date(b.lastPosted) - new Date(a.lastPosted)) // Sort by most recent
          .slice(0, 5);
        console.log('📍 No popular routes found, showing current routes from DB:');
      }

      routesToShow.forEach((route, index) => {
        console.log(`${index + 1}. ${route.from} → ${route.to} (${route.travelTime} • ${route.availableSeats} available) [${route.count} rides]`);
      });

      return routesToShow;
    } catch (error) {
      console.error('❌ Error fetching routes from Firebase:', error);
      return [];
    }
  };

  // Estimate travel time based on common routes (you can customize this)
  const estimateTravelTime = (from, to) => {
    const routeTimes = {
      // Common US routes
      'new york-boston': '4h',
      'nyc-boston': '4h',
      'boston-new york': '4h',
      'boston-nyc': '4h',
      'los angeles-san diego': '3h',
      'la-san diego': '3h',
      'san diego-los angeles': '3h',
      'san diego-la': '3h',
      'chicago-detroit': '5h',
      'detroit-chicago': '5h',
      'miami-orlando': '3.5h',
      'orlando-miami': '3.5h',
      'seattle-portland': '3h',
      'portland-seattle': '3h',
      'dallas-houston': '4h',
      'houston-dallas': '4h',
      'san francisco-los angeles': '6h',
      'sf-la': '6h',
      'los angeles-san francisco': '6h',
      'la-sf': '6h',
      'philadelphia-new york': '2h',
      'philly-nyc': '2h',
      'new york-philadelphia': '2h',
      'nyc-philly': '2h',
      'atlanta-charleston': '4.5h',
      'charleston-atlanta': '4.5h',
      // Add more routes as needed based on your user base
    };

    const routeKey = `${from.toLowerCase()}-${to.toLowerCase()}`;
    return routeTimes[routeKey] || '4h'; // Default to 4h if route not found
  };

  useEffect(() => {
    const loadDataFromFirestore = async () => {
      if (rides && rides.length > 0) {
        console.log('🔄 Loading rides data from Firebase Firestore...');
        setFilteredRides(rides);
        
        // Check if we have popular routes or just current routes
        const routeFrequency = {};
        rides.forEach(ride => {
          const routeKey = `${ride.from.toLowerCase()}-${ride.to.toLowerCase()}`;
          routeFrequency[routeKey] = (routeFrequency[routeKey] || 0) + 1;
        });
        
        const hasPopularRoutes = Object.values(routeFrequency).some(count => count >= 2);
        setIsShowingPopularRoutes(hasPopularRoutes);
        
        // Fetch routes from Firestore data
        const routesFromFirebase = await fetchPopularRoutesFromFirestore(rides);
        setPopularRoutes(routesFromFirebase);
        
        console.log('✅ Successfully loaded data from Firebase Firestore');
      } else {
        console.log('⏳ Waiting for Firestore data...');
      }
    };

    loadDataFromFirestore();
  }, [rides]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSearch = () => {
    if (!pickup && !drop) {
      setFilteredRides(rides);
      setSearchMode(false);
      return;
    }

    const results = rides.filter((ride) => {
      const matchesPickup = !pickup || ride.from?.toLowerCase().includes(pickup.toLowerCase());
      const matchesDropoff = !drop || ride.to?.toLowerCase().includes(drop.toLowerCase());
      return matchesPickup && matchesDropoff;
    });
    
    setFilteredRides(results);
    setSearchMode(true);
  };

  const handlePopularRoutePress = (route) => {
    setPickup(route.from);
    setDrop(route.to);
    handleSearch();
  };

  const handleAcceptRide = (ride) => {
    router.push({
      pathname: "/acceptride",
      params: {
        rideId: ride.id,
        from: ride.from,
        to: ride.to,
        date: ride.date,
        seats: ride.seats,
        notes: ride.notes || "",
      },
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    console.log('🔄 Refreshing data from Firebase Firestore...');
    
    try {
      // Re-fetch routes from Firebase
      if (rides && rides.length > 0) {
        // Check if we have popular routes or just current routes
        const routeFrequency = {};
        rides.forEach(ride => {
          const routeKey = `${ride.from.toLowerCase()}-${ride.to.toLowerCase()}`;
          routeFrequency[routeKey] = (routeFrequency[routeKey] || 0) + 1;
        });
        
        const hasPopularRoutes = Object.values(routeFrequency).some(count => count >= 2);
        setIsShowingPopularRoutes(hasPopularRoutes);
        
        const refreshedRoutes = await fetchPopularRoutesFromFirestore(rides);
        setPopularRoutes(refreshedRoutes);
        console.log('✅ Successfully refreshed routes from Firestore');
      }
    } catch (error) {
      console.error('❌ Error refreshing data from Firebase:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePickupAddressSelect = (address: AddressSuggestion) => {
    console.log('Selected pickup address:', address);
    // You can store additional address details here if needed
  };

  const handleDropAddressSelect = (address: AddressSuggestion) => {
    console.log('Selected drop address:', address);
    // You can store additional address details here if needed
  };

  // Location picker navigation
  const handleOpenLocationPicker = () => {
    if (pickup && drop) {
      router.push({
        pathname: '/location-picker',
        params: {
          pickupAddress: pickup,
          destinationAddress: drop
        }
      });
    }
  };

  const handleClearSearch = () => {
    setPickup("");
    setDrop("");
    setFilteredRides(rides);
    setSearchMode(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={styles.loadingContent}
          >
            <Ionicons name="car-sport" size={48} color="#8B5CF6" />
            <Text style={styles.loadingText}>Finding amazing rides...</Text>
          </Animatable.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find Rides</Text>
          <Text style={styles.headerSubtitle}>Discover your next journey</Text>
        </View>
      </View>

      <FlatList
        data={searchMode ? filteredRides : filteredRides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        ListHeaderComponent={
          <View>
            {/* Search Section */}
            <View style={styles.searchSection}>
              <Animatable.Text
                animation="fadeInDown"
                style={styles.searchTitle}
              >
                Where are you going? ✈️
              </Animatable.Text>

              <ReliableAddressInput
                icon="radio-button-on"
                placeholder="From (Pickup location)"
                value={pickup}
                onChangeText={setPickup}
                onAddressSelect={handlePickupAddressSelect}
                isFocused={pickupFocused}
                onFocus={() => setPickupFocused(true)}
                onBlur={() => setPickupFocused(false)}
                delay={100}
              />

              <ReliableAddressInput
                icon="location"
                placeholder="To (Destination)"
                value={drop}
                onChangeText={setDrop}
                onAddressSelect={handleDropAddressSelect}
                isFocused={dropFocused}
                onFocus={() => setDropFocused(true)}
                onBlur={() => setDropFocused(false)}
                delay={200}
              />

              {/* Location Picker Button - DISABLED */}
              {/* <Animatable.View
                animation="fadeInUp"
                delay={250}
                style={styles.searchInputContainer}
              >
                <Pressable
                  style={[
                    styles.locationPickerButton,
                    (!pickup || !drop) && styles.locationPickerButtonDisabled
                  ]}
                  onPress={handleOpenLocationPicker}
                  disabled={!pickup || !drop}
                >
                  <LinearGradient
                    colors={(!pickup || !drop) ? ['#E5E7EB', '#D1D5DB'] : ['#3B82F6', '#2563EB']}
                    style={styles.locationPickerGradient}
                  >
                    <Ionicons 
                      name="map" 
                      size={20} 
                      color={(!pickup || !drop) ? "#9CA3AF" : "#FFFFFF"} 
                    />
                    <Text style={[
                      styles.locationPickerText,
                      (!pickup || !drop) && styles.locationPickerTextDisabled
                    ]}>
                      {(!pickup || !drop) ? 'Fill both locations first' : 'View Route on Map'}
                    </Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={16} 
                      color={(!pickup || !drop) ? "#9CA3AF" : "#FFFFFF"} 
                    />
                  </LinearGradient>
                </Pressable>
              </Animatable.View> */}

              <Animatable.View
                animation="fadeInUp"
                delay={300}
              >
                <Pressable
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#8B5CF6" />
                  <View style={styles.dateContent}>
                    <Text style={styles.dateLabel}>Travel Date</Text>
                    <Text style={styles.dateText}>
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </Pressable>
              </Animatable.View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={onChangeDate}
                />
              )}

              <View style={styles.searchActions}>
                <Animatable.View
                  animation="fadeInUp"
                  delay={400}
                  style={{ flex: 1 }}
                >
                  <Pressable style={styles.searchButton} onPress={handleSearch}>
                    <LinearGradient
                      colors={['#8B5CF6', '#7C3AED']}
                      style={styles.searchButtonGradient}
                    >
                      <Ionicons name="search" size={20} color="#fff" />
                      <Text style={styles.searchButtonText}>Search Rides</Text>
                    </LinearGradient>
                  </Pressable>
                </Animatable.View>

                {searchMode && (
                  <Animatable.View
                    animation="fadeInUp"
                    delay={450}
                  >
                    <Pressable style={styles.clearButton} onPress={handleClearSearch}>
                      <Ionicons name="close" size={20} color="#6B7280" />
                    </Pressable>
                  </Animatable.View>
                )}
              </View>
            </View>

            {/* Popular/Current Routes Section */}
            {!searchMode && popularRoutes.length > 0 && (
              <View style={styles.popularSection}>
                <Animatable.Text
                  animation="fadeInLeft"
                  style={styles.popularTitle}
                >
                  {isShowingPopularRoutes ? '🔥 Popular Routes' : '🚗 Current Routes'}
                </Animatable.Text>
                
                <View style={styles.popularRoutes}>
                  {popularRoutes.map((route, index) => (
                    <PopularRouteCard
                      key={`${route.from}-${route.to}`}
                      route={route}
                      onPress={() => handlePopularRoutePress(route)}
                      delay={500 + index * 100}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                {searchMode ? `🔍 Search Results (${filteredRides.length})` : `🚗 Available Rides (${filteredRides.length})`}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Animatable.View
            animation="fadeIn"
            style={styles.emptyState}
          >
            <Ionicons name="car-sport-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptySubtitle}>
              {searchMode 
                ? "Try adjusting your search criteria"
                : "Be the first to post a ride!"
              }
            </Text>
            <Pressable 
              style={styles.emptyButton}
              onPress={() => router.push("/postrides")}
            >
              <Text style={styles.emptyButtonText}>Post a Ride</Text>
            </Pressable>
          </Animatable.View>
        }
        renderItem={({ item, index }) => (
          <RideCard
            ride={item}
            onAccept={handleAcceptRide}
            isDisabled={user?.uid === item.rideCreatedBy || item.isRidedAccepted}
            delay={searchMode ? 0 : 600 + index * 100}
          />
        )}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Scroll Content
  scrollContent: {
    paddingBottom: 20,
  },

  // Search Section
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    zIndex: 1,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInputContainer: {
    marginBottom: 12,
    zIndex: 999,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  searchInputFocused: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },

  // Date Button
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
    marginBottom: 20,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },

  // Search Actions
  searchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 10,
  },
  searchButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Popular Routes
  popularSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 8,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  popularRoutes: {
    gap: 8,
  },
  popularRouteCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  popularRouteGradient: {
    padding: 18,
  },
  popularRouteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeLocations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  routeFromText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  routeToText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeTimeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Ride Card
  rideCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  rideCardHeader: {
    padding: 20,
    paddingBottom: 16,
  },
  routeInfo: {
    gap: 12,
  },
  routePath: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
  },
  rideCardContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  rideDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  rideDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rideDetailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  notesSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  rideCardFooter: {
    padding: 20,
    paddingTop: 0,
  },
  acceptButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Location Picker Button
  locationPickerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  locationPickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  locationPickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  locationPickerButtonDisabled: {
    opacity: 0.6,
  },
  locationPickerTextDisabled: {
    color: '#9CA3AF',
  },
});