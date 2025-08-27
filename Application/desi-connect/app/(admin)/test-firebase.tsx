import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
import { auth } from '../../firebaseconfig';

export default function TestFirebase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test@desiconnect.edu');
  const [password, setPassword] = useState('Test123!');

  const testFirebaseConnection = async () => {
    setLoading(true);
    try {
      // Test creating a user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      Alert.alert(
        '✅ Firebase Connection Success!',
        `User created successfully!\nEmail: ${email}\nUser ID: ${user.uid}`,
        [
          {
            text: 'Create Admin User',
            onPress: () => router.push('/admin/create-admin')
          }
        ]
      );
      
    } catch (error) {
      console.error('Firebase test error:', error);
      Alert.alert(
        '❌ Firebase Connection Failed',
        `Error: ${error.message}\n\nPlease check your Firebase configuration.`
      );
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      Alert.alert(
        '✅ Login Success!',
        `Logged in successfully!\nEmail: ${user.email}\nUser ID: ${user.uid}`
      );
      
    } catch (error) {
      console.error('Login test error:', error);
      Alert.alert(
        '❌ Login Failed',
        `Error: ${error.message}\n\nUser might not exist or credentials are wrong.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Test Firebase</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="bug" size={80} color="#F59E0B" />
        </View>
        
        <Text style={styles.title}>Test Firebase Connection</Text>
        <Text style={styles.subtitle}>
          This will test if your Firebase configuration is working correctly
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Test Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="test@desiconnect.edu"
              placeholderTextColor="#666666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Test Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Test123!"
              placeholderTextColor="#666666"
              secureTextEntry
            />
          </View>
        </View>

        <Pressable
          style={styles.testButton}
          onPress={testFirebaseConnection}
          disabled={loading}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.testGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.testButtonText}>
              {loading ? 'Testing...' : 'Test Firebase Connection'}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={testLogin}
          disabled={loading}
        >
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            style={styles.loginGradient}
          >
            <Ionicons name="log-in" size={24} color="#FFFFFF" />
            <Text style={styles.loginButtonText}>Test Login</Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.warning}>
          ⚠️ This will create a test user. You can delete it later from Firebase Console.
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
  },
  iconContainer: {
    alignItems: 'center',
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
  form: {
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  testButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  testGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  loginButtonText: {
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
