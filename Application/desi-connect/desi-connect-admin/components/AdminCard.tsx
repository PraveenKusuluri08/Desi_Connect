import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface AdminCardProps {
  title: string;
  subtitle?: string;
  value?: string | number;
  icon: string;
  color: string;
  onPress?: () => void;
  gradient?: boolean;
  animation?: string;
  delay?: number;
  children?: React.ReactNode;
}

export default function AdminCard({
  title,
  subtitle,
  value,
  icon,
  color,
  onPress,
  gradient = true,
  animation = "fadeInUp",
  delay = 0,
  children
}: AdminCardProps) {
  const CardContent = () => (
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color="#666666" />
        )}
      </View>
      
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      {value && <Text style={styles.cardValue}>{value}</Text>}
      {children}
    </View>
  );

  return (
    <Animatable.View animation={animation} delay={delay}>
      <Pressable
        style={[styles.card, onPress && styles.cardPressable]}
        onPress={onPress}
        disabled={!onPress}
      >
        {gradient ? (
          <LinearGradient
            colors={[color, color + 'DD']}
            style={styles.gradient}
          >
            <CardContent />
          </LinearGradient>
        ) : (
          <View style={[styles.cardBackground, { borderColor: color + '30' }]}>
            <CardContent />
          </View>
        )}
      </Pressable>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 15,
  },
  cardPressable: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradient: {
    padding: 20,
  },
  cardBackground: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    padding: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 10,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
