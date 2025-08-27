import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebaseconfig';

export default function AdminSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const makeMeAdmin = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to become an admin');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      // Check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user to admin
        await setDoc(userRef, {
          ...userDoc.data(),
          role: 'admin',
          isAdmin: true,
          adminSetupAt: new Date().toISOString(),
        }, { merge: true });
      } else {
        // Create new admin user
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || 'Admin User',
          role: 'admin',
          isAdmin: true,
          createdAt: new Date().toISOString(),
          adminSetupAt: new Date().toISOString(),
        });
      }
      
      Alert.alert(
        'Success!',
        'You are now an admin. You can access the admin panel.',
        [
          {
            text: 'Go to Admin Panel',
            onPress: () => router.push('/admin')
          }
        ]
      );
    } catch (error) {
      console.error('Error setting up admin:', error);
      Alert.alert('Error', 'Failed to set up admin access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Admin Setup</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#3B82F6" />
        </View>
        
        <Text style={styles.title}>Become an Admin</Text>
        <Text style={styles.subtitle}>
          Set up admin access for your DesiConnect application
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What you'll get:</Text>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Access to admin dashboard</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>User management capabilities</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Ride monitoring and analytics</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.infoText}>Full application control</Text>
          </View>
        </View>

        <Pressable
          style={styles.adminButton}
          onPress={makeMeAdmin}
          disabled={loading}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.adminGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.adminButtonText}>
              {loading ? 'Setting up...' : 'Make Me Admin'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.warning}>
          ⚠️ This will give you full admin access to the application
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    width: '100%',
  },
  infoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginLeft: 12,
  },
  adminButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  adminGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  warning: {
    color: '#F59E0B',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
