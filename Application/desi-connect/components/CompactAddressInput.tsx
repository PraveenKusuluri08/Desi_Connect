import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { getFreeAddressSuggestions } from './utils/freePlacesService';
import { getLocationBasedSuggestions } from './utils/locationService';
import { AddressSuggestion, getMockAddressSuggestions, placesService } from './utils/placesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CompactAddressInputProps {
  icon: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onAddressSelect?: (address: AddressSuggestion) => void;
  delay?: number;
  isFocused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  showSuggestions?: boolean;
  maxSuggestions?: number;
  showLocationButton?: boolean;
}

const CompactAddressInput: React.FC<CompactAddressInputProps> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  onAddressSelect,
  delay = 0,
  isFocused = false,
  onFocus,
  onBlur,
  showSuggestions = true,
  maxSuggestions = 3, // Reduced from 5 to 3
  showLocationButton = true,
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Generate session token for API calls
  useEffect(() => {
    setSessionToken(placesService.generateSessionToken());
  }, []);

  // Debounced search function
  const searchAddresses = async (input: string) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      setShowSuggestionsList(false);
      return;
    }

    setIsLoading(true);
    setShowSuggestionsList(true);

    try {
      // Try to use Google Places API first
      let results = await placesService.getAddressSuggestions(input, sessionToken);
      
      // If no results from Google Places API, try free APIs
      if (results.length === 0) {
        console.log('Trying free APIs for address suggestions...');
        const freeResults = await getFreeAddressSuggestions(input);
        if (freeResults.length > 0) {
          // Convert FreeAddressSuggestion to AddressSuggestion
          results = freeResults.map(freeSuggestion => ({
            id: freeSuggestion.id,
            title: freeSuggestion.title,
            subtitle: freeSuggestion.subtitle,
            fullAddress: freeSuggestion.fullAddress,
            placeId: freeSuggestion.placeId,
          }));
        }
      }

      // If still no results, try mock data
      if (results.length === 0) {
        console.log('Using mock data for address suggestions...');
        results = getMockAddressSuggestions(input);
      }

      // If still no results, try location-based suggestions
      if (results.length === 0) {
        console.log('Using location-based suggestions...');
        results = await getLocationBasedSuggestions(input);
      }

      setSuggestions(results.slice(0, maxSuggestions));
    } catch (error) {
      console.error('Error searching addresses:', error);
      // Fallback to mock data
      const mockResults = getMockAddressSuggestions(input);
      setSuggestions(mockResults.slice(0, maxSuggestions));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle current location button press
  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const locationResults = await getLocationBasedSuggestions('');
      if (locationResults.length > 0) {
        const currentLocation = locationResults[0]; // First result is current location
        handleAddressSelect(currentLocation);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text input changes with debouncing
  const handleTextChange = (text: string) => {
    onChangeText(text);
    
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debounced search
    debounceTimeout.current = setTimeout(() => {
      searchAddresses(text);
    }, 300);
  };

  // Handle address selection
  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    onChangeText(suggestion.fullAddress);
    setSuggestions([]);
    setShowSuggestionsList(false);
    
    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (onFocus) onFocus();
    if (value.length >= 2) {
      setShowSuggestionsList(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    if (onBlur) onBlur();
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestionsList(false);
    }, 200);
  };

  // Animate suggestions list
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showSuggestionsList ? 1 : 0,
      duration: 150, // Faster animation
      useNativeDriver: true,
    }).start();
  }, [showSuggestionsList]);

  // Render suggestion item
  const renderSuggestionItem = ({ item, index }: { item: AddressSuggestion; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 20} // Faster animation
    >
      <Pressable
        style={styles.suggestionItem}
        onPress={() => handleAddressSelect(item)}
      >
        <View style={styles.suggestionIcon}>
          <Ionicons name="location" size={12} color="#8B5CF6" />
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.suggestionSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        </View>
      </Pressable>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      <Animatable.View
        animation="fadeInUp"
        delay={delay}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
          <View style={styles.inputIcon}>
            <Ionicons name={icon} size={18} color={isFocused ? "#8B5CF6" : "#6B7280"} />
          </View>
          <TextInput
            placeholder={placeholder}
            style={styles.input}
            value={value}
            onChangeText={handleTextChange}
            placeholderTextColor="#9CA3AF"
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {showLocationButton && (
            <Pressable
              style={styles.locationButton}
              onPress={handleCurrentLocation}
              disabled={isLoading}
            >
              <Ionicons 
                name="location" 
                size={16} 
                color={isLoading ? "#9CA3AF" : "#8B5CF6"} 
              />
            </Pressable>
          )}
          {isLoading && !showLocationButton && (
            <View style={styles.loadingIcon}>
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          )}
        </View>
      </Animatable.View>

      {/* Compact Suggestions List */}
      {showSuggestions && showSuggestionsList && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-5, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.suggestionsList}>
            {suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                renderItem={renderSuggestionItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                style={styles.suggestionsFlatList}
              />
            ) : (
              <View style={styles.noSuggestions}>
                <Ionicons name="search" size={16} color="#9CA3AF" />
                <Text style={styles.noSuggestionsText}>
                  {isLoading ? 'Searching...' : 'No suggestions found'}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    marginBottom: 12, // Reduced from 20
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Reduced from 16
    borderWidth: 1.5, // Reduced from 2
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    paddingHorizontal: 12, // Reduced from 16
  },
  inputWrapperFocused: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.1,
  },
  inputIcon: {
    width: 28, // Reduced from 32
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15, // Reduced from 16
    color: '#1F2937',
    paddingVertical: 12, // Reduced from 16
    paddingLeft: 8, // Reduced from 12
  },
  loadingIcon: {
    width: 28, // Reduced from 32
    alignItems: 'center',
  },
  locationButton: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    marginTop: 2, // Reduced from 4
  },
  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 8, // Reduced from 12
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    maxHeight: 120, // Reduced from 200
  },
  suggestionsFlatList: {
    borderRadius: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  suggestionIcon: {
    width: 20, // Reduced from 24
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 6, // Reduced from 8
  },
  suggestionTitle: {
    fontSize: 13, // Reduced from 14
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 1,
  },
  suggestionSubtitle: {
    fontSize: 11, // Reduced from 12
    color: '#6B7280',
  },
  noSuggestions: {
    alignItems: 'center',
    paddingVertical: 12, // Reduced from 16
    paddingHorizontal: 10, // Reduced from 12
  },
  noSuggestionsText: {
    fontSize: 11, // Reduced from 12
    color: '#9CA3AF',
    marginTop: 4, // Reduced from 6
  },
});

export default CompactAddressInput;
