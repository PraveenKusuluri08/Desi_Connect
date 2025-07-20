import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter } from "expo-router";
import {db} from "../../../config/fbConfig"
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
export default function PostRideScreen() {
  const router = useRouter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [seats, setSeats] = useState("");
  const [notes, setNotes] = useState("");

  const {user} = useAuth()
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handlePostRide = async () => {
  if (!from || !to || !seats) {
    alert("Please fill all required fields.");
    return;
  }

  try {
    const rideRef = doc(collection(db, "rides")); 
    const rideData = {
      id: rideRef.id,
      from,
      to,
      date: date.toISOString(),
      seats,
      notes,
      isRidedAccepted: false,
      rideCreatedBy: user?.uid,
    };

    await setDoc(rideRef, rideData);

    alert("🚗 Ride posted successfully!");
    router.push("/home");
  } catch (error) {
    console.error("Error posting ride:", error);
    alert("Failed to post ride. Please try again.");
  }
};

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Need a Ride</Text>
        <TextInput
          placeholder="From (Pickup)"
          style={styles.input}
          value={from}
          onChangeText={setFrom}
          placeholderTextColor="#999"
        />
        <TextInput
          placeholder="To (Destination)"
          style={styles.input}
          value={to}
          onChangeText={setTo}
          placeholderTextColor="#999"
        />

        <Pressable style={styles.dateInput} onPress={() => setShowPicker(true)}>
          <Ionicons name="calendar" size={20} color="#4B0082" />
          <Text style={styles.dateText}>
            {date.toLocaleDateString()} at{" "}
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}

        <TextInput
          placeholder="How many members coming with the ride (e.g. 3)"
          keyboardType="numeric"
          style={styles.input}
          value={seats}
          onChangeText={setSeats}
          placeholderTextColor="#999"
        />

        <TextInput
          placeholder="Notes (Optional)"
          style={[styles.input, { height: 80 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor="#999"
        />

        <Pressable style={styles.postButton} onPress={handlePostRide}>
          <Text style={styles.postButtonText}>Post Ride</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 60,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4B0082",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#f0ecff",
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  postButton: {
    backgroundColor: "#4B0082",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  postButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
