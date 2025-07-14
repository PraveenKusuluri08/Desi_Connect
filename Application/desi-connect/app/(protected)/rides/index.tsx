import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState, useEffect } from "react";
import { useRides } from "@/context/RidesContext";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";
export default function FindRideScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filteredRides, setFilteredRides] = useState<any[]>([]);

  const {
    state: { rides, loading },
  } = useRides();

  useEffect(() => {
    if (rides && rides.length > 0) {
      setFilteredRides(rides);
    }
  }, [rides]);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleSearch = () => {
    const results = rides.filter(
      (ride: any) =>
        ride.from?.toLowerCase().includes(pickup.toLowerCase()) &&
        ride.to?.toLowerCase().includes(drop.toLowerCase())
    );
    setFilteredRides(results.length > 0 ? results : rides);
  };

  const formatRideDate = (dateValue: any) => {
    let jsDate;

    // Check if it's a Firestore Timestamp (has toDate method)
    if (dateValue?.toDate) {
      jsDate = dateValue.toDate();
    } else {
      jsDate = new Date(dateValue);
    }

    return jsDate.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading rides...</Text>
      </View>
    );
  }
  const handleAcceptRide = (ride: any) => {
    router.push({
      pathname: "/acceptride",
      params: {
        rideId: ride.id,
        from: ride.from,
        to: ride.to,
        date: ride.date,
        seats: ride.seats,
        notes: ride.notes || "",
      },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.title}>Find a Ride</Text>

          <TextInput
            placeholder="Pickup Location"
            value={pickup}
            onChangeText={setPickup}
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Drop-off Location"
            value={drop}
            onChangeText={setDrop}
            style={styles.input}
            placeholderTextColor="#999"
          />

          <Pressable
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#4B0082" />
            <Text style={styles.dateText}>
              {date.toLocaleDateString()} at{" "}
              {date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          <Pressable style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchText}>🔍 Search Rides</Text>
          </Pressable>
        </View>

        {/* Ride List */}
        <Text style={styles.sectionTitle}>🚗 Available Rides</Text>
        <FlatList
          data={filteredRides}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.rideList}
          ListEmptyComponent={
            <Text style={{ padding: 20, color: "#999" }}>
              No rides found. Try different filters.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.rideCard}>
              <Text style={styles.cardText}>
                {item.from} ➡️ {item.to}
              </Text>
              <Text style={styles.cardSubText}>
                Date: {formatRideDate(item.date)}
              </Text>
              <Text style={styles.cardSubText}>Seats: {item.seats}</Text>

              <Pressable
                style={[
                  styles.acceptButton,
                  (user?.uid === item.rideCreatedBy ||
                    item.isRidedAccepted) && {
                    opacity: 0.5,
                  },
                ]}
                disabled={
                  user?.uid === item.rideCreatedBy || item.isRidedAccepted
                }
                onPress={() => handleAcceptRide(item)}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.acceptButtonText}>Accept Ride</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  filterSection: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#f6f3ff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    color: "#4B0082",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#f0f0ff",
    marginBottom: 16,
  },
  dateText: {
    marginLeft: 10,
    color: "#333",
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: "#4B0082",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  searchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  rideList: {
    padding: 20,
  },
  rideCard: {
    backgroundColor: "#f0ecff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  cardSubText: {
    fontSize: 14,
    color: "#555",
  },
  acceptButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A0DAD",
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
