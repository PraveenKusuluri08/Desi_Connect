import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  showBadge?: boolean;
  badgeText?: string;
  onRefresh?: () => void;
  onBack?: () => void;
  rightAction?: {
    icon: string;
    onPress: () => void;
    color?: string;
  };
}

export default function AdminHeader({
  title,
  subtitle,
  showBadge = false,
  badgeText = "ADMIN",
  onRefresh,
  onBack,
  rightAction
}: AdminHeaderProps) {
  return (
    <LinearGradient
      colors={['#1a1a1a', '#0f0f0f']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {onBack && (
          <Pressable style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>

        <View style={styles.headerActions}>
          {showBadge && (
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}
          
          {onRefresh && (
            <Pressable style={styles.actionButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
            </Pressable>
          )}
          
          {rightAction && (
            <Pressable 
              style={[styles.actionButton, { backgroundColor: rightAction.color || '#333333' }]} 
              onPress={rightAction.onPress}
            >
              <Ionicons name={rightAction.icon as any} size={20} color="#FFFFFF" />
            </Pressable>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
