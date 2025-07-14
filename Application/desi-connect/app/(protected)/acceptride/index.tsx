import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "@/config/fbConfig";
import { Ionicons } from "@expo/vector-icons";

export default function AcceptRideScreen() {
  const { rideId } = useLocalSearchParams();
  const [ride, setRide] = useState<any>(null);
  const [acceptedUsers, setAcceptedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    if (rideId) {
      fetchRideDetails();
      fetchAcceptedUsers();
    }
  }, [rideId]);

  useEffect(() => {
    if (selectedUser) {
      fetchChatMessages();
    }
  }, [selectedUser]);

  const fetchRideDetails = async () => {
    const docRef = doc(db, "rides", rideId as string);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) setRide({ id: snapshot.id, ...snapshot.data() });
  };

  const fetchAcceptedUsers = async () => {
    const q = query(
      collection(db, "ride_acceptances"),
      where("rideId", "==", rideId)
    );
    const snapshot = await getDocs(q);
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAcceptedUsers(users);
  };

  const fetchChatMessages = async () => {
    const chatId = getChatId(auth.currentUser?.uid!, selectedUser.uid);
    const q = collection(db, `ride_chats/${chatId}/messages`);
    const snapshot = await getDocs(q);
    const msgs = snapshot.docs.map((doc) => doc.data());
    setMessages(msgs);
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const chatId = getChatId(auth.currentUser?.uid!, selectedUser.uid);
    await addDoc(collection(db, `ride_chats/${chatId}/messages`), {
      text: newMsg,
      sender: auth.currentUser?.uid,
      timestamp: new Date().toISOString(),
    });
    setNewMsg("");
    fetchChatMessages();
  };

  const handleAcceptRide = async () => {
    await addDoc(collection(db, "ride_acceptances"), {
      rideId,
      uid: auth.currentUser?.uid,
      name: auth.currentUser?.displayName || "Anonymous",
    });
    fetchAcceptedUsers();
  };

  const getChatId = (uid1: string, uid2: string) => {
    return [uid1, uid2].sort().join("_");
  };

  const formatDate = (d: any) => {
    const date = d?.toDate ? d.toDate() : new Date(d);
    return date.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Pressable style={styles.acceptButton} onPress={handleAcceptRide}>
        <Ionicons name="checkmark-circle" size={20} color="#fff" />
        <Text style={styles.acceptButtonText}>Accept Ride</Text>
      </Pressable>

      {/* Ride Info */}
      {ride && (
        <View style={styles.rideBox}>
          <Text style={styles.heading}>🚘 Ride Details</Text>
          <Text style={styles.subText}>
            {ride.from} ➡️ {ride.to}
          </Text>
          <Text style={styles.subText}>Date: {formatDate(ride.date)}</Text>
          <Text style={styles.subText}>Seats: total {ride.seats} members</Text>
          <Text style={styles.subText}>Notes: {ride.notes || "None"}</Text>
        </View>
      )}

      {/* Accepted Users List */}
      <Text style={styles.heading}>Accepted Users</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.userScroll}
      >
        {acceptedUsers.map((user, index) => (
          <Pressable
            key={index}
            onPress={() => setSelectedUser(user)}
            style={[
              styles.userBubble,
              selectedUser?.uid === user.uid && styles.selectedBubble,
            ]}
          >
            <Ionicons name="person-circle-outline" size={40} color="#6A0DAD" />
            <Text style={styles.userText}>{user.name || "User"}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Chat Section */}
      {selectedUser && (
        <View style={styles.chatBox}>
          <Text style={styles.chatHeading}>
            Chat with {selectedUser.name || "User"}
          </Text>
          <FlatList
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.chatBubble,
                  item.sender === auth.currentUser?.uid
                    ? styles.myBubble
                    : styles.theirBubble,
                ]}
              >
                <Text style={styles.chatText}>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
          />

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              value={newMsg}
              onChangeText={setNewMsg}
            />
            <Pressable style={styles.sendBtn} onPress={sendMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fefefe",
    padding: 16,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4B0082",
    padding: 10,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  acceptButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
  },
  rideBox: {
    backgroundColor: "#f4edff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B0082",
    marginBottom: 10,
  },
  subText: {
    fontSize: 15,
    color: "#444",
    marginBottom: 4,
  },
  userScroll: {
    marginBottom: 10,
  },
  userBubble: {
    alignItems: "center",
    marginRight: 14,
  },
  selectedBubble: {
    borderBottomWidth: 2,
    borderBottomColor: "#6A0DAD",
  },
  userText: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  chatBox: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  chatHeading: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#6A0DAD",
  },
  chatBubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#d6bbff",
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f0f0",
  },
  chatText: {
    fontSize: 15,
    color: "#000",
  },
  inputRow: {
    position: "absolute",
    bottom: 10,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#6A0DAD",
    padding: 12,
    borderRadius: 25,
  },
});
