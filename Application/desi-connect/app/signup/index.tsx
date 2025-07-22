/* eslint-disable react-hooks/rules-of-hooks */
import { useRouter, Stack, Redirect } from "expo-router";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {auth,db} from "../../config/fbConfig"
import {createUserWithEmailAndPassword} from "firebase/auth"
import {doc, addDoc,collection} from "firebase/firestore"
import { useAuth } from "@/context/AuthContext";
export default function EduSignupScreen() {

  const {user,loading} = useAuth()

  if (loading) return null; 
  if (user) return <Redirect href="/home" />;
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (text: string) => {
    setEmail(text);
    if (!text.endsWith(".edu")) {
      setError("Please enter a valid .edu email address");
    } else {
      setError("");
    }
  };

  const handleSubmit = () => {
  if (!email.endsWith(".edu")) {
    setError("Only .edu email addresses are allowed");
    return;
  }

  console.log("Creating user with email:", email);

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User created successfully:", userCredential.user);
      const user = userCredential.user;

      return addDoc(collection(db, "users"), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        isOnline: false,
        profilePic: "",
      });
    })
    .then(() => {
      console.log("User added to Firestore");
      alert("Email accepted: " + email);
      router.replace("/home");
    })
    .catch((error) => {
      console.error("Signup failed:", error.message);
      setError(error.message);
    });
};


  return (
    <>
      <Stack.Screen options={{ title: "Signup", headerBackTitle: "Back" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Sign up with your .edu email address</Text>

        <TextInput
          placeholder="Enter your .edu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={validateEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordWrapper}>
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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[
            styles.signupButton,
            { backgroundColor: error || !email ? "#ccc" : "#4B0082" },
          ]}
          onPress={handleSubmit}
          disabled={!!error || !email}
        >
          <Text style={styles.signupText}>Sign Up</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    color: "#111",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  errorText: {
    color: "red",
    marginBottom: 12,
  },
  signupButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  signupText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  passwordWrapper: {
    position: "relative",
  },
    eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
  },
});
