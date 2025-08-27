import { auth } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";
import { useRides } from "@/context/RidesContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Enhanced Popular Route Card Component
const PopularRouteCard = ({ route, onPress, delay = 0, isPopular = false }) => {
  return (
    <Animatable.View
      animation="fadeInRight"
      delay={delay}
      style={styles.popularRouteWrapper}
    >
      <Pressable style={styles.popularRouteCard} onPress={onPress}>
        <LinearGradient
          colors={isPopular ? ['#8B5CF6', '#7C3AED'] : ['#F8FAFC', '#E2E8F0']}
          style={styles.popularRouteGradient}
        >
          {isPopular && (
            <View style={styles.popularBadge}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.popularBadgeText}>HOT</Text>
            </View>
          )}
          
          <View style={styles.popularRouteContent}>
            <View style={styles.routeLocations}>
              <View style={styles.locationPoint}>
                <View style={[styles.locationDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.routeLocationText, { color: isPopular ? '#fff' : '#1F2937' }]}>
                  {route.from}
                </Text>
              </View>
              
              <View style={styles.routeArrow}>
                <Ionicons 
                  name="arrow-forward" 
                  size={16} 
                  color={isPopular ? 'rgba(255,255,255,0.8)' : '#8B5CF6'} 
                />
              </View>
              
              <View style={styles.locationPoint}>
                <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
                <Text style={[styles.routeLocationText, { color: isPopular ? '#fff' : '#1F2937' }]}>
                  {route.to}
                </Text>
              </View>
            </View>
            
            <View style={styles.routeStats}>
              <View style={styles.routeStatItem}>
                <Ionicons 
                  name="time" 
                  size={14} 
                  color={isPopular ? 'rgba(255,255,255,0.8)' : '#6B7280'} 
                />
                <Text style={[styles.routeStatText, { color: isPopular ? 'rgba(255,255,255,0.9)' : '#6B7280' }]}>
                  {route.travelTime}
                </Text>
              </View>
              
              <View style={styles.routeStatItem}>
                <Ionicons 
                  name="people" 
                  size={14} 
                  color={isPopular ? 'rgba(255,255,255,0.8)' : '#6B7280'} 
                />
                <Text style={[styles.routeStatText, { color: isPopular ? 'rgba(255,255,255,0.9)' : '#6B7280' }]}>
                  {route.availableSeats} available
                </Text>
              </View>
              
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={isPopular ? 'rgba(255,255,255,0.8)' : '#8B5CF6'} 
              />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );
};

// Enhanced Stats Card Component
const StatsCard = ({ icon, title, value, subtitle, color, delay = 0 }) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.statCard}
    >
      <LinearGradient
        colors={[color + '15', color + '25']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.statInfo}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
      </LinearGradient>
    </Animatable.View>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'rides', icon: 'car', label: 'Rides' },
    { id: 'history', icon: 'time', label: 'History' },
    { id: 'chat', icon: 'chatbubbles', label: 'Chat' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={styles.bottomNav}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,1)']}
        style={styles.bottomNavGradient}
      >
        {tabs.map((tab) => (
          <TouchableWithoutFeedback
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
          >
            <View style={styles.tabItem}>
              <Animated.View
                style={[
                  styles.tabIconContainer,
                  activeTab === tab.id && styles.activeTabIcon
                ]}
              >
                <Ionicons
                  name={activeTab === tab.id ? tab.icon : tab.icon + '-outline'}
                  size={24}
                  color={activeTab === tab.id ? '#ffffff' : '#8B5CF6'}
                />
              </Animated.View>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.id && styles.activeTabLabel
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ))}
      </LinearGradient>
    </View>
  );
};

// Ride Tab Content Component
const RideTabContent = ({ activeRideTab, setActiveRideTab, router }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: activeRideTab === 'find' ? 0 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8
    }).start();
  }, [activeRideTab]);

  return (
    <View style={styles.rideTabContainer}>
      {/* Tab Headers */}
      <View style={styles.rideTabHeaders}>
        <Pressable
          style={[
            styles.rideTabHeader,
            activeRideTab === 'find' && styles.activeRideTabHeader
          ]}
          onPress={() => setActiveRideTab('find')}
        >
          <Text style={[
            styles.rideTabHeaderText,
            activeRideTab === 'find' && styles.activeRideTabHeaderText
          ]}>
            🔍 Find Rides
          </Text>
        </Pressable>
        
        <Pressable
          style={[
            styles.rideTabHeader,
            activeRideTab === 'post' && styles.activeRideTabHeader
          ]}
          onPress={() => setActiveRideTab('post')}
        >
          <Text style={[
            styles.rideTabHeaderText,
            activeRideTab === 'post' && styles.activeRideTabHeaderText
          ]}>
            ➕ Post Rides
          </Text>
        </Pressable>
      </View>

      {/* Animated Tab Indicator */}
      <Animated.View
        style={[
          styles.tabIndicator,
          {
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, SCREEN_WIDTH / 2 - 40]
              })
            }]
          }
        ]}
      />

      {/* Tab Content */}
      <ScrollView style={styles.rideTabContent} showsVerticalScrollIndicator={false}>
        {activeRideTab === 'find' ? (
          <FindRidesContent router={router} />
        ) : (
          <PostRidesContent router={router} />
        )}
      </ScrollView>
    </View>
  );
};

