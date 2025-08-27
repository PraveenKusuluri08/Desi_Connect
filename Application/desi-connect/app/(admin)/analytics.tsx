import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { db } from '../../firebaseconfig';

export default function AdminAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyGrowth: 0,
    userRetention: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [rideStats, setRideStats] = useState({
    byStatus: {},
    byMonth: {},
    popularRoutes: [],
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      
      // Get all rides
      const ridesSnapshot = await getDocs(collection(db, 'rides'));
      const ridesData = ridesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const totalRides = ridesData.length;
      const activeRides = ridesData.filter(ride => !ride.isRidedAccepted).length;
      const completedRides = ridesData.filter(ride => ride.isRidedAccepted).length;
      
      // Calculate revenue (assuming $10 per ride)
      const totalRevenue = completedRides * 10;
      
      // Calculate average rating
      const ratings = ridesData.filter(ride => ride.rating).map(ride => ride.rating);
      const averageRating = ratings.length > 0 ? 
        (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : 0;
      
      // Calculate monthly growth (mock data for now)
      const monthlyGrowth = 15.5;
      const userRetention = 78.2;
      
      // Get recent activity (last 10 rides)
      const recentRidesQuery = query(
        collection(db, 'rides'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentRidesSnapshot = await getDocs(recentRidesQuery);
      const recentActivityData = recentRidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Get top users (users with most rides)
      const userRideCounts = {};
      ridesData.forEach(ride => {
        if (ride.userId) {
          userRideCounts[ride.userId] = (userRideCounts[ride.userId] || 0) + 1;
        }
      });
      
      const topUsersData = Object.entries(userRideCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, rideCount]) => ({
          userId,
          rideCount,
          userData: usersSnapshot.docs.find(doc => doc.id === userId)?.data()
        }));
      
      // Calculate ride statistics
      const rideStatusCounts = {
        active: activeRides,
        completed: completedRides,
        cancelled: ridesData.filter(ride => ride.status === 'cancelled').length,
      };
      
      // Popular routes (mock data for now)
      const popularRoutes = [
        { route: 'University → Downtown', count: 45 },
        { route: 'Airport → City Center', count: 32 },
        { route: 'Mall → Residential Area', count: 28 },
        { route: 'Hospital → University', count: 25 },
      ];
      
      setAnalytics({
        totalUsers,
        totalRides,
        activeRides,
        completedRides,
        totalRevenue,
        averageRating,
        monthlyGrowth,
        userRetention,
      });
      
      setRecentActivity(recentActivityData);
      setTopUsers(topUsersData);
      setRideStats({
        byStatus: rideStatusCounts,
        byMonth: {}, // Will be calculated if needed
        popularRoutes,
      });
      
    } catch (error) {
      console.error('Error loading analytics:', error);
      // Show error but don't crash the app
      Alert.alert(
        'Analytics Error',
        'Unable to load analytics data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <Animatable.View animation="fadeInUp" style={styles.statCard}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
          {trend && (
            <View style={[styles.trendBadge, trend > 0 ? styles.trendUp : styles.trendDown]}>
              <Ionicons 
                name={trend > 0 ? "trending-up" : "trending-down"} 
                size={12} 
                color="#FFFFFF" 
              />
              <Text style={styles.trendText}>{Math.abs(trend)}%</Text>
            </View>
          )}
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </Animatable.View>
  );

  const ActivityCard = ({ activity, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.activityCard}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityIcon}>
          <Ionicons 
            name={activity.isRidedAccepted ? "checkmark-circle" : "time"} 
            size={20} 
            color={activity.isRidedAccepted ? "#10B981" : "#F59E0B"} 
          />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {activity.from} → {activity.to}
          </Text>
          <Text style={styles.activityDetails}>
            {new Date(activity.createdAt).toLocaleDateString()} • {activity.seats} seats
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          activity.isRidedAccepted ? styles.statusCompleted : styles.statusActive
        ]}>
          <Text style={styles.statusText}>
            {activity.isRidedAccepted ? 'Completed' : 'Active'}
          </Text>
        </View>
      </View>
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time insights and statistics</Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadAnalytics}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Users"
              value={analytics.totalUsers}
              icon="people"
              color="#3B82F6"
              trend={analytics.monthlyGrowth}
            />
            <StatCard
              title="Total Rides"
              value={analytics.totalRides}
              icon="car"
              color="#10B981"
              trend={12.5}
            />
            <StatCard
              title="Active Rides"
              value={analytics.activeRides}
              icon="time"
              color="#F59E0B"
            />
            <StatCard
              title="Completed"
              value={analytics.completedRides}
              icon="checkmark-circle"
              color="#8B5CF6"
            />
            <StatCard
              title="Revenue"
              value={`$${analytics.totalRevenue}`}
              subtitle="Total earnings"
              icon="cash"
              color="#EF4444"
              trend={8.2}
            />
            <StatCard
              title="Rating"
              value={analytics.averageRating}
              subtitle="Average user rating"
              icon="star"
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Ride Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Ride Statistics</Text>
          <View style={styles.rideStatsContainer}>
            <View style={styles.rideStatCard}>
              <Text style={styles.rideStatTitle}>Ride Status</Text>
              <View style={styles.rideStatItem}>
                <View style={styles.rideStatDot} />
                <Text style={styles.rideStatLabel}>Active: {rideStats.byStatus.active}</Text>
              </View>
              <View style={styles.rideStatItem}>
                <View style={[styles.rideStatDot, styles.completedDot]} />
                <Text style={styles.rideStatLabel}>Completed: {rideStats.byStatus.completed}</Text>
              </View>
              <View style={styles.rideStatItem}>
                <View style={[styles.rideStatDot, styles.cancelledDot]} />
                <Text style={styles.rideStatLabel}>Cancelled: {rideStats.byStatus.cancelled}</Text>
              </View>
            </View>
            
            <View style={styles.rideStatCard}>
              <Text style={styles.rideStatTitle}>Popular Routes</Text>
              {rideStats.popularRoutes.slice(0, 3).map((route, index) => (
                <View key={index} style={styles.routeItem}>
                  <Text style={styles.routeName}>{route.route}</Text>
                  <Text style={styles.routeCount}>{route.count} rides</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Top Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Top Users</Text>
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <Animatable.View
                key={user.userId}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.userCard}
              >
                <View style={styles.userInfo}>
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color="#FFFFFF" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>
                      {user.userData?.displayName || user.userData?.email || 'Unknown User'}
                    </Text>
                    <Text style={styles.userEmail}>{user.userData?.email}</Text>
                  </View>
                  <View style={styles.userStats}>
                    <Text style={styles.userRideCount}>{user.rideCount}</Text>
                    <Text style={styles.userRideLabel}>rides</Text>
                  </View>
                </View>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No user data available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  trendUp: {
    backgroundColor: '#10B981',
  },
  trendDown: {
    backgroundColor: '#EF4444',
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  statSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  rideStatsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  rideStatCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  rideStatTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  rideStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rideStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 10,
  },
  completedDot: {
    backgroundColor: '#10B981',
  },
  cancelledDot: {
    backgroundColor: '#EF4444',
  },
  rideStatLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  routeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  routeName: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  routeCount: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  activityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetails: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#F59E0B',
  },
  statusCompleted: {
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  userCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  userStats: {
    alignItems: 'center',
  },
  userRideCount: {
    color: '#3B82F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRideLabel: {
    color: '#CCCCCC',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 10,
  },
});
