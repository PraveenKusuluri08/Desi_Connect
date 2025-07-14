import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  where,
  getDocs,
  query,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db as firestore } from "@/config/fbConfig";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });

  // Example rides data (replace with real data fetching)
  const [ridesGiven, setRidesGiven] = useState([
    { id: "r1", to: "New York", date: "July 10, 2025", seats: 3 },
    { id: "r2", to: "Washington DC", date: "August 5, 2025", seats: 2 },
  ]);
  const [ridesTaken, setRidesTaken] = useState([
    { id: "t1", from: "Boston", to: "Philly", date: "June 15, 2025" },
  ]);

  useEffect(() => {
    // Fetch user profile logic here...
    const fetchProfile = async () => {
      if (user && user.uid) {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data();
          setUserData(data);
          setFormData({
            name: data.name ?? "",
            phone: data.phone ?? "",
          });
        } else {
          console.warn("No user document found with uid");
          setUserData(null);
        }
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdate = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert("Missing Info", "Please fill out all fields.");
      return;
    }

    try {
      if (user && user.uid) {
        const usersRef = collection(firestore, "users");
        const q = query(usersRef, where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert("Error", "User not found in Firestore.");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        const docRef = doc(firestore, "users", userDoc.id);

        await updateDoc(docRef, {
          name: formData.name,
          phone: formData.phone,
        });

        setUserData({ ...userData, ...formData });
        setIsEditing(false);
        Alert.alert("Success", "Profile updated!");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6A0DAD" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.card}>
          <Ionicons
            name="person-circle"
            size={64}
            color="#6A0DAD"
            style={{ alignSelf: "center" }}
          />

          {!isEditing ? (
            <>
              <Text style={styles.name}>
                {userData?.name && userData.name.trim() !== ""
                  ? userData.name
                  : "Desi User"}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.phone}>
                📞{" "}
                {userData?.phone && userData.phone.trim() !== ""
                  ? userData.phone
                  : "Not provided"}
              </Text>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                value={formData.name}
                onChangeText={(val) =>
                  setFormData((p) => ({ ...p, name: val }))
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(val) =>
                  setFormData((p) => ({ ...p, phone: val }))
                }
                keyboardType="phone-pad"
              />
            </>
          )}

          <Pressable
            style={styles.actionButton}
            onPress={() => (isEditing ? handleUpdate() : setIsEditing(true))}
          >
            <Ionicons
              name={isEditing ? "save" : "create-outline"}
              size={18}
              color="#fff"
            />
            <Text style={styles.actionText}>
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.countBar}>
          <View style={[styles.countHalf, styles.givenCount]}>
            <Text style={styles.countNumber}>{ridesGiven.length}</Text>
            <Text style={styles.countLabel}>Rides Given</Text>
          </View>
          <View style={[styles.countHalf, styles.takenCount]}>
            <Text style={styles.countNumber}>{ridesTaken.length}</Text>
            <Text style={styles.countLabel}>Rides Taken</Text>
          </View>
        </View>

        {/* Rides Given Section */}
        <Text style={styles.sectionTitle}>🚗 Rides You’ve Given</Text>
        {ridesGiven.map((ride) => (
          <View key={ride.id} style={styles.rideCard}>
            <Text style={styles.rideMain}>To: {ride.to}</Text>
            <Text style={styles.rideDetail}>Date: {ride.date}</Text>
            <Text style={styles.rideDetail}>Seats: {ride.seats}</Text>
          </View>
        ))}

        {/* Rides Taken Section */}
        <Text style={styles.sectionTitle}>🧳 Rides You’ve Taken</Text>
        {ridesTaken.map((ride) => (
          <View key={ride.id} style={styles.rideCard}>
            <Text style={styles.rideMain}>
              From: {ride.from} → To: {ride.to}
            </Text>
            <Text style={styles.rideDetail}>Date: {ride.date}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#f4f4f9",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  phone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#6A0DAD",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 18,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 15,
  },
  countBar: {
    flexDirection: "row",
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  countHalf: {
    width: width / 2 - 20,
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  givenCount: {
    backgroundColor: "#a78bfa", 
  },
  takenCount: {
    backgroundColor: "#60a5fa", 
  },
  countNumber: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
  },
  countLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#4B0082",
    marginBottom: 10,
  },
  rideCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  rideMain: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  rideDetail: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
});