// Find Rides Content with Firebase Integration
const FindRidesContent = ({ router }) => {
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [isShowingPopularRoutes, setIsShowingPopularRoutes] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    state: { rides },
  } = useRides();

  // Estimate travel time based on common routes
  const estimateTravelTime = (from, to) => {
    const routeTimes = {
      'mumbai-delhi': '15h',
      'delhi-mumbai': '15h',
      'bangalore-chennai': '6h',
      'chennai-bangalore': '6h',
      'pune-mumbai': '3h',
      'mumbai-pune': '3h',
      'delhi-jaipur': '5h',
      'jaipur-delhi': '5h',
      'kolkata-bhubaneswar': '6h',
      'bhubaneswar-kolkata': '6h',
      'hyderabad-bangalore': '6h',
      'bangalore-hyderabad': '6h',
      'ahmedabad-mumbai': '8h',
      'mumbai-ahmedabad': '8h',
      // International routes
      'new york-boston': '4h',
      'nyc-boston': '4h',
      'los angeles-san diego': '3h',
      'la-san diego': '3h',
      'chicago-detroit': '5h',
      'miami-orlando': '3.5h',
      'seattle-portland': '3h',
      'dallas-houston': '4h',
    };

    const routeKey = `${from.toLowerCase()}-${to.toLowerCase()}`;
    return routeTimes[routeKey] || '5h';
  };

  // Fetch popular routes from Firebase Firestore
  const fetchPopularRoutesFromFirestore = async (ridesData) => {
    try {
      console.log('🔥 Fetching routes from Firebase Firestore...');
      
      if (!ridesData || ridesData.length === 0) {
        return [];
      }

      const routeFrequency = {};
      
      ridesData.forEach((ride) => {
        const routeKey = `${ride.from.toLowerCase()}-${ride.to.toLowerCase()}`;
        if (routeFrequency[routeKey]) {
          routeFrequency[routeKey].count++;
          routeFrequency[routeKey].availableSeats += parseInt(ride.seats) || 1;
          routeFrequency[routeKey].rides.push(ride);
        } else {
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

      const allRoutes = Object.values(routeFrequency);
      const popularRoutes = allRoutes.filter(route => route.count >= 2);
      
      let routesToShow;
      let isPopular = false;
      
      if (popularRoutes.length > 0) {
        routesToShow = popularRoutes
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        isPopular = true;
        console.log('🏆 Found popular routes (appearing multiple times)');
      } else {
        routesToShow = allRoutes
          .sort((a, b) => new Date(b.lastPosted) - new Date(a.lastPosted))
          .slice(0, 3);
        console.log('📍 Showing current routes from DB');
      }

      setIsShowingPopularRoutes(isPopular);
      return routesToShow;
    } catch (error) {
      console.error('❌ Error fetching routes from Firebase:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadRoutes = async () => {
      if (rides && rides.length > 0) {
        const routes = await fetchPopularRoutesFromFirestore(rides);
        setPopularRoutes(routes);
      }
      setLoading(false);
    };

    loadRoutes();
  }, [rides]);

  const handleRoutePress = (route) => {
    // Navigate to find rides with pre-filled data
    router.push({
      pathname: "/rides",
      params: {
        from: route.from,
        to: route.to
      }
    });
  };

  return (
    <ScrollView style={styles.tabContentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.tabContentInner}>
        {/* Enhanced Search Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={styles.searchSection}
        >
          <Text style={styles.sectionTitle}>Where do you want to go? ✈️</Text>
          
          <Pressable
            style={styles.enhancedSearchButton}
            onPress={() => router.push("/rides")}
          >
            <LinearGradient
              colors={['#F8FAFC', '#F1F5F9']}
              style={styles.searchButtonGradient}
            >
              <View style={styles.searchRow}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="radio-button-on" size={20} color="#10B981" />
                </View>
                <Text style={styles.searchPlaceholder}>From location</Text>
              </View>
              
              <View style={styles.searchDivider} />
              
              <View style={styles.searchRow}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="location" size={20} color="#EF4444" />
                </View>
                <Text style={styles.searchPlaceholder}>To destination</Text>
              </View>
              
              <View style={styles.searchAction}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.searchActionGradient}
                >
                  <Ionicons name="search" size={20} color="#fff" />
                </LinearGradient>
              </View>
            </LinearGradient>
          </Pressable>
        </Animatable.View>

        {/* Popular/Current Routes */}
        {!loading && popularRoutes.length > 0 && (
          <Animatable.View
            animation="fadeInUp"
            delay={400}
            style={styles.quickRoutesSection}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isShowingPopularRoutes ? '🔥 Popular Routes' : '🚗 Current Routes'}
              </Text>
              {isShowingPopularRoutes && (
                <View style={styles.popularIndicator}>
                  <Ionicons name="trending-up" size={16} color="#EF4444" />
                  <Text style={styles.popularIndicatorText}>Hot</Text>
                </View>
              )}
            </View>
            
            <View style={styles.routesList}>
              {popularRoutes.map((route, index) => (
                <PopularRouteCard
                  key={`${route.from}-${route.to}`}
                  route={route}
                  onPress={() => handleRoutePress(route)}
                  delay={600 + index * 100}
                  isPopular={isShowingPopularRoutes && index === 0}
                />
              ))}
            </View>

            <Animatable.View
              animation="fadeInUp"
              delay={900}
              style={styles.viewAllButton}
            >
              <Pressable
                style={styles.viewAllPressable}
                onPress={() => router.push("/rides")}
              >
                <Text style={styles.viewAllText}>View All Routes</Text>
                <Ionicons name="arrow-forward" size={16} color="#8B5CF6" />
              </Pressable>
            </Animatable.View>
          </Animatable.View>
        )}

        {/* Loading State */}
        {loading && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            style={styles.loadingSection}
          >
            <Ionicons name="car-sport" size={32} color="#8B5CF6" />
            <Text style={styles.loadingText}>Finding amazing routes...</Text>
          </Animatable.View>
        )}

        {/* Empty State */}
        {!loading && popularRoutes.length === 0 && (
          <Animatable.View
            animation="fadeIn"
            style={styles.emptyRoutesSection}
          >
            <Ionicons name="map-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No routes available</Text>
            <Text style={styles.emptySubtitle}>Be the first to post a ride!</Text>
            <Pressable
              style={styles.postFirstRideButton}
              onPress={() => router.push("/postrides")}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.postFirstRideGradient}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.postFirstRideText}>Post First Ride</Text>
              </LinearGradient>
            </Pressable>
          </Animatable.View>
        )}
      </View>
    </ScrollView>
  );
};

