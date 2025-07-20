import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth } from "@/config/fbConfig";


export default function HomeScreen() {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
      <View style={{ flex: 1 }}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={["#f8f4ff", "#e3dcff"]} style={styles.container}>
          {/* Header + Dropdown */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 10,
              zIndex: 100,
              position: "relative",
            }}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Desi Connect</Text>

              <Pressable
                style={styles.profileIcon}
                onPress={() => setShowDropdown((prev) => !prev)}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={36}
                  color="#4B0082"
                />
              </Pressable>
            </View>

            {showDropdown && (
              <Animatable.View
                animation="fadeIn"
                duration={200}
                style={styles.dropdown}
              >
                <Pressable
                  style={styles.dropdownItemWrapper}
                  onPress={() => {
                    setShowDropdown(false);
                    router.push("/profile");
                  }}
                >
                  <Text style={styles.dropdownItem}>👤 Profile</Text>
                </Pressable>
                <Pressable
                  style={styles.dropdownItemWrapper}
                  onPress={handleLogout}
                >
                  <Text style={styles.dropdownItem}>🚪 Logout</Text>
                </Pressable>
              </Animatable.View>
            )}
          </View>

          {/* Animated Welcome */}
          <Animatable.Text
            animation="fadeInDown"
            duration={1000}
            style={styles.welcome}
          >
            Welcome back! 🎉
          </Animatable.Text>

          {/* Dashboard Card */}
          <Animatable.View
            animation="fadeInUp"
            delay={300}
            duration={1000}
            style={styles.card}
          >
            <Text style={styles.sectionTitle}>Your Dashboard</Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push("/rides")}
            >
              <Ionicons
                name="car"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Find Rides</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push("/postrides")}
            >
              <Ionicons
                name="car"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Post Rides</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push("/myrides")}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>My Rides</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chatbubble-ellipses"
                size={22}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.buttonText}>Chat</Text>
            </Pressable>
          </Animatable.View>
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4B0082",
  },
  profileIcon: {
    padding: 4,
  },
  welcome: {
    fontSize: 18,
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
    color: "#333",
  },
  button: {
    backgroundColor: "#4B0082",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    minWidth: 140,
    zIndex: 100,
  },
  dropdownItemWrapper: {
    paddingVertical: 8,
  },
  dropdownItem: {
    fontSize: 16,
    color: "#4B0082",
  },
});
