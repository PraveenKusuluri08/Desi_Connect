import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    Alert,
    Linking,
    Modal,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    mobile: string;
    university: string;
    address: string;
  } | null;
}

export default function UserProfileModal({ visible, onClose, userData }: UserProfileModalProps) {
  const handleCall = () => {
    if (userData?.mobile) {
      Linking.openURL(`tel:${userData.mobile}`).catch(() => {
        Alert.alert('Error', 'Could not open phone app');
      });
    }
  };

  const handleEmail = () => {
    if (userData?.email) {
      Linking.openURL(`mailto:${userData.email}`).catch(() => {
        Alert.alert('Error', 'Could not open email app');
      });
    }
  };

  const handleMessage = () => {
    onClose();
    // This will be handled by the parent component
  };

  if (!userData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animatable.View 
          animation="slideInUp" 
          duration={300}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.content}>
            {/* Header */}
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.header}
            >
              <View style={styles.headerContent}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
              </View>
            </LinearGradient>

            {/* Profile Content */}
            <View style={styles.profileContent}>
              {/* Avatar */}
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {userData.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>

              {/* Name */}
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.actionText}>Call</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleEmail}>
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="mail" size={20} color="#fff" />
                    <Text style={styles.actionText}>Email</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} onPress={handleMessage}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.actionGradient}
                  >
                    <Ionicons name="chatbubble" size={20} color="#fff" />
                    <Text style={styles.actionText}>Message</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* User Details */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={20} color="#8B5CF6" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>University</Text>
                    <Text style={styles.detailValue}>{userData.university}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="call" size={20} color="#8B5CF6" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{userData.mobile}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="location" size={20} color="#8B5CF6" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{userData.address}</Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Animatable.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContent: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
}); 