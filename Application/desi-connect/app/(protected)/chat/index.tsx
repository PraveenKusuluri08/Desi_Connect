import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { db } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";

interface Message {
  text: string;
  sender: string;
  receiver: string | string[];
  timestamp: string;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { chatUserId, chatUserName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const flatListRef = useRef(null);

  const chatId = [user?.uid, chatUserId].sort().join("_");

  useEffect(() => {
    const fetchMessages = async () => {
      const q = query(
        collection(db, `chats/${chatId}/messages`),
        orderBy("timestamp", "asc")
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map((doc) => doc.data() as Message);
      setMessages(msgs);
    };

    fetchMessages();
  }, [chatId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;

    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text: newMsg,
      sender: user?.uid,
      receiver: chatUserId,
      timestamp: new Date().toISOString(),
    });

    setNewMsg("");
    // Optionally re-fetch or append message
    setMessages((prev) => [
      ...prev,
      {
        text: newMsg,
        sender: user.uid,
        receiver: chatUserId,
        timestamp: new Date().toISOString(),
      },
    ]);

    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
      keyboardVerticalOffset={80}
    >
      <Text style={styles.header}>Chat with {chatUserName || chatUserId}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.chatBubble,
              item.sender === user?.uid
                ? styles.myBubble
                : styles.theirBubble,
            ]}
          >
            <Text style={styles.chatText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMsg}
          onChangeText={setNewMsg}
        />
        <Pressable onPress={sendMessage} style={styles.sendBtn}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 12,
    backgroundColor: "#6A0DAD",
    color: "#fff",
  },
  chatBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
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
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#6A0DAD",
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
});