import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../context/AuthContext';

export default function AdminSettings() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    autoApprove: false,
    maintenanceMode: false,
    debugMode: false,
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of admin panel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        }
      ]
    );
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const SettingItem = ({ title, subtitle, icon, value, onToggle, type = 'switch' }) => (
    <Animatable.View animation="fadeInUp" style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#3B82F6" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333333', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#666666'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      )}
    </Animatable.View>
  );

  const ActionButton = ({ title, subtitle, icon, color, onPress, destructive = false }) => (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <LinearGradient
        colors={destructive ? ['#EF4444', '#DC2626'] : [color, color + 'DD']}
        style={styles.actionGradient}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Settings</Text>
          <Text style={styles.headerSubtitle}>Configure your admin panel</Text>
        </View>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Admin Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Admin Information</Text>
          <View style={styles.adminInfoCard}>
            <View style={styles.adminAvatar}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>DesiConnect Administrator</Text>
              <Text style={styles.adminEmail}>admin@desiconnect.edu</Text>
              <Text style={styles.adminRole}>Super Admin</Text>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              title="Push Notifications"
              subtitle="Receive notifications for new rides and users"
              icon="notifications"
              value={settings.notifications}
              onToggle={() => toggleSetting('notifications')}
            />
            <SettingItem
              title="Auto Approve Rides"
              subtitle="Automatically approve new ride requests"
              icon="checkmark-circle"
              value={settings.autoApprove}
              onToggle={() => toggleSetting('autoApprove')}
            />
            <SettingItem
              title="Maintenance Mode"
              subtitle="Put the app in maintenance mode"
              icon="construct"
              value={settings.maintenanceMode}
              onToggle={() => toggleSetting('maintenanceMode')}
            />
            <SettingItem
              title="Debug Mode"
              subtitle="Enable debug logging and features"
              icon="bug"
              value={settings.debugMode}
              onToggle={() => toggleSetting('debugMode')}
            />
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Admin Actions</Text>
          <View style={styles.actionsCard}>
            <ActionButton
              title="Backup Database"
              subtitle="Create a backup of all data"
              icon="cloud-download"
              color="#10B981"
              onPress={() => Alert.alert('Backup', 'Database backup initiated')}
            />
            <ActionButton
              title="System Health"
              subtitle="Check system status and performance"
              icon="heart"
              color="#3B82F6"
              onPress={() => Alert.alert('Health Check', 'System is healthy')}
            />
            <ActionButton
              title="Clear Cache"
              subtitle="Clear all cached data"
              icon="trash"
              color="#F59E0B"
              onPress={() => Alert.alert('Cache', 'Cache cleared successfully')}
            />
            <ActionButton
              title="Export Data"
              subtitle="Export all data to CSV"
              icon="download"
              color="#8B5CF6"
              onPress={() => Alert.alert('Export', 'Data export started')}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Security</Text>
          <View style={styles.securityCard}>
            <ActionButton
              title="Change Password"
              subtitle="Update your admin password"
              icon="lock-closed"
              color="#3B82F6"
              onPress={() => Alert.alert('Password', 'Password change feature')}
            />
            <ActionButton
              title="Two-Factor Auth"
              subtitle="Enable 2FA for extra security"
              icon="shield"
              color="#10B981"
              onPress={() => Alert.alert('2FA', 'Two-factor authentication setup')}
            />
            <ActionButton
              title="Login History"
              subtitle="View recent login attempts"
              icon="time"
              color="#F59E0B"
              onPress={() => Alert.alert('History', 'Login history feature')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>
          <View style={styles.dangerCard}>
            <ActionButton
              title="Sign Out"
              subtitle="Sign out of admin panel"
              icon="log-out"
              color="#EF4444"
              onPress={handleSignOut}
              destructive={true}
            />
            <ActionButton
              title="Reset App"
              subtitle="Reset all app data (irreversible)"
              icon="refresh"
              color="#EF4444"
              onPress={() => Alert.alert(
                'Reset App',
                'This will delete all data. Are you sure?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive' }
                ]
              )}
              destructive={true}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.1.1</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>January 2024</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Support</Text>
              <Text style={styles.infoValue}>admin@desiconnect.edu</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  adminInfoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  adminEmail: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 2,
  },
  adminRole: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  settingsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  actionsCard: {
    gap: 10,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.8,
  },
  securityCard: {
    gap: 10,
  },
  dangerCard: {
    gap: 10,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
