// AcceptRideScreen.tsx
import { db } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Stack, useLocalSearchParams } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    Button,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    listenToMessages,
    sendChatMessage,
} from "../../../components/utils/chatService";

export default function AcceptRideScreen() {
  const { user } = useAuth();
  const { rideId, from, to, date, seats, notes, rideCreatedBy, status } =
    useLocalSearchParams();

  const [ride, setRide] = useState<any>(null);
  const [acceptedUsers, setAcceptedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [isRideOwner, setIsRideOwner] = useState(false);
  const [hasAcceptedRide, setHasAcceptedRide] = useState(false);

  useEffect(() => {
    fetchRideDetails();
    fetchAcceptedUsers();
    checkIfAccepted();
  }, [rideId]);

  useEffect(() => {
    if (ride?.rideCreatedBy && user?.uid) {
      const isOwner = ride.rideCreatedBy === user.uid;
      setIsRideOwner(isOwner);

      if (!isOwner) {
        setSelectedUser({ uid: ride.rideCreatedBy, name: "Ride Owner" });
      }
    }
  }, [ride, user]);

  useEffect(() => {
    if (!rideId || !user?.uid || !selectedUser?.uid) return;

    const senderId = user.uid;
    const receiverId = selectedUser.uid;

    const unsub = listenToMessages(rideId, senderId, receiverId, setMessages);
    return () => unsub?.();
  }, [selectedUser]);

  const fetchRideDetails = async () => {
    const docRef = doc(db, "rides", rideId as string);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      setRide({ id: snapshot.id, ...snapshot.data() });
    }
  };

  const fetchAcceptedUsers = async () => {
    const q = query(
      collection(db, "ride_acceptances"),
      where("rideId", "==", rideId)
    );
    const snapshot = await getDocs(q);

    const users = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const { email, uid } = docSnap.data();
        const userSnapshot = await getDocs(
          query(collection(db, "users"), where("email", "==", email))
        );

        const data = userSnapshot.docs[0]?.data();
        return {
          name: data?.name || "Desi User",
          phone: data?.phone || "Not Provided",
          uid,
          email,
        };
      })
    );

    setAcceptedUsers(users);
  };

  const checkIfAccepted = async () => {
    const q = query(
      collection(db, "ride_acceptances"),
      where("rideId", "==", rideId),
      where("email", "==", user?.email)
    );
    const snapshot = await getDocs(q);
    setHasAcceptedRide(!snapshot.empty);
  };

  const createRideChat = async (rideId: string, rideName: string, participants: string[]) => {
    try {
      // Check if ride chat already exists
      const rideChatQuery = query(
        collection(db, "chats"),
        where("type", "==", "ride"),
        where("rideId", "==", rideId)
      );
      const rideChatSnapshot = await getDocs(rideChatQuery);
      
      if (!rideChatSnapshot.empty) {
        // Add user to existing ride chat
        const chatDoc = rideChatSnapshot.docs[0];
        const currentParticipants = chatDoc.data().participants || [];
        if (!currentParticipants.includes(user?.uid)) {
          await updateDoc(doc(db, "chats", chatDoc.id), {
            participants: [...currentParticipants, user?.uid]
          });
        }
        return chatDoc.id;
      } else {
        // Create new ride chat
        const chatRef = doc(collection(db, "chats"));
        const rideChat = {
          id: chatRef.id,
          name: rideName,
          type: "ride",
          participants: participants,
          rideId: rideId,
          unreadCount: 0,
          createdAt: new Date(),
        };
        await setDoc(chatRef, rideChat);
        return chatRef.id;
      }
    } catch (error) {
      console.error("Error creating ride chat:", error);
      throw error;
    }
  };

  const handleAcceptRide = async () => {
    if (!user?.email) return;

    try {
      await addDoc(collection(db, "ride_acceptances"), {
        rideId,
        email: user.email,
        uid: user.uid,
        timestamp: new Date(),
      });

      // Create or join ride chat
      const rideName = `${from} → ${to}`;
      const participants = [rideCreatedBy, user?.uid].filter(Boolean);
      await createRideChat(rideId as string, rideName, participants);

      setHasAcceptedRide(true);
      setSelectedUser({ uid: rideCreatedBy, name: "Ride Owner" });
      fetchAcceptedUsers();
      
      Alert.alert("Success", "Ride accepted successfully! You can now chat with the ride owner.");
    } catch (error) {
      console.error("Error accepting ride:", error);
      Alert.alert("Error", "Failed to accept ride. Please try again.");
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim() || !user?.uid || !selectedUser?.uid) return;

    await sendChatMessage(rideId, user.uid, selectedUser.uid, newMsg);
    setNewMsg("");
  };

  const formatDate = (d: any) => {
    const dateObj = d?.toDate ? d.toDate() : new Date(d);
    return dateObj.toLocaleString();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {ride && (
        <View style={styles.rideBox}>
          <Text style={styles.heading}>🚘 Ride Details</Text>
          <Text>
            {ride.from} ➞ {ride.to}
          </Text>
          <Text>Date: {formatDate(ride.date)}</Text>
          <Text>Seats: {ride.seats}</Text>
          <Text>Notes: {ride.notes || "None"}</Text>
        </View>
      )}

      {!isRideOwner && !hasAcceptedRide && (
        <View style={{ margin: 16 }}>
          <Button title="Accept Ride" onPress={handleAcceptRide} />
        </View>
      )}

      {isRideOwner && (
        <ScrollView horizontal style={styles.userScroll}>
          {acceptedUsers.map((u, idx) => (
            <Pressable
              key={idx}
              onPress={() => setSelectedUser(u)}
              style={[
                styles.userBubble,
                selectedUser?.uid === u.uid && styles.selectedBubble,
              ]}
            >
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#6A0DAD"
              />
              <Text>{u.name}</Text>
              <Text
                style={{ color: "#007AFF" }}
                onPress={() => Linking.openURL(`tel:${u.phone}`)}
              >
                📞 {u.phone}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {selectedUser && (
        <View style={styles.chatContainer}>
          {!isRideOwner && (
            <View style={styles.chatHeader}>
              <Ionicons
                name="person-circle-outline"
                size={32}
                color="#6A0DAD"
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                  {selectedUser.name}
                </Text>
                <Text
                  style={{ color: "#007AFF" }}
                  onPress={() => Linking.openURL(`tel:${selectedUser.phone}`)}
                >
                  📞 {selectedUser.phone}
                </Text>
              </View>
            </View>
          )}

          <FlatList
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => {
              const isCurrentUser = item.sender === user?.uid;
              return (
                <View
                  style={[
                    styles.chatBubbleBase,
                    isCurrentUser ? styles.myBubble : styles.theirBubble,
                  ]}
                >
                  <Text style={styles.chatText}>{item.text}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(
                      item.createdAt?.seconds * 1000
                    ).toLocaleTimeString()}
                  </Text>
                </View>
              );
            }}
            contentContainerStyle={{ padding: 12, paddingBottom: 80 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", color: "#999", marginTop: 20 }}
              >
                No messages yet. Start the conversation!
              </Text>
            }
          />

          <View style={styles.messageInputContainer}>
            <View style={styles.messageBox}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={newMsg}
                onChangeText={setNewMsg}
                multiline
              />
              <Pressable onPress={handleSendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={22} color="#fff" />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heading: { fontSize: 18, fontWeight: "600", marginBottom: 8 },
  rideBox: {
    backgroundColor: "#f0f0ff",
    padding: 16,
    borderRadius: 12,
    margin: 16,
  },
  userScroll: { paddingHorizontal: 16, marginBottom: 10 },
  userBubble: { alignItems: "center", marginRight: 14 },
  selectedBubble: { borderBottomWidth: 2, borderBottomColor: "#6A0DAD" },
  chatBox: { flex: 1, backgroundColor: "#fff" },
  // chatBubbleBase: {
  //   padding: 10,
  //   borderRadius: 10,
  //   marginVertical: 4,
  //   maxWidth: "70%",
  // },
  // myBubble: { alignSelf: "flex-end", backgroundColor: "#d6bbff" },
  // theirBubble: { alignSelf: "flex-start", backgroundColor: "#f1f0f0" },
  chatText: { fontSize: 15 },
  timestamp: { fontSize: 10, textAlign: "right", color: "#888", marginTop: 4 },
  inputRow: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 25,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#f8f8ff",
  },
  chatBubbleBase: {
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
    maxWidth: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#e5d4ff",
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
  },
  sendButton: {
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  messageInputContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e2e2",
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    paddingLeft:10
  },

  messageBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingRight: 10,
    justifyContent: "center",
    alignItems: "center",
    
  },
});
