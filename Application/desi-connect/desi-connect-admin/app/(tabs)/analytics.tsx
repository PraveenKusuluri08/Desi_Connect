import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AdminHeader from '../../components/AdminHeader';
import { db } from '../../config/firebase';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get total rides
      const ridesSnapshot = await getDocs(collection(db, 'rides'));
      const totalRides = ridesSnapshot.size;

      // Get active rides
      const activeRidesQuery = query(
        collection(db, 'rides'),
        where('isRidedAccepted', '==', false)
      );
      const activeRidesSnapshot = await getDocs(activeRidesQuery);
      const activeRides = activeRidesSnapshot.size;

      // Get completed rides
      const completedRidesQuery = query(
        collection(db, 'rides'),
        where('isRidedAccepted', '==', true)
      );
      const completedRidesSnapshot = await getDocs(completedRidesQuery);
      const completedRides = completedRidesSnapshot.size;

      // Calculate revenue (assuming $10 per ride)
      const totalRevenue = completedRides * 10;

      // Get recent activity
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
      const topUsersData = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .slice(0, 5);

      setAnalytics({
        totalUsers,
        totalRides,
        activeRides,
        completedRides,
        totalRevenue,
        averageRating: 4.5, // Mock data
      });
      setRecentActivity(recentActivityData);
      setTopUsers(topUsersData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert(
        'Analytics Error',
        'Unable to load analytics data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color: string;
    trend?: number;
  }) => (
    <Animatable.View animation="fadeInUp" style={styles.statCard}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color="#FFFFFF" />
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

  const ActivityCard = ({ activity, index }: { activity: any; index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 100}
      style={styles.activityCard}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityIcon}>
          <Ionicons name="car" size={20} color="#3B82F6" />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>
            {activity.from} → {activity.to}
          </Text>
          <Text style={styles.activitySubtitle}>
            {new Date(activity.createdAt?.toDate()).toLocaleDateString()} • {activity.seats} seats
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
      
      <AdminHeader
        title="Analytics"
        subtitle="Detailed insights and statistics"
        onRefresh={loadAnalytics}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>📊 Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <StatCard
              title="Total Users"
              value={analytics.totalUsers}
              subtitle="Registered users"
              icon="people"
              color="#3B82F6"
              trend={12}
            />
            <StatCard
              title="Total Rides"
              value={analytics.totalRides}
              subtitle="All time rides"
              icon="car"
              color="#10B981"
              trend={8}
            />
            <StatCard
              title="Active Rides"
              value={analytics.activeRides}
              subtitle="Currently active"
              icon="time"
              color="#F59E0B"
              trend={-5}
            />
            <StatCard
              title="Revenue"
              value={`$${analytics.totalRevenue}`}
              subtitle="Total earnings"
              icon="cash"
              color="#8B5CF6"
              trend={15}
            />
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>📈 Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.completedRides}</Text>
              <Text style={styles.performanceLabel}>Completed Rides</Text>
              <Text style={styles.performanceSubtext}>
                {((analytics.completedRides / analytics.totalRides) * 100).toFixed(1)}% completion rate
              </Text>
            </View>
            <View style={styles.performanceCard}>
              <Text style={styles.performanceValue}>{analytics.averageRating}</Text>
              <Text style={styles.performanceLabel}>Average Rating</Text>
              <Text style={styles.performanceSubtext}>
                Based on user feedback
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="analytics-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>

        {/* Top Users */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>👥 Top Users</Text>
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <Animatable.View
                key={user.id}
                animation="fadeInUp"
                delay={index * 100}
                style={styles.userCard}
              >
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={24} color="#3B82F6" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.displayName || 'User'}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <View style={styles.userStats}>
                  <Text style={styles.userRides}>5 rides</Text>
                </View>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No users found</Text>
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
  scrollView: {
    flex: 1,
  },
  metricsSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  statGradient: {
    padding: 20,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  performanceValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  performanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  performanceSubtext: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
  },
  activitySection: {
    padding: 20,
    paddingTop: 0,
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
    backgroundColor: '#3B82F6' + '20',
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
  activitySubtitle: {
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
  usersSection: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userInfo: {
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
    alignItems: 'flex-end',
  },
  userRides: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
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
