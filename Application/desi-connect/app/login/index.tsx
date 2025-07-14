import { useRouter, Stack, Redirect } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { auth } from "../../config/fbConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
export default function EduSignupScreen() {
  const { user, loading } = useAuth();

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
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        console.log("User signed in successfully");
        router.push("/home");
      })
      .catch((err) => {
        console.error("Sign in error:", err);
        if (err.code === "auth/user-not-found") {
          alert("No user found with this email. Please sign up first.");
        } else if (err.code === "auth/wrong-password") {
          alert("Incorrect password. Please try again.");
        } else {
          alert("An error occurred. Please try again later.");
        }
      });
    alert("Email accepted: " + email);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Signin", headerBackTitle: "Back" }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Sign in with your .edu email address</Text>

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
          <Text style={styles.signupText}>Sign in</Text>
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
    paddingRight: 40, // space for eye icon
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 14,
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
});
