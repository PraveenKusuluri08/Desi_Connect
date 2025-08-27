import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { auth, db } from '../config/firebase';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@desiconnect.edu');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Create admin user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Set admin role in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: 'Admin User',
          role: 'admin',
          isAdmin: true,
          createdAt: new Date(),
        });

        Alert.alert('Success', 'Admin user created successfully!');
      } else {
        // Sign in existing admin
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Navigate to admin dashboard
      router.replace('/');
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <LinearGradient
        colors={['#000000', '#1a1a1a', '#000000']}
        style={styles.gradient}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="shield-checkmark" size={60} color="#3B82F6" />
            <Text style={styles.logoText}>DesiConnect</Text>
            <Text style={styles.logoSubtext}>Admin Panel</Text>
          </View>
        </Animatable.View>

        {/* Login Form */}
        <Animatable.View animation="fadeInUp" delay={300} style={styles.formContainer}>
          <Text style={styles.title}>
            {isSignUp ? 'Create Admin Account' : 'Admin Login'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignUp 
              ? 'Set up your admin account to manage DesiConnect'
              : 'Sign in to access admin controls'
            }
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Admin Email"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <Pressable
            style={[styles.authButton, loading && styles.authButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#666666', '#555555'] : ['#3B82F6', '#2563EB']}
              style={styles.authGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={isSignUp ? "person-add" : "log-in"}
                  size={20}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.authButtonText}>
                {loading ? 'Processing...' : (isSignUp ? 'Create Admin' : 'Sign In')}
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp 
                ? 'Already have an admin account? Sign In'
                : 'Need to create admin account? Sign Up'
              }
            </Text>
          </Pressable>
        </Animatable.View>

        {/* Footer */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Secure Admin Access Only
          </Text>
          <Text style={styles.footerSubtext}>
            This panel is restricted to authorized administrators
          </Text>
        </Animatable.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 15,
  },
  logoSubtext: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
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
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 18,
    paddingRight: 15,
  },
  authButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  authButtonDisabled: {
    opacity: 0.7,
  },
  authGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  switchText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 30,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  footerSubtext: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
});
