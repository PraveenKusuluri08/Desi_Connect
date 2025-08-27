/* eslint-disable react-hooks/rules-of-hooks */
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../config/fbConfig";

export default function EduSignupScreen() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Redirect href="/home" />;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [university, setUniversity] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get params from navigation
  const params = useLocalSearchParams();
  
  // Handle selected university from university search
  useEffect(() => {
    console.log('Params received:', params);
    console.log('All params keys:', Object.keys(params));
    if (params.selectedUniversity) {
      setUniversity(params.selectedUniversity as string);
      console.log('University selected and set:', params.selectedUniversity);
    } else {
      console.log('No selectedUniversity in params');
    }
  }, [params]);

  const validateEmail = (text: string) => {
    setEmail(text);
    if (!text.endsWith(".edu")) {
      setError("Please enter a valid .edu email address");
    } else {
      setError("");
    }
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email.endsWith(".edu")) {
      setError("Only .edu email addresses are allowed");
      return false;
    }
    if (!mobile.trim()) {
      setError("Mobile number is required");
      return false;
    }
    if (!university.trim()) {
      setError("University name is required");
      return false;
    }
    if (!address.trim()) {
      setError("Address is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Creating user with email:", email);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created successfully:", userCredential.user);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        mobile: mobile.trim(),
        university: university.trim(),
        address: address.trim(),
        createdAt: new Date(),
        isOnline: false,
        profilePic: "",
        lastUpdated: new Date(),
      });

      // Add user to university group chat
      await addUserToUniversityGroup(user.uid, university.trim());

      console.log("User data added to Firestore");
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.replace("/home") }
      ]);
    } catch (error: any) {
      console.error("Signup failed:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addUserToUniversityGroup = async (userId: string, university: string) => {
    try {
      // Check if university group exists
      const universityChatQuery = query(
        collection(db, "chats"),
        where("type", "==", "university"),
        where("university", "==", university)
      );
      const universitySnapshot = await getDocs(universityChatQuery);
      
      if (!universitySnapshot.empty) {
        // Add user to existing group
        const groupDoc = universitySnapshot.docs[0];
        const currentParticipants = groupDoc.data().participants || [];
        if (!currentParticipants.includes(userId)) {
          await updateDoc(doc(db, "chats", groupDoc.id), {
            participants: [...currentParticipants, userId]
          });
        }
      } else {
        // Create new university group
        const groupChatRef = doc(collection(db, "chats"));
        const groupChat = {
          id: groupChatRef.id,
          name: `${university} Students`,
          type: "university",
          participants: [userId],
          university: university,
          unreadCount: 0,
          createdAt: new Date(),
        };
        await setDoc(groupChatRef, groupChat);
      }
    } catch (error) {
      console.error("Error adding user to university group:", error);
    }
  };

  const isFormValid = name.trim() && 
                     email.endsWith(".edu") && 
                     mobile.trim() && 
                     university.trim() && 
                     address.trim() && 
                     password.length >= 6 && 
                     password === confirmPassword;

  return (
    <>
      <Stack.Screen options={{ title: "Sign Up", headerBackTitle: "Back" }} />
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.headerGradient}
          >
            <Ionicons name="person-add" size={48} color="#fff" />
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join DesiConnect community</Text>
          </LinearGradient>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your full name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your .edu email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={validateEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Mobile Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your mobile number"
                placeholderTextColor="#999"
                value={mobile}
                onChangeText={setMobile}
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* University Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>University Name *</Text>
            <TouchableOpacity
              style={[styles.universitySearchButton, university && styles.universitySelected]}
              onPress={() => router.push({
                pathname: '/university-search',
                params: { fromSignup: 'true' }
              })}
            >
              <Ionicons 
                name={university ? "checkmark-circle" : "school-outline"} 
                size={20} 
                color={university ? "#10B981" : "#8B5CF6"} 
                style={styles.inputIcon} 
              />
              <Text style={[styles.input, { color: university ? '#1F2937' : '#999' }]}>
                {university || "Search and select your university"}
                {university && ` (${university})`}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Address *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm your password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={20}
                  color="#666"
                />
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <Pressable
            style={[
              styles.signupButton,
              !isFormValid && styles.signupButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid || isLoading}
          >
            <LinearGradient
              colors={isFormValid ? ['#8B5CF6', '#7C3AED'] : ['#E5E7EB', '#D1D5DB']}
              style={styles.signupButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.signupText}>Create Account</Text>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 20,
  },
  headerGradient: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  universitySearchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  universitySelected: {
    borderColor: "#10B981",
    backgroundColor: "#F0FDF4",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "500",
  },
  signupButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  signupButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  signupText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8B5CF6",
  },
});
