import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface FilterOption {
  key: string;
  label: string;
  icon?: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  style?: any;
}

export default function FilterTabs({
  options,
  selectedFilter,
  onFilterChange,
  style
}: FilterTabsProps) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option, index) => (
          <Animatable.View
            key={option.key}
            animation="fadeInUp"
            delay={index * 100}
          >
            <Pressable
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.filterButtonActive
              ]}
              onPress={() => onFilterChange(option.key)}
            >
              {option.icon && (
                <Ionicons 
                  name={option.icon as any} 
                  size={16} 
                  color={selectedFilter === option.key ? "#FFFFFF" : "#CCCCCC"} 
                  style={styles.filterIcon}
                />
              )}
              <Text style={[
                styles.filterButtonText,
                selectedFilter === option.key && styles.filterButtonTextActive
              ]}>
                {option.label}
              </Text>
              {option.count !== undefined && (
                <View style={[
                  styles.countBadge,
                  selectedFilter === option.key && styles.countBadgeActive
                ]}>
                  <Text style={[
                    styles.countText,
                    selectedFilter === option.key && styles.countTextActive
                  ]}>
                    {option.count}
                  </Text>
                </View>
              )}
            </Pressable>
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  scrollContent: {
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  countBadge: {
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  countText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
  },
  countTextActive: {
    color: '#3B82F6',
  },
});
