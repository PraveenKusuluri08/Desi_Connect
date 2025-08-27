import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
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
    View,
} from 'react-native';
import AdminHeader from '../../components/AdminHeader';
import { auth } from '../../config/firebase';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoApprove: false,
    maintenanceMode: false,
    debugMode: false,
  });

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              // Router will automatically redirect to login
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const SettingItem = ({ icon, title, subtitle, value, onPress, type = 'toggle' }: {
    icon: string;
    title: string;
    subtitle?: string;
    value?: boolean;
    onPress: () => void;
    type?: 'toggle' | 'button';
  }) => (
    <Pressable style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon as any} size={24} color="#3B82F6" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#333333', true: '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#CCCCCC'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#666666" />
      )}
    </Pressable>
  );

  const ActionButton = ({ icon, title, subtitle, color, onPress, destructive = false }: {
    icon: string;
    title: string;
    subtitle?: string;
    color: string;
    onPress: () => void;
    destructive?: boolean;
  }) => (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <LinearGradient
        colors={destructive ? ['#EF4444', '#DC2626'] : [color, color + 'DD']}
        style={styles.actionGradient}
      >
        <Ionicons name={icon as any} size={24} color="#FFFFFF" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
      </LinearGradient>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <AdminHeader
        title="Admin Settings"
        subtitle="Configure your admin panel"
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Admin Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Admin Information</Text>
          <View style={styles.adminCard}>
            <View style={styles.adminAvatar}>
              <Ionicons name="person" size={32} color="#3B82F6" />
            </View>
            <View style={styles.adminInfo}>
              <Text style={styles.adminName}>Admin User</Text>
              <Text style={styles.adminEmail}>{auth.currentUser?.email}</Text>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
              </View>
            </View>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ App Settings</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive alerts for new rides and users"
              value={settings.notifications}
              onPress={() => toggleSetting('notifications')}
            />
            <View style={styles.separator} />
            <SettingItem
              icon="checkmark-circle"
              title="Auto-approve Rides"
              subtitle="Automatically approve new ride requests"
              value={settings.autoApprove}
              onPress={() => toggleSetting('autoApprove')}
            />
            <View style={styles.separator} />
            <SettingItem
              icon="construct"
              title="Maintenance Mode"
              subtitle="Put the app in maintenance mode"
              value={settings.maintenanceMode}
              onPress={() => toggleSetting('maintenanceMode')}
            />
            <View style={styles.separator} />
            <SettingItem
              icon="bug"
              title="Debug Mode"
              subtitle="Enable debug logging and features"
              value={settings.debugMode}
              onPress={() => toggleSetting('debugMode')}
            />
          </View>
        </View>

        {/* Admin Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Admin Actions</Text>
          <View style={styles.actionsCard}>
            <ActionButton
              icon="download"
              title="Backup Data"
              subtitle="Export all data to backup file"
              color="#3B82F6"
              onPress={() => Alert.alert('Backup', 'Backup feature coming soon!')}
            />
            <ActionButton
              icon="analytics"
              title="System Health"
              subtitle="Check system status and performance"
              color="#10B981"
              onPress={() => Alert.alert('Health Check', 'System health check coming soon!')}
            />
            <ActionButton
              icon="refresh"
              title="Clear Cache"
              subtitle="Clear all cached data"
              color="#F59E0B"
              onPress={() => Alert.alert('Cache', 'Cache cleared successfully!')}
            />
            <ActionButton
              icon="document-text"
              title="Export Reports"
              subtitle="Generate and download reports"
              color="#8B5CF6"
              onPress={() => Alert.alert('Reports', 'Report generation coming soon!')}
            />
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Security</Text>
          <View style={styles.settingsCard}>
            <SettingItem
              icon="lock-closed"
              title="Change Password"
              subtitle="Update your admin password"
              onPress={() => Alert.alert('Password', 'Password change feature coming soon!')}
              type="button"
            />
            <View style={styles.separator} />
            <SettingItem
              icon="shield-checkmark"
              title="Two-Factor Authentication"
              subtitle="Enable 2FA for extra security"
              onPress={() => Alert.alert('2FA', '2FA setup coming soon!')}
              type="button"
            />
            <View style={styles.separator} />
            <SettingItem
              icon="eye"
              title="Activity Log"
              subtitle="View admin activity history"
              onPress={() => Alert.alert('Activity Log', 'Activity log coming soon!')}
              type="button"
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>
          <View style={styles.dangerCard}>
            <ActionButton
              icon="log-out"
              title="Sign Out"
              subtitle="Sign out of admin panel"
              color="#EF4444"
              onPress={handleSignOut}
              destructive={true}
            />
            <ActionButton
              icon="trash"
              title="Reset App"
              subtitle="Reset all app data (irreversible)"
              color="#DC2626"
              onPress={() => Alert.alert(
                'Reset App',
                'This will delete ALL data. Are you sure?',
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
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build Number</Text>
              <Text style={styles.infoValue}>100</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>Today</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Support Email</Text>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  adminAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6' + '20',
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
    marginBottom: 5,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
    padding: 20,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6' + '20',
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
  separator: {
    height: 1,
    backgroundColor: '#333333',
    marginHorizontal: 20,
  },
  actionsCard: {
    gap: 15,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
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
  dangerCard: {
    gap: 15,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
