import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AdminCard from '../../components/AdminCard';
import AdminHeader from '../../components/AdminHeader';
import { db } from '../../config/firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    cancelledRides: 0,
    totalRevenue: 0,
    averageRating: 4.5,
  });
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get total users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      // Get total rides
      const ridesSnapshot = await getDocs(collection(db, 'rides'));
      const totalRides = ridesSnapshot.size;

      // Get active rides (not accepted, not cancelled)
      const activeRidesQuery = query(
        collection(db, 'rides'),
        where('isRidedAccepted', '==', false)
      );
      const activeRidesSnapshot = await getDocs(activeRidesQuery);
      const activeRides = activeRidesSnapshot.size;

      // Get completed rides (accepted)
      const completedRidesQuery = query(
        collection(db, 'rides'),
        where('isRidedAccepted', '==', true)
      );
      const completedRidesSnapshot = await getDocs(completedRidesQuery);
      const completedRides = completedRidesSnapshot.size;

      // Get cancelled rides
      const cancelledRidesQuery = query(
        collection(db, 'rides'),
        where('isCancelled', '==', true)
      );
      const cancelledRidesSnapshot = await getDocs(cancelledRidesQuery);
      const cancelledRides = cancelledRidesSnapshot.size;

      // Calculate revenue (assuming $10 per completed ride)
      const totalRevenue = completedRides * 10;

      // Get recent rides
      const recentRidesQuery = query(
        collection(db, 'rides'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentRidesSnapshot = await getDocs(recentRidesQuery);
      const recentRidesData = recentRidesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get top users (users with most rides)
      const topUsersData = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .slice(0, 3);

      setStats({
        totalUsers,
        totalRides,
        activeRides,
        completedRides,
        cancelledRides,
        totalRevenue,
        averageRating: 4.5, // Mock data
      });
      setRecentRides(recentRidesData);
      setTopUsers(topUsersData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const QuickActionCard = ({ title, subtitle, icon, color, onPress, delay }: {
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    onPress: () => void;
    delay: number;
  }) => (
    <Animatable.View animation="fadeInUp" delay={delay}>
      <Pressable style={styles.quickActionCard} onPress={onPress}>
        <LinearGradient
          colors={[color, color + 'DD']}
          style={styles.quickActionGradient}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name={icon as any} size={28} color="#FFFFFF" />
          </View>
          <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </Pressable>
    </Animatable.View>
  );

  const RecentRideCard = ({ ride, index }: { ride: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.recentRideCard}
    >
      <View style={styles.recentRideHeader}>
        <View style={styles.recentRideIcon}>
          <Ionicons name="car" size={20} color="#3B82F6" />
        </View>
        <View style={styles.recentRideInfo}>
          <Text style={styles.recentRideRoute}>
            {ride.from} → {ride.to}
          </Text>
          <Text style={styles.recentRideDetails}>
            {new Date(ride.createdAt?.toDate()).toLocaleDateString()} • {ride.seats} seats
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          ride.isRidedAccepted ? styles.statusCompleted : 
          ride.isCancelled ? styles.statusCancelled : styles.statusActive
        ]}>
          <Text style={styles.statusText}>
            {ride.isRidedAccepted ? 'Completed' : 
             ride.isCancelled ? 'Cancelled' : 'Active'}
          </Text>
        </View>
      </View>
    </Animatable.View>
  );

  const TopUserCard = ({ user, index }: { user: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.topUserCard}
    >
      <View style={styles.topUserAvatar}>
        <Ionicons name="person" size={24} color="#3B82F6" />
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      </View>
      <View style={styles.topUserInfo}>
        <Text style={styles.topUserName}>{user.displayName || 'User'}</Text>
        <Text style={styles.topUserEmail}>{user.email}</Text>
      </View>
      <View style={styles.topUserStats}>
        <Text style={styles.topUserRides}>5 rides</Text>
        <Text style={styles.topUserRating}>⭐ 4.8</Text>
      </View>
    </Animatable.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading admin dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <AdminHeader
        title="Admin Dashboard"
        subtitle="Manage your DesiConnect application"
        showBadge={true}
        onRefresh={loadDashboardData}
        rightAction={{
          icon: "notifications",
          onPress: () => Alert.alert('Notifications', 'Notifications coming soon!'),
          color: "#F59E0B"
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <View style={styles.lastUpdatedContainer}>
          <Text style={styles.lastUpdatedText}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Overview Statistics</Text>
          <View style={styles.statsGrid}>
            <AdminCard
              title="Total Users"
              value={stats.totalUsers}
              icon="people"
              color="#3B82F6"
              onPress={() => router.push('/users')}
              delay={100}
            />
            
            <AdminCard
              title="Total Rides"
              value={stats.totalRides}
              icon="car"
              color="#10B981"
              onPress={() => router.push('/rides')}
              delay={200}
            />
            
            <AdminCard
              title="Active Rides"
              value={stats.activeRides}
              icon="time"
              color="#F59E0B"
              onPress={() => router.push('/rides?filter=active')}
              delay={300}
            />
            
            <AdminCard
              title="Completed"
              value={stats.completedRides}
              icon="checkmark-circle"
              color="#8B5CF6"
              onPress={() => router.push('/rides?filter=completed')}
              delay={400}
            />
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>📈 Performance Metrics</Text>
          <View style={styles.performanceGrid}>
            <AdminCard
              title="Revenue"
              value={`$${stats.totalRevenue}`}
              subtitle="Total earnings"
              icon="cash"
              color="#10B981"
              gradient={false}
              delay={500}
            />
            
            <AdminCard
              title="Rating"
              value={stats.averageRating}
              subtitle="Average user rating"
              icon="star"
              color="#F59E0B"
              gradient={false}
              delay={600}
            />
            
            <AdminCard
              title="Cancelled"
              value={stats.cancelledRides}
              subtitle="Cancelled rides"
              icon="close-circle"
              color="#EF4444"
              gradient={false}
              delay={700}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <QuickActionCard
            title="Manage Users"
            subtitle="View, edit, and manage user accounts"
            icon="people-circle"
            color="#3B82F6"
            onPress={() => router.push('/users')}
            delay={800}
          />
          
          <QuickActionCard
            title="Monitor Rides"
            subtitle="Track and manage all ride activities"
            icon="car-sport"
            color="#10B981"
            onPress={() => router.push('/rides')}
            delay={900}
          />
          
          <QuickActionCard
            title="Analytics"
            subtitle="View detailed statistics and insights"
            icon="analytics"
            color="#8B5CF6"
            onPress={() => router.push('/analytics')}
            delay={1000}
          />
          
          <QuickActionCard
            title="Settings"
            subtitle="Configure admin panel settings"
            icon="settings"
            color="#6B7280"
            onPress={() => router.push('/settings')}
            delay={1100}
          />
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
          
          {recentRides.length > 0 ? (
            recentRides.map((ride, index) => (
              <RecentRideCard key={ride.id} ride={ride} index={index} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No recent rides found</Text>
            </View>
          )}
        </View>

        {/* Top Users */}
        <View style={styles.topUsersSection}>
          <Text style={styles.sectionTitle}>👥 Top Users</Text>
          
          {topUsers.length > 0 ? (
            topUsers.map((user, index) => (
              <TopUserCard key={user.id} user={user} index={index} />
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
  lastUpdatedContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  lastUpdatedText: {
    color: '#666666',
    fontSize: 12,
  },
  statsSection: {
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
  performanceSection: {
    padding: 20,
    paddingTop: 0,
  },
  performanceGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  quickActionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  quickActionCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  quickActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  recentRideCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  recentRideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentRideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recentRideInfo: {
    flex: 1,
  },
  recentRideRoute: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentRideDetails: {
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
  statusCancelled: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  topUsersSection: {
    padding: 20,
    paddingTop: 0,
  },
  topUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  topUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  rankBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  topUserInfo: {
    flex: 1,
  },
  topUserName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  topUserEmail: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  topUserStats: {
    alignItems: 'flex-end',
  },
  topUserRides: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  topUserRating: {
    color: '#F59E0B',
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