// Post Rides Content
const PostRidesContent = ({ router }) => {
  return (
    <ScrollView style={styles.tabContentScrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.tabContentInner}>
        {/* Enhanced Post Ride Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={200}
          style={styles.postSection}
        >
          <Text style={styles.sectionTitle}>Share your ride 🚗</Text>
          
          <Pressable
            style={styles.enhancedPostButton}
            onPress={() => router.push("/postrides")}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.postButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.postButtonText}>Create New Ride</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animatable.View>

        {/* Enhanced Benefits Section */}
        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={styles.benefitsSection}
        >
          <Text style={styles.sectionTitle}>Why share rides? 🌟</Text>
          
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="leaf" size={24} color="#10B981" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Help Environment</Text>
                <Text style={styles.benefitDesc}>Reduce carbon footprint together</Text>
              </View>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="people" size={24} color="#F59E0B" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Meet People</Text>
                <Text style={styles.benefitDesc}>Connect with fellow travelers</Text>
              </View>
            </View>

            <View style={styles.benefitItem}>
              <View style={[styles.benefitIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
              </View>
              <View style={styles.benefitText}>
                <Text style={styles.benefitTitle}>Safe & Verified</Text>
                <Text style={styles.benefitDesc}>All users are verified for safety</Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </View>
    </ScrollView>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('rides');
  const [activeRideTab, setActiveRideTab] = useState('find');
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'profile') {
      router.push("/profile");
    } else if (tabId === 'history') {
      router.push("/myrides");
    } else if (tabId === 'chat') {
      router.push("/chat");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh - your actual refresh logic would go here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.mainContainer}>
        {/* Enhanced Header */}
        <LinearGradient
          colors={['#ffffff', '#fafbff']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Hello there! 👋</Text>
              <Text style={styles.appTitle}>Desi Connect</Text>
            </View>

            <Pressable
              style={styles.profileButton}
              onPress={() => setShowDropdown(!showDropdown)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.profileGradient}
              >
                <Ionicons name="person" size={24} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Dropdown Overlay */}
        {showDropdown && (
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View style={styles.dropdownOverlay}>
              <Animatable.View
                animation="fadeInDown"
                duration={300}
                style={styles.dropdown}
              >
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    router.push("/profile");
                  }}
                >
                  <Ionicons name="person-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.dropdownText}>Profile</Text>
                </Pressable>
                
                <View style={styles.dropdownSeparator} />
                
                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Logout</Text>
                </Pressable>
              </Animatable.View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Main Content */}
        <View style={styles.mainContent}>
            {activeTab === 'rides' && (
              <RideTabContent
                activeRideTab={activeRideTab}
                setActiveRideTab={setActiveRideTab}
                router={router}
              />
            )}
            
            {activeTab === 'home' && (
              <ScrollView 
                style={styles.homeContent}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#8B5CF6']}
                    tintColor="#8B5CF6"
                  />
                }
              >
                <Animatable.View
                  animation="fadeInUp"
                  style={styles.welcomeCard}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.welcomeGradient}
                  >
                    <Ionicons name="car-sport" size={32} color="#fff" />
                    <Text style={styles.welcomeTitle}>Welcome back! 🎉</Text>
                    <Text style={styles.welcomeSubtitle}>Ready for your next adventure?</Text>
                  </LinearGradient>
                </Animatable.View>
                
                <View style={styles.statsContainer}>
                  <StatsCard
                    icon="car-sport"
                    title="Rides Taken"
                    value="12"
                    color="#8B5CF6"
                    delay={200}
                  />
                  
                  <StatsCard
                    icon="leaf"
                    title="CO₂ Saved"
                    value="240kg"
                    subtitle="This year"
                    color="#10B981"
                    delay={300}
                  />
                  
                  <StatsCard
                    icon="star"
                    title="Rating"
                    value="4.8"
                    subtitle="⭐⭐⭐⭐⭐"
                    color="#F59E0B"
                    delay={400}
                  />
                </View>
              </ScrollView>
            )}
          </View>

          {/* Bottom Navigation */}
          <BottomNavigation
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  
  // Enhanced Header Styles
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 100,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },
  profileButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 9999,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 150,
    zIndex: 10000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  dropdownSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },

  // Main Content
  mainContent: {
    flex: 1,
  },

  // Enhanced Home Content
  homeContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  welcomeGradient: {
    padding: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  statsContainer: {
    gap: 16,
    paddingBottom: 100,
  },
  statCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  statCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  // Ride Tab Styles
  rideTabContainer: {
    flex: 1,
  },
  rideTabHeaders: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    position: 'relative',
  },
  rideTabHeader: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 2,
  },
  activeRideTabHeader: {
    backgroundColor: '#ffffff',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  rideTabHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeRideTabHeaderText: {
    color: '#8B5CF6',
  },
  tabIndicator: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: SCREEN_WIDTH / 2 - 44,
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    zIndex: 1,
  },
  rideTabContent: {
    flex: 1,
    marginTop: 20,
  },
  tabContentScrollView: {
    flex: 1,
  },
  tabContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Enhanced Search Section
  searchSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  popularIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  popularIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  enhancedSearchButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  searchButtonGradient: {
    padding: 24,
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 16,
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
    marginLeft: 48,
  },
  searchAction: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchActionGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Enhanced Popular Routes
  quickRoutesSection: {
    marginBottom: 32,
  },
  routesList: {
    gap: 12,
  },
  popularRouteWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  popularRouteCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  popularRouteGradient: {
    padding: 20,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  popularRouteContent: {
    gap: 16,
  },
  routeLocations: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLocationText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  routeArrow: {
    marginHorizontal: 8,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeStatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: 16,
  },
  viewAllPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Loading and Empty States
  loadingSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyRoutesSection: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  postFirstRideButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  postFirstRideGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  postFirstRideText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Enhanced Post Section
  postSection: {
    marginBottom: 32,
  },
  enhancedPostButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    gap: 12,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },

  // Enhanced Benefits Section
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsList: {
    gap: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    gap: 16,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 20,
  },
  bottomNavGradient: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 25,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  tabIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeTabIcon: {
    backgroundColor: '#8B5CF6',
    transform: [{ scale: 1.1 }],
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabLabel: {
    color: '#8B5CF6',
  },
});