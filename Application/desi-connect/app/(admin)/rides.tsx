import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    TextInput,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { db } from '../../firebaseconfig';

export default function RideManagement() {
  const router = useRouter();
  const { filter } = useLocalSearchParams();
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(filter || 'all');

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    filterRides();
  }, [rides, searchQuery, selectedFilter]);

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
        ride.userId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (selectedFilter === 'active') {
      filtered = filtered.filter(ride => !ride.isRidedAccepted);
    } else if (selectedFilter === 'completed') {
      filtered = filtered.filter(ride => ride.isRidedAccepted);
    } else if (selectedFilter === 'cancelled') {
      filtered = filtered.filter(ride => ride.status === 'cancelled');
    }

    setFilteredRides(filtered);
  };

  const updateRideStatus = async (rideId, newStatus) => {
    try {
      const rideRef = doc(db, 'rides', rideId);
      await updateDoc(rideRef, {
        status: newStatus,
        isRidedAccepted: newStatus === 'completed',
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setRides(prevRides => 
        prevRides.map(ride => 
          ride.id === rideId 
            ? { ...ride, status: newStatus, isRidedAccepted: newStatus === 'completed' }
            : ride
        )
      );
      
      Alert.alert('Success', `Ride status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating ride:', error);
      Alert.alert('Error', 'Failed to update ride status');
    }
  };

  const deleteRide = async (rideId) => {
    Alert.alert(
      'Delete Ride',
      'Are you sure you want to delete this ride? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'rides', rideId));
              setRides(prevRides => prevRides.filter(ride => ride.id !== rideId));
              Alert.alert('Success', 'Ride deleted successfully');
            } catch (error) {
              console.error('Error deleting ride:', error);
              Alert.alert('Error', 'Failed to delete ride');
            }
          }
        }
      ]
    );
  };

  const FilterButton = ({ title, filter, icon, count }) => (
    <Pressable
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={selectedFilter === filter ? '#FFFFFF' : '#666666'} 
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter && styles.filterButtonTextActive
      ]}>
        {title}
      </Text>
      {count > 0 && (
        <View style={styles.filterCount}>
          <Text style={styles.filterCountText}>{count}</Text>
        </View>
      )}
    </Pressable>
  );

  const RideCard = ({ ride, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.rideCard}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideRoute}>
          <Text style={styles.rideFrom}>{ride.from}</Text>
          <Ionicons name="arrow-forward" size={16} color="#666666" />
          <Text style={styles.rideTo}>{ride.to}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          ride.isRidedAccepted ? styles.statusCompleted : 
          ride.status === 'cancelled' ? styles.statusCancelled : styles.statusActive
        ]}>
          <Text style={styles.statusText}>
            {ride.isRidedAccepted ? 'Completed' : 
             ride.status === 'cancelled' ? 'Cancelled' : 'Active'}
          </Text>
        </View>
      </View>
      
      <View style={styles.rideDetails}>
        <View style={styles.rideInfo}>
          <Ionicons name="calendar" size={14} color="#666666" />
          <Text style={styles.rideInfoText}>
            {new Date(ride.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.rideInfo}>
          <Ionicons name="time" size={14} color="#666666" />
          <Text style={styles.rideInfoText}>
            {new Date(ride.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View style={styles.rideInfo}>
          <Ionicons name="people" size={14} color="#666666" />
          <Text style={styles.rideInfoText}>{ride.seats} seats</Text>
        </View>
        {ride.price && (
          <View style={styles.rideInfo}>
            <Ionicons name="cash" size={14} color="#666666" />
            <Text style={styles.rideInfoText}>${ride.price}</Text>
          </View>
        )}
      </View>

      <View style={styles.rideActions}>
        {!ride.isRidedAccepted && ride.status !== 'cancelled' && (
          <Pressable
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => updateRideStatus(ride.id, 'completed')}
          >
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Complete</Text>
          </Pressable>
        )}
        
        {ride.status !== 'cancelled' && (
          <Pressable
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateRideStatus(ride.id, 'cancelled')}
          >
            <Ionicons name="close-circle" size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Cancel</Text>
          </Pressable>
        )}
        
        <Pressable
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteRide(ride.id)}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </Animatable.View>
  );

  const getFilterCounts = () => {
    return {
      all: rides.length,
      active: rides.filter(ride => !ride.isRidedAccepted).length,
      completed: rides.filter(ride => ride.isRidedAccepted).length,
      cancelled: rides.filter(ride => ride.status === 'cancelled').length,
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading rides...</Text>
      </SafeAreaView>
    );
  }

  const filterCounts = getFilterCounts();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Ride Management</Text>
          <Text style={styles.headerSubtitle}>
            {filteredRides.length} rides found
          </Text>
        </View>
        <Pressable style={styles.refreshButton} onPress={loadRides}>
          <Ionicons name="refresh" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rides by route or user..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" filter="all" icon="car" count={filterCounts.all} />
        <FilterButton title="Active" filter="active" icon="time" count={filterCounts.active} />
        <FilterButton title="Completed" filter="completed" icon="checkmark-circle" count={filterCounts.completed} />
        <FilterButton title="Cancelled" filter="cancelled" icon="close-circle" count={filterCounts.cancelled} />
      </View>

      {/* Rides List */}
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
  searchContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    gap: 5,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
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
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rideRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  rideFrom: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rideTo: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  rideDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rideInfoText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  rideActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
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
