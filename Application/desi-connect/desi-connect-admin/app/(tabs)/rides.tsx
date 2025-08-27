import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import AdminHeader from '../../components/AdminHeader';
import FilterTabs from '../../components/FilterTabs';
import SearchBar from '../../components/SearchBar';
import { db } from '../../config/firebase';

export default function AdminRides() {
  const [rides, setRides] = useState<any[]>([]);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, searchQuery, filter]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const ridesSnapshot = await getDocs(collection(db, 'rides'));
      const ridesData = ridesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesData);
    } catch (error) {
      console.error('Error loading rides:', error);
      Alert.alert(
        'Rides Error',
        'Unable to load rides data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    let filtered = rides;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ride => 
        ride.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.userName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(ride => !ride.isRidedAccepted && !ride.isCancelled);
        break;
      case 'completed':
        filtered = filtered.filter(ride => ride.isRidedAccepted);
        break;
      case 'cancelled':
        filtered = filtered.filter(ride => ride.isCancelled);
        break;
      default:
        break;
    }

    setFilteredRides(filtered);
  };

  const updateRideStatus = async (rideId: string, newStatus: string) => {
    try {
      const rideRef = doc(db, 'rides', rideId);
      const updateData: any = {};
      
      switch (newStatus) {
        case 'completed':
          updateData.isRidedAccepted = true;
          updateData.completedAt = new Date();
          break;
        case 'cancelled':
          updateData.isCancelled = true;
          updateData.cancelledAt = new Date();
          break;
        case 'active':
          updateData.isRidedAccepted = false;
          updateData.isCancelled = false;
          break;
      }

      await updateDoc(rideRef, updateData);

      // Update local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, ...updateData }
            : ride
        )
      );

      Alert.alert('Success', `Ride status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating ride:', error);
      Alert.alert('Error', 'Failed to update ride status');
    }
  };

  const deleteRide = async (rideId: string, rideRoute: string) => {
    Alert.alert(
      'Delete Ride',
      `Are you sure you want to delete this ride (${rideRoute})? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'rides', rideId));
              
              // Update local state
              setRides(prevRides => prevRides.filter(ride => ride.id !== rideId));
              
              Alert.alert('Success', 'Ride deleted successfully!');
            } catch (error) {
              console.error('Error deleting ride:', error);
              Alert.alert('Error', 'Failed to delete ride');
            }
          }
        }
      ]
    );
  };

  const RideCard = ({ ride, index }: { ride: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.rideCard}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideIcon}>
          <Ionicons name="car" size={24} color="#3B82F6" />
        </View>
        <View style={styles.rideInfo}>
          <Text style={styles.rideRoute}>
            {ride.from} → {ride.to}
          </Text>
          <Text style={styles.rideDetails}>
            {ride.seats} seats • ${ride.price || 'N/A'}
          </Text>
          <Text style={styles.rideUser}>
            By: {ride.userName || 'Unknown User'}
          </Text>
        </View>
        <View style={styles.rideStatus}>
          {ride.isRidedAccepted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>COMPLETED</Text>
            </View>
          ) : ride.isCancelled ? (
            <View style={styles.cancelledBadge}>
              <Text style={styles.cancelledText}>CANCELLED</Text>
            </View>
          ) : (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rideMeta}>
        <Text style={styles.rideDate}>
          Created: {ride.createdAt ? new Date(ride.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
        </Text>
        {ride.date && (
          <Text style={styles.rideDate}>
            Date: {new Date(ride.date.toDate()).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.rideActions}>
        {!ride.isRidedAccepted && !ride.isCancelled && (
          <Pressable
            style={styles.completeButton}
            onPress={() => updateRideStatus(ride.id, 'completed')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Complete</Text>
          </Pressable>
        )}

        {!ride.isCancelled && (
          <Pressable
            style={styles.cancelButton}
            onPress={() => updateRideStatus(ride.id, 'cancelled')}
          >
            <Ionicons name="close-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </Pressable>
        )}

        {ride.isCancelled && (
          <Pressable
            style={styles.activateButton}
            onPress={() => updateRideStatus(ride.id, 'active')}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Reactivate</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteRide(ride.id, `${ride.from} → ${ride.to}`)}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </Animatable.View>
  );

  const filterOptions = [
    { key: 'all', label: 'All', count: rides.length },
    { key: 'active', label: 'Active', count: rides.filter(r => !r.isRidedAccepted && !r.isCancelled).length },
    { key: 'completed', label: 'Completed', count: rides.filter(r => r.isRidedAccepted).length },
    { key: 'cancelled', label: 'Cancelled', count: rides.filter(r => r.isCancelled).length },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading rides...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <AdminHeader
        title="Ride Management"
        subtitle={`${filteredRides.length} of ${rides.length} rides`}
        onRefresh={loadRides}
        rightAction={{
          icon: "add",
          onPress: () => Alert.alert('Add Ride', 'Add ride feature coming soon!'),
          color: "#10B981"
        }}
      />

      <SearchBar
        placeholder="Search rides..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FilterTabs
        options={filterOptions}
        selectedFilter={filter}
        onFilterChange={setFilter}
      />

      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <RideCard ride={item} index={index} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No rides found matching your search' : 'No rides found'}
            </Text>
          </View>
        }
      />
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
  listContainer: {
    padding: 20,
  },
  rideCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rideIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rideInfo: {
    flex: 1,
  },
  rideRoute: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  rideDetails: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 2,
  },
  rideUser: {
    color: '#666666',
    fontSize: 12,
  },
  rideStatus: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cancelledBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cancelledText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  rideMeta: {
    marginBottom: 15,
  },
  rideDate: {
    color: '#666666',
    fontSize: 12,
    marginBottom: 2,
  },
  rideActions: {
    flexDirection: 'row',
    gap: 10,
  },
  completeButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  cancelButton: {
    backgroundColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  activateButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  actionButtonText: {
    color: '#FFFFFF',
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
    textAlign: 'center',
  },
});
