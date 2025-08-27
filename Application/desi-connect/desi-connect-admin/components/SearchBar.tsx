import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  style?: any;
}

export default function SearchBar({
  placeholder = "Search...",
  value,
  onChangeText,
  onClear,
  style
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Animatable.View 
      animation={isFocused ? "pulse" : undefined}
      style={[styles.container, style]}
    >
      <View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
        <Ionicons 
          name="search" 
          size={20} 
          color={isFocused ? "#3B82F6" : "#666666"} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value ? (
          <Pressable onPress={() => {
            onChangeText('');
            onClear?.();
          }}>
            <Ionicons name="close-circle" size={20} color="#666666" />
          </Pressable>
        ) : null}
      </View>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: 50,
  },
  searchWrapperFocused: {
    borderColor: '#3B82F6',
    backgroundColor: '#1a1a1a',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 15,
  },
});
