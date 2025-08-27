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

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert(
        'Users Error',
        'Unable to load users data. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (filter) {
      case 'admin':
        filtered = filtered.filter(user => user.role === 'admin' || user.isAdmin);
        break;
      case 'banned':
        filtered = filtered.filter(user => user.isBanned);
        break;
      case 'active':
        filtered = filtered.filter(user => !user.isBanned);
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  };

  const toggleUserBan = async (userId: string, isCurrentlyBanned: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isBanned: !isCurrentlyBanned,
        bannedAt: !isCurrentlyBanned ? new Date() : null
      });

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, isBanned: !isCurrentlyBanned }
            : user
        )
      );

      Alert.alert(
        'Success',
        `User ${isCurrentlyBanned ? 'unbanned' : 'banned'} successfully!`
      );
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              
              // Update local state
              setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
              
              Alert.alert('Success', 'User deleted successfully!');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const UserCard = ({ user, index }: { user: any; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.userCard}
    >
      <View style={styles.userHeader}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color="#3B82F6" />
          {user.role === 'admin' && (
            <View style={styles.adminIndicator}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.displayName || 'No Name'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.userMeta}>
            <Text style={styles.userDate}>
              Joined: {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
            </Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.userStatus}>
          {user.isBanned ? (
            <View style={styles.bannedBadge}>
              <Text style={styles.bannedText}>BANNED</Text>
            </View>
          ) : (
            <View style={styles.activeBadge}>
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.userActions}>
        <Pressable
          style={[styles.actionButton, user.isBanned ? styles.unbanButton : styles.banButton]}
          onPress={() => toggleUserBan(user.id, user.isBanned)}
        >
          <Ionicons 
            name={user.isBanned ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.actionButtonText}>
            {user.isBanned ? 'Unban' : 'Ban'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => deleteUser(user.id, user.displayName || user.email)}
        >
          <Ionicons name="trash" size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </Pressable>
      </View>
    </Animatable.View>
  );

  const filterOptions = [
    { key: 'all', label: 'All', count: users.length },
    { key: 'active', label: 'Active', count: users.filter(u => !u.isBanned).length },
    { key: 'banned', label: 'Banned', count: users.filter(u => u.isBanned).length },
    { key: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin' || u.isAdmin).length },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <AdminHeader
        title="User Management"
        subtitle={`${filteredUsers.length} of ${users.length} users`}
        onRefresh={loadUsers}
        rightAction={{
          icon: "add",
          onPress: () => Alert.alert('Add User', 'Add user feature coming soon!'),
          color: "#10B981"
        }}
      />

      <SearchBar
        placeholder="Search users..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FilterTabs
        options={filterOptions}
        selectedFilter={filter}
        onFilterChange={setFilter}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => <UserCard user={item} index={index} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#6B7280" />
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No users found matching your search' : 'No users found'}
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
  userCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3B82F6' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    position: 'relative',
  },
  adminIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 14,
    marginBottom: 5,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userDate: {
    color: '#666666',
    fontSize: 12,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  bannedBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bannedText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  userActions: {
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
  banButton: {
    backgroundColor: '#F59E0B',
  },
  unbanButton: {
    backgroundColor: '#10B981',
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
