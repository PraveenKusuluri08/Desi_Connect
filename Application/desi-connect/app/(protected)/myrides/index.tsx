import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/config/fbConfig";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function MyRidesScreen() {
  const [myRides, setMyRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.uid) {
      fetchMyRides(user.uid);
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchMyRides = async (uid: any) => {
    setLoading(true);
    try {
      const q = query(collection(db, "rides"), where("rideCreatedBy", "==", uid));
      const snapshot = await getDocs(q);
      const rides = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyRides(rides);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rideId: string) => {
    Alert.alert("Delete Ride", "Are you sure you want to delete this ride?", [
      { text: "Cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "rides", rideId));
          fetchMyRides(user?.uid);
        },
      },
    ]);
  };

  const handleMarkDone = async (rideId: string) => {
    await updateDoc(doc(db, "rides", rideId), {
      status: "done",
      isRidedAccepted: true,
    });
    fetchMyRides(user?.uid);
  };

  const handleAcceptRide = (ride: any) => {
    router.push({
      pathname: "/acceptride",
      params: {
        rideId: ride.id,
        from: ride.from,
        to: ride.to,
        date: ride.date?.toDate?.() || ride.date,
        seats: ride.seats?.toString(),
        notes: ride.notes || "",
        isRidedAccepted: ride.isRidedAccepted || false,
        rideCreatedBy: ride.rideCreatedBy,
        status: ride.status || "notdone",
      },
    });
  };

  const formatDate = (d: any) => {
    const date = d?.toDate ? d.toDate() : new Date(d);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const RideCard = ({ item }: { item: any }) => (
    <Pressable onPress={() => handleAcceptRide(item)}>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.locationText}>
              📍 {item.from} ➡️ {item.to}
            </Text>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.status === "done" ? "#28C76F" : "#FF9F43" },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === "done" ? "Done" : "Active"}
            </Text>
          </View>
        </View>

        <Text style={styles.notesText}>Notes: {item.notes || "None"}</Text>
        <Text style={styles.notesText}>Seats: {item.seats}</Text>

        <View style={styles.buttonRow}>
          <Pressable style={styles.btnEdit}>
            <Ionicons name="create-outline" size={18} color="#4B0082" />
            <Text style={styles.btnText}>Edit</Text>
          </Pressable>
          <Pressable style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={[styles.btnText, { color: "#fff" }]}>Delete</Text>
          </Pressable>
          {item.status !== "done" && (
            <Pressable style={styles.btnDone} onPress={() => handleMarkDone(item.id)}>
              <Ionicons name="checkmark-done" size={18} color="#fff" />
              <Text style={[styles.btnText, { color: "#fff" }]}>Mark Done</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧾 My Rides</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6A0DAD" style={{ marginTop: 50 }} />
      ) : myRides.length === 0 ? (
        <Text style={styles.emptyText}>You haven&apos;t posted any rides yet.</Text>
      ) : (
        <FlatList
          data={myRides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RideCard item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4B0082",
    marginBottom: 16,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateText: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  notesText: {
    fontSize: 13,
    color: "#444",
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    marginTop: 14,
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
  },
  btnEdit: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5DBF5",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  btnDelete: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E63946",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  btnDone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28C76F",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  btnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#4B0082",
  },
});
