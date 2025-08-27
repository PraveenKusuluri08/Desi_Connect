import UserProfileModal from "@/components/UserProfileModal";
import { db } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";

interface Message {
  id: string;
  chatId: string;
  text: string;
  sender: string;
  senderName: string;
  senderEmail: string;
  timestamp: any;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'university' | 'ride';
  participants: string[];
  university?: string;
  rideId?: string;
}

export default function IndividualChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { chatId, chatName, chatType } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<{[key: string]: any}>({});
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!chatId || !user) return;
    
    console.log('Chat screen mounted with user:', user.uid);
    console.log('User email:', user.email);
    console.log('User displayName:', user.displayName);
    
    loadChatRoom();
    setupMessageListener();
    loadUsers();
  }, [chatId, user]);

  const loadUsers = async () => {
    try {
      console.log('Loading users...');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: {[key: string]: any} = {};
      usersSnapshot.docs.forEach(doc => {
        usersData[doc.id] = doc.data();
        console.log(`User ${doc.id}:`, doc.data());
      });
      setUsers(usersData);
      console.log('Loaded users:', Object.keys(usersData).length);
      console.log('Users data:', usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      // Set empty users object as fallback
      setUsers({});
    }
  };

  const showUserProfile = async (senderEmail: string) => {
    try {
      console.log('Showing profile for email:', senderEmail);
      
      if (!senderEmail || senderEmail === '') {
        Alert.alert('No Email', 'User email not available');
        return;
      }
      
      // Find user by email
      const userQuery = query(
        collection(db, 'users'),
        where('email', '==', senderEmail)
      );
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        console.log('Found user data:', userData);
        setSelectedUser(userData);
        setShowProfileModal(true);
      } else {
        console.log('No user found for email:', senderEmail);
        Alert.alert('User Not Found', 'Could not find user profile');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Could not load user profile');
    }
  };

  const loadChatRoom = async () => {
    try {
      const chatDoc = await getDoc(doc(db, 'chats', chatId as string));
      if (chatDoc.exists()) {
        setChatRoom({
          id: chatDoc.id,
          ...chatDoc.data()
        } as ChatRoom);
      }
    } catch (error) {
      console.error('Error loading chat room:', error);
    }
  };

  const setupMessageListener = () => {
    // Temporarily use the old structure until Firestore index is created
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        chatId: chatId as string, // Add chatId for compatibility
        ...doc.data()
      })) as Message[];
      
      console.log('Messages loaded:', newMessages.length);
      newMessages.forEach((msg, index) => {
        console.log(`Message ${index}:`, {
          id: msg.id,
          sender: msg.sender,
          senderName: msg.senderName,
          senderEmail: msg.senderEmail,
          text: msg.text
        });
      });
      
      setMessages(newMessages);
      setLoading(false);
      
      // Mark messages as read
      markMessagesAsRead(newMessages);
      
      // Scroll to bottom for new messages
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsubscribe;
  };

  const markMessagesAsRead = async (messages: Message[]) => {
    try {
      const unreadMessages = messages.filter(
        msg => msg.sender !== user?.uid && !msg.isRead
      );

      for (const message of unreadMessages) {
        await updateDoc(doc(db, `chats/${chatId}/messages/${message.id}`), {
          isRead: true
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !chatId) return;

    setSending(true);
    try {
      // Get current user's data from users state or fetch it
      const currentUser = users[user.uid];
      console.log('Current user data:', currentUser);
      console.log('Firebase user:', user);
      
      const senderName = currentUser?.name || user.displayName || user.email || 'You';
      const senderEmail = user.email || '';
      
      console.log('Sender name:', senderName, 'Sender email:', senderEmail);

      const messageData = {
        text: newMessage.trim(),
        sender: user.uid,
        senderName: senderName,
        senderEmail: senderEmail,
        timestamp: serverTimestamp(),
        type: 'text' as const,
        isRead: false
      };

      console.log('Sending message data:', messageData);
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);

      // Update chat room's last message
      await updateDoc(doc(db, 'chats', chatId as string), {
        lastMessage: {
          text: newMessage.trim(),
          sender: user.uid,
          senderName: senderName,
          senderEmail: senderEmail,
          timestamp: serverTimestamp()
        }
      });

      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.sender === user?.uid;
    const showDate = index === 0 || 
      formatDate(item.timestamp) !== formatDate(messages[index - 1]?.timestamp);
    
    // Get sender's name from users data or use the stored senderName
    const senderData = users[item.sender];
    console.log('Sender data for', item.sender, ':', senderData);
    console.log('Message senderEmail:', item.senderEmail);
    console.log('Chat type:', chatType);
    
    const displayName = senderData?.name || item.senderName || (isMyMessage ? 'You' : 'User');
    const displayEmail = item.senderEmail || senderData?.email || '';
    
    // If this is the current user's message and we don't have email, use current user's email
    const finalDisplayEmail = displayEmail || (isMyMessage ? user?.email : '');
    
    console.log('Display name:', displayName, 'Display email:', finalDisplayEmail);
    console.log('Should show sender info:', chatType === 'university');

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={100}
        style={styles.messageContainer}
      >
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessage : styles.theirMessage
        ]}>
          {/* Show sender name and email for group chats */}
          {chatType === 'university' && (
            <View style={styles.senderInfo}>
              <Text style={styles.senderName}>{displayName}</Text>
              {finalDisplayEmail && (
                <TouchableOpacity onPress={() => showUserProfile(finalDisplayEmail)}>
                  <Text style={styles.senderEmail}>{finalDisplayEmail}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.theirMessageText
          ]}>
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime
            ]}>
              {formatTime(item.timestamp)}
            </Text>
            
            {isMyMessage && (
              <Ionicons 
                name={item.isRead ? "checkmark-done" : "checkmark"} 
                size={16} 
                color={item.isRead ? "#8B5CF6" : "#9CA3AF"} 
                style={styles.readIndicator}
              />
            )}
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#8B5CF6', '#7C3AED']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={chatType === 'university' ? ['#8B5CF6', '#7C3AED'] : ['#10B981', '#059669']}
              style={styles.avatar}
            >
              <Ionicons 
                name={chatType === 'university' ? 'school' : chatType === 'ride' ? 'car' : 'person'} 
                size={24} 
                color="#fff" 
              />
            </LinearGradient>
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.chatName}>{chatName}</Text>
            <Text style={styles.chatStatus}>
              {chatType === 'university' ? 'University Group' : 
               chatType === 'ride' ? 'Ride Chat' : 'Individual Chat'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading chat...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      <Stack.Screen options={{ headerShown: false }} />

      {renderHeader()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => 
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          ListEmptyComponent={
            <Animatable.View 
              animation="fadeIn" 
              style={styles.emptyContainer}
            >
              <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Start the conversation by sending a message!
              </Text>
            </Animatable.View>
          }
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={1000}
              placeholderTextColor="#9CA3AF"
            />
            
            <TouchableOpacity 
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending) && styles.sendButtonDisabled
              ]}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* User Profile Modal */}
      <UserProfileModal
        visible={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        userData={selectedUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  chatStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 2,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#8B5CF6',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#1F2937',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  senderEmail: {
    fontSize: 10,
    color: '#FFFFFF',
    marginBottom: 3,
    fontWeight: '400',
  },
  senderInfo: {
    marginBottom: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: '#8B5CF6',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.8)',
  },
  theirMessageTime: {
    color: '#9CA3AF',
  },
  readIndicator: {
    marginLeft: 2,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 