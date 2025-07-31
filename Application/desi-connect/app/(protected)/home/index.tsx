import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth } from "@/config/fbConfig";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

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

// Find Rides Content
const FindRidesContent = ({ router }) => {
  const quickRoutes = [
    { from: 'NYC', to: 'Boston', price: '', time: '4h', available: 3 },
    { from: 'LA', to: 'San Diego', price: '', time: '3h', available: 5 },
    { from: 'Chicago', to: 'Detroit', price: '', time: '5h', available: 2 },
  ];

  return (
    <View style={styles.tabContentInner}>
      {/* Search Section */}
      <Animatable.View
        animation="fadeInUp"
        delay={200} 
        style={styles.searchSection}
      >
        <Text style={styles.sectionTitle}>Where do you want to go?</Text>
        
        <Pressable
          style={styles.searchButton}
          onPress={() => router.push("/rides")}
        >
          <View style={styles.searchRow}>
            <Ionicons name="radio-button-on" size={20} color="#10B981" />
            <Text style={styles.searchPlaceholder}>From location</Text>
          </View>
          <View style={styles.searchRow}>
            <Ionicons name="location" size={20} color="#EF4444" />
            <Text style={styles.searchPlaceholder}>To destination</Text>
          </View>
          <View style={styles.searchAction}>
            <Ionicons name="search" size={24} color="#8B5CF6" />
          </View>
        </Pressable>
      </Animatable.View>

      {/* Quick Routes */}
      <Animatable.View
        animation="fadeInUp"
        delay={400}
        style={styles.quickRoutesSection}
      >
        <Text style={styles.sectionTitle}>Popular Routes 🔥</Text>
        
        {quickRoutes.map((route, index) => (
          <Animatable.View
            key={index}
            animation="fadeInUp"
            delay={600 + index * 100}
            style={styles.routeCard}
          >
            <View style={styles.routeInfo}>
              <View style={styles.routePath}>
                <Text style={styles.routeLocation}>{route.from}</Text>
                <Ionicons name="arrow-forward" size={16} color="#6B7280" />
                <Text style={styles.routeLocation}>{route.to}</Text>
              </View>
              <Text style={styles.routeTime}>{route.time} • {route.available} available</Text>
            </View>
            <View style={styles.routePrice}>
              <Text style={styles.priceText}>{route.price}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </View>
          </Animatable.View>
        ))}
      </Animatable.View>
    </View>
  );
};

// Post Rides Content
const PostRidesContent = ({ router }) => {
  return (
    <View style={styles.tabContentInner}>
      {/* Post Ride Form */}
      <Animatable.View
        animation="fadeInUp"
        delay={200}
        style={styles.postSection}
      >
        <Text style={styles.sectionTitle}>Share your ride 🚗</Text>
        
        <Pressable
          style={styles.postButton}
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

      {/* Benefits Section */}
      <Animatable.View
        animation="fadeInUp"
        delay={400}
        style={styles.benefitsSection}
      >
        <Text style={styles.sectionTitle}>Why share rides?</Text>
        
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="cash" size={24} color="#10B981" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Earn Money</Text>
              <Text style={styles.benefitDesc}>Cover fuel costs and earn extra</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="leaf" size={24} color="#10B981" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Help Environment</Text>
              <Text style={styles.benefitDesc}>Reduce carbon footprint</Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="people" size={24} color="#10B981" />
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Meet People</Text>
              <Text style={styles.benefitDesc}>Connect with fellow travelers</Text>
            </View>
          </View>
        </View>
      </Animatable.View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('rides');
  const [activeRideTab, setActiveRideTab] = useState('find');

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
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />
      
      <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
        <View style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View>
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

            {showDropdown && (
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
            )}
          </View>

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
              <ScrollView style={styles.homeContent}>
                <Animatable.View
                  animation="fadeInUp"
                  style={styles.welcomeCard}
                >
                  <Text style={styles.welcomeTitle}>Welcome back! 🎉</Text>
                  <Text style={styles.welcomeSubtitle}>Ready for your next adventure?</Text>
                </Animatable.View>
                
                <Animatable.View
                  animation="fadeInUp"
                  delay={200}
                  style={styles.statsCard}
                >
                  <Text style={styles.statsTitle}>Your Journey</Text>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>12</Text>
                      <Text style={styles.statLabel}>Rides Taken</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>$240</Text>
                      <Text style={styles.statLabel}>Money Saved</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statNumber}>4.8</Text>
                      <Text style={styles.statLabel}>Rating</Text>
                    </View>
                  </View>
                </Animatable.View>
              </ScrollView>
            )}
          </View>

          {/* Bottom Navigation */}
          <BottomNavigation
            activeTab={activeTab}
            onTabPress={handleTabPress}
          />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  profileGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    minWidth: 150,
    zIndex: 1000,
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

  // Home Content
  homeContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
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
  tabContentInner: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Search Section
  searchSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    position: 'relative',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  searchAction: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    padding: 8,
  },

  // Quick Routes
  quickRoutesSection: {
    marginBottom: 32,
  },
  routeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  routeInfo: {
    flex: 1,
  },
  routePath: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  routeLocation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  routeTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  routePrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },

  // Post Section
  postSection: {
    marginBottom: 32,
  },
  postButton: {
    borderRadius: 20,
    overflow: 'hidden',
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

  // Benefits Section
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
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
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
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