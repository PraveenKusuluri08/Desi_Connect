import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Get active rides (not accepted)
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

      setStats({
        totalUsers,
        totalRides,
        activeRides,
        completedRides,
      });
      setRecentRides(recentRidesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <Pressable style={styles.statCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.statGradient}
      >
        <View style={styles.statContent}>
          <Ionicons name={icon} size={32} color="#FFFFFF" />
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );

  const QuickActionCard = ({ title, subtitle, icon, color, onPress }) => (
    <Pressable style={styles.quickActionCard} onPress={onPress}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.quickActionGradient}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <View style={styles.quickActionContent}>
          <Text style={styles.quickActionTitle}>{title}</Text>
          <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage your DesiConnect application</Text>
        </View>
        <View style={styles.headerActions}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Pressable style={styles.refreshButton} onPress={loadDashboardData}>
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 Overview Statistics</Text>
          <View style={styles.statsGrid}>
            <Animatable.View animation="fadeInUp" delay={100}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                icon="people"
                color="#3B82F6"
                onPress={() => router.push('/admin/users')}
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" delay={200}>
              <StatCard
                title="Total Rides"
                value={stats.totalRides}
                icon="car"
                color="#10B981"
                onPress={() => router.push('/admin/rides')}
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" delay={300}>
              <StatCard
                title="Active Rides"
                value={stats.activeRides}
                icon="time"
                color="#F59E0B"
                onPress={() => router.push('/admin/rides?filter=active')}
              />
            </Animatable.View>
            
            <Animatable.View animation="fadeInUp" delay={400}>
              <StatCard
                title="Completed"
                value={stats.completedRides}
                icon="checkmark-circle"
                color="#8B5CF6"
                onPress={() => router.push('/admin/rides?filter=completed')}
              />
            </Animatable.View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          
          <Animatable.View animation="fadeInUp" delay={500}>
            <QuickActionCard
              title="Manage Users"
              subtitle="View, edit, and manage user accounts"
              icon="people-circle"
              color="#3B82F6"
              onPress={() => router.push('/admin/users')}
            />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={600}>
            <QuickActionCard
              title="Monitor Rides"
              subtitle="Track and manage all ride activities"
              icon="car-sport"
              color="#10B981"
              onPress={() => router.push('/admin/rides')}
            />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={700}>
            <QuickActionCard
              title="Analytics"
              subtitle="View detailed statistics and insights"
              icon="analytics"
              color="#8B5CF6"
              onPress={() => router.push('/admin/analytics')}
            />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={800}>
            <QuickActionCard
              title="Ride Management"
              subtitle="Monitor and manage all ride activities"
              icon="car-sport"
              color="#EF4444"
              onPress={() => router.push('/admin/rides')}
            />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={900}>
            <QuickActionCard
              title="Settings"
              subtitle="Configure admin panel settings"
              icon="settings"
              color="#6B7280"
              onPress={() => router.push('/admin/settings')}
            />
          </Animatable.View>
        </View>

        {/* Recent Rides */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>🕒 Recent Rides</Text>
          
          {recentRides.length > 0 ? (
            recentRides.map((ride, index) => (
              <Animatable.View
                key={ride.id}
                animation="fadeInUp"
                delay={900 + index * 100}
                style={styles.recentRideCard}
              >
                <View style={styles.recentRideHeader}>
                  <Text style={styles.recentRideRoute}>
                    {ride.from} → {ride.to}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    ride.isRidedAccepted ? styles.statusCompleted : styles.statusActive
                  ]}>
                    <Text style={styles.statusText}>
                      {ride.isRidedAccepted ? 'Completed' : 'Active'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recentRideDetails}>
                  {new Date(ride.createdAt).toLocaleDateString()} • {ride.seats} seats
                </Text>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="car-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No rides found</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  statCard: {
    width: '47%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
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
  quickActionContent: {
    flex: 1,
    marginLeft: 15,
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
    marginTop: 2,
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
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  recentRideRoute: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
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
  recentRideDetails: {
    color: '#CCCCCC',
    fontSize: 12,
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
