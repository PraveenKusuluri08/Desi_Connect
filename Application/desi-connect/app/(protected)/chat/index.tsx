import { db } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
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
  text: string;
  sender: string;
  senderName: string;
  receiver: string | string[];
  timestamp: any;
  type: 'text' | 'image' | 'location';
  isRead: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'individual' | 'university' | 'ride';
  participants: string[];
  lastMessage?: {
    text: string;
    sender: string;
    senderName?: string;
    senderEmail?: string;
    timestamp: any;
  };
  unreadCount: number;
  university?: string;
  rideId?: string;
}

interface User {
  uid: string;
  name: string;
  university: string;
  profilePic?: string;
  isOnline: boolean;
  lastSeen?: any;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'chats' | 'university' | 'rides'>('chats');
  const [userUniversity, setUserUniversity] = useState<string | null>(null);

  useEffect(() => {
    console.log('Chat screen mounted, user:', user?.uid);
    if (!user) return;
    
    loadChatRooms();
    loadUsers();
    setupUserPresence();
  }, [user]);

  const setupUserPresence = async () => {
    if (!user) return;
    
    // Update user's online status
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      isOnline: true,
      lastSeen: serverTimestamp()
    });
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadChatRooms = async () => {
    try {
      console.log('Loading chat rooms for user:', user?.uid);
      // Load individual chats
      const individualChatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user?.uid),
        where('type', '==', 'individual')
      );
      
      const individualSnapshot = await getDocs(individualChatsQuery);
      const individualChats = individualSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];

      // Load university group
      const userDoc = await getDoc(doc(db, 'users', user?.uid || ''));
      const userData = userDoc.data();
      const university = userData?.university;
      console.log('Current user data:', userData);
      console.log('User university:', university);
      
      // If user doesn't have university data, try to get it from email domain
      let extractedUniversity = university;
      if (!extractedUniversity && user?.email) {
        const emailDomain = user.email.split('@')[1];
        if (emailDomain) {
          // Extract university name from email domain
          const domainParts = emailDomain.split('.');
          if (domainParts.length >= 2) {
            extractedUniversity = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
            console.log('Extracted university from email:', extractedUniversity);
          }
        }
      }
      
      // Set the userUniversity state
      setUserUniversity(extractedUniversity || null);

      let universityChat: ChatRoom | null = null;
      if (extractedUniversity) {
        console.log('Looking for university group:', extractedUniversity);
        const universityChatQuery = query(
          collection(db, 'chats'),
          where('type', '==', 'university'),
          where('university', '==', extractedUniversity)
        );
        const universitySnapshot = await getDocs(universityChatQuery);
        
        if (!universitySnapshot.empty) {
          console.log('Found existing university group');
          const doc = universitySnapshot.docs[0];
          universityChat = {
            id: doc.id,
            ...doc.data()
          } as ChatRoom;
        } else {
          console.log('Creating new university group');
          // Create university group if it doesn't exist
          universityChat = await createUniversityGroup(extractedUniversity);
        }
      } else {
        console.log('No university found for user, skipping university group');
      }

      // Load ride chats
      const rideChatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', user?.uid),
        where('type', '==', 'ride')
      );
      
      const rideSnapshot = await getDocs(rideChatsQuery);
      const rideChats = rideSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatRoom[];

      const allChats = [
        ...individualChats,
        ...(universityChat ? [universityChat] : []),
        ...rideChats
      ];

      // Sort by last message timestamp
      allChats.sort((a, b) => {
        if (!a.lastMessage?.timestamp && !b.lastMessage?.timestamp) return 0;
        if (!a.lastMessage?.timestamp) return 1;
        if (!b.lastMessage?.timestamp) return -1;
        return b.lastMessage.timestamp.toDate() - a.lastMessage.timestamp.toDate();
      });

      console.log('Loaded chat rooms:', allChats.length);
      console.log('Chat types:', allChats.map(chat => ({ name: chat.name, type: chat.type, id: chat.id })));
      console.log('University chat found:', universityChat ? 'Yes' : 'No');
      if (universityChat) {
        console.log('University chat details:', {
          id: universityChat.id,
          name: universityChat.name,
          participants: universityChat.participants,
          type: universityChat.type
        });
      }
      setChatRooms(allChats);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUniversityGroup = async (university: string): Promise<ChatRoom> => {
    try {
      console.log('Creating university group for:', university);
      // Get all users from the same university
      const universityUsersQuery = query(
        collection(db, 'users'),
        where('university', '==', university)
      );
      const universityUsersSnapshot = await getDocs(universityUsersQuery);
      const universityUserIds = universityUsersSnapshot.docs.map(doc => doc.id);
      console.log('Found users for university group:', universityUserIds.length);

      const groupChatRef = doc(collection(db, 'chats'));
      const groupChat: ChatRoom = {
        id: groupChatRef.id,
        name: `${university} Students`,
        type: 'university',
        participants: universityUserIds,
        university: university,
        unreadCount: 0
      };

      await setDoc(groupChatRef, groupChat);
      console.log('University group created successfully:', groupChatRef.id);
      return groupChat;
    } catch (error) {
      console.error('Error creating university group:', error);
      throw error;
    }
  };

  const createIndividualChat = async (otherUserId: string, otherUserName: string) => {
    try {
      const chatId = [user?.uid, otherUserId].sort().join('_');
      const chatRef = doc(db, 'chats', chatId);
      
      const chatDoc = await getDoc(chatRef);
      if (chatDoc.exists()) {
        return chatDoc.id;
      }

      const newChat: ChatRoom = {
        id: chatId,
        name: otherUserName,
        type: 'individual',
        participants: [user?.uid || '', otherUserId],
        unreadCount: 0
      };

      await setDoc(chatRef, newChat);
      return chatId;
    } catch (error) {
      console.error('Error creating individual chat:', error);
      throw error;
    }
  };

  const createRideChat = async (rideId: string, rideName: string, participants: string[]) => {
    try {
      const chatRef = doc(collection(db, 'chats'));
      const rideChat: ChatRoom = {
        id: chatRef.id,
        name: rideName,
        type: 'ride',
        participants: participants,
        rideId: rideId,
        unreadCount: 0
      };

      await setDoc(chatRef, rideChat);
      return chatRef.id;
    } catch (error) {
      console.error('Error creating ride chat:', error);
      throw error;
    }
  };

  const handleChatPress = async (chatRoom: ChatRoom) => {
    try {
      router.push({
        pathname: '/chat/[chatId]',
        params: {
          chatId: chatRoom.id,
          chatName: chatRoom.name,
          chatType: chatRoom.type
        }
      });
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  const handleNewChat = () => {
    Alert.alert(
      'New Chat',
      'Choose chat type:',
      [
        {
          text: 'Individual Chat',
          onPress: () => router.push('/chat/new-individual')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const filteredChatRooms = chatRooms.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'chats') {
      return matchesSearch && chat.type === 'individual';
    } else if (activeTab === 'university') {
      return matchesSearch && chat.type === 'university';
    } else if (activeTab === 'rides') {
      return matchesSearch && chat.type === 'ride';
    }
    
    return matchesSearch;
  });

  console.log('Active tab:', activeTab);
  console.log('Total chats:', chatRooms.length);
  console.log('Filtered chats:', filteredChatRooms.length);
  console.log('Chat types in filtered:', filteredChatRooms.map(chat => ({ name: chat.name, type: chat.type })));

  const renderChatItem = ({ item, index }: { item: ChatRoom; index: number }) => {
    const isUnread = item.unreadCount > 0;
    const lastMessageTime = item.lastMessage?.timestamp?.toDate?.() || new Date();
    const timeString = lastMessageTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={styles.chatItem}
      >
        <TouchableOpacity
          style={[styles.chatItemContent, isUnread && styles.unreadChat]}
          onPress={() => handleChatPress(item)}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={item.type === 'university' ? ['#8B5CF6', '#7C3AED'] : ['#10B981', '#059669']}
              style={styles.avatar}
            >
              <Ionicons 
                name={item.type === 'university' ? 'school' : item.type === 'ride' ? 'car' : 'person'} 
                size={24} 
                color="#fff" 
              />
            </LinearGradient>
            {isUnread && <View style={styles.unreadBadge} />}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatHeader}>
              <Text style={[styles.chatName, isUnread && styles.unreadText]}>
                {item.name}
              </Text>
              <Text style={styles.chatTime}>{timeString}</Text>
            </View>
            
            <View style={styles.chatPreview}>
              <Text 
                style={[styles.lastMessage, isUnread && styles.unreadText]}
                numberOfLines={1}
              >
                {item.type === 'university' && item.lastMessage?.senderName ? 
                  `${item.lastMessage.senderName} (${item.lastMessage.senderEmail}): ${item.lastMessage.text}` : 
                  item.lastMessage?.text || 'No messages yet'}
              </Text>
              {isUnread && (
                <View style={styles.unreadCountContainer}>
                  <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderTabButton = (tab: 'chats' | 'university' | 'rides', label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? '#8B5CF6' : '#6B7280'} 
      />
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton('chats', 'All Chats', 'chatbubbles')}
        {renderTabButton('university', 'University', 'school')}
        {renderTabButton('rides', 'Ride Chats', 'car')}
      </View>

      {/* Chat List */}
      <FlatList
        data={filteredChatRooms}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Animatable.View 
            animation="fadeIn" 
            style={styles.emptyContainer}
          >
            <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptySubtitle}>
              {!userUniversity 
                ? "Set your university to join your university group and start chatting!"
                : "Start a conversation with other students or join your university group!"
              }
            </Text>
            
                        {!userUniversity ? (
              <TouchableOpacity 
                style={styles.startChatButton}
                onPress={() => {
                  router.push('/university-search');
                }}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.startChatGradient}
                >
                  <Ionicons name="school" size={20} color="#fff" />
                  <Text style={styles.startChatText}>Search & Set University</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={{ gap: 12 }}>
                <TouchableOpacity 
                  style={styles.startChatButton}
                  onPress={handleNewChat}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.startChatGradient}
                  >
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.startChatText}>Start New Chat</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.startChatButton, { backgroundColor: '#10B981' }]}
                  onPress={async () => {
                    try {
                      if (userUniversity) {
                        console.log('Manually creating university group for:', userUniversity);
                        const group = await createUniversityGroup(userUniversity);
                        console.log('University group created:', group);
                        loadChatRooms();
                      }
                    } catch (error) {
                      console.error('Error creating university group:', error);
                    }
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.startChatGradient}
                  >
                    <Ionicons name="people" size={20} color="#fff" />
                    <Text style={styles.startChatText}>Create University Group</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animatable.View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#F3F4F6',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabLabel: {
    color: '#8B5CF6',
  },
  chatList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatItem: {
    marginBottom: 8,
  },
  chatItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadChat: {
    backgroundColor: '#FEF3C7',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  unreadText: {
    fontWeight: 'bold',
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadCountContainer: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
    marginBottom: 24,
  },
  startChatButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startChatGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  startChatText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});