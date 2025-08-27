import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

interface ReliableAddressInputProps {
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

const ReliableAddressInput: React.FC<ReliableAddressInputProps> = ({
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
  maxSuggestions = 4,
  showLocationButton = true,
}) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [sessionToken, setSessionToken] = useState<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Generate session token for API calls
  useEffect(() => {
    setSessionToken(placesService.generateSessionToken());
  }, []);

  // Debounced search function
  const searchAddresses = async (input: string) => {
    console.log('🔍 Searching for:', input);
    
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
      console.log('📍 Google Places results:', results.length);
      
      // If no results from Google Places API, try free APIs
      if (results.length === 0) {
        console.log('🌐 Trying free APIs...');
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
          console.log('🌐 Free API results:', results.length);
        }
      }

      // If still no results, try mock data
      if (results.length === 0) {
        console.log('🎭 Using mock data...');
        results = getMockAddressSuggestions(input);
        console.log('🎭 Mock results:', results.length);
      }

      // If still no results, try location-based suggestions
      if (results.length === 0) {
        console.log('📍 Using location-based suggestions...');
        results = await getLocationBasedSuggestions(input);
        console.log('📍 Location results:', results.length);
      }

      console.log('✅ Final results:', results.length);
      setSuggestions(results.slice(0, maxSuggestions));
    } catch (error) {
      console.error('❌ Error searching addresses:', error);
      // Fallback to mock data
      const mockResults = getMockAddressSuggestions(input);
      console.log('🎭 Fallback mock results:', mockResults.length);
      setSuggestions(mockResults.slice(0, maxSuggestions));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle current location button press
  const handleCurrentLocation = async () => {
    console.log('📍 Location button pressed for field:', placeholder);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsLoading(true);
    try {
      // Get current location using expo-location
      const locationResults = await getLocationBasedSuggestions('');
      if (locationResults.length > 0) {
        const currentLocation = locationResults[0];
        console.log('📍 Current location found:', currentLocation.fullAddress);
        handleAddressSelect(currentLocation);
      } else {
        // Fallback to a default location if GPS fails
        const fallbackLocation: AddressSuggestion = {
          id: 'current-location-fallback',
          title: 'Current Location',
          subtitle: 'Your current GPS location',
          fullAddress: 'Current Location',
          placeId: 'current-location',
        };
        console.log('📍 Using fallback location');
        handleAddressSelect(fallbackLocation);
      }
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      // Fallback to a default location
      const fallbackLocation: AddressSuggestion = {
        id: 'current-location-error',
        title: 'Current Location',
        subtitle: 'Your current GPS location',
        fullAddress: 'Current Location',
        placeId: 'current-location',
      };
      handleAddressSelect(fallbackLocation);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text input changes with debouncing
  const handleTextChange = (text: string) => {
    console.log('📝 Text changed:', text);
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
    console.log('✅ Selected:', suggestion.fullAddress);
    onChangeText(suggestion.fullAddress);
    setSuggestions([]);
    setShowSuggestionsList(false);
    
    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
  };

  // Handle input focus
  const handleFocus = () => {
    console.log('🎯 Input focused');
    if (onFocus) onFocus();
    if (value.length >= 2) {
      console.log('📋 Showing existing suggestions');
      setShowSuggestionsList(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    console.log('👁️ Input blurred');
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
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showSuggestionsList]);

  // Render suggestion item
  const renderSuggestionItem = ({ item, index }: { item: AddressSuggestion; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 80}
    >
      <Pressable
        style={styles.suggestionItem}
        onPress={() => handleAddressSelect(item)}
      >
        <LinearGradient
          colors={['#F8FAFC', '#F1F5F9']}
          style={styles.suggestionGradient}
        >
          <View style={styles.suggestionIcon}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={16} color="#8B5CF6" />
            </View>
          </View>
          <View style={styles.suggestionContent}>
            <Text style={styles.suggestionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.suggestionSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          </View>
          <View style={styles.suggestionArrow}>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </View>
        </LinearGradient>
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
        <LinearGradient
          colors={isFocused ? ['#F3F4F6', '#E5E7EB'] : ['#FFFFFF', '#F9FAFB']}
          style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}
        >
          <View style={styles.inputIcon}>
            <View style={[styles.iconBackground, isFocused && styles.iconBackgroundFocused]}>
              <Ionicons name={icon} size={20} color={isFocused ? "#8B5CF6" : "#6B7280"} />
            </View>
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
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable
                style={styles.locationButton}
                onPress={handleCurrentLocation}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ['#E5E7EB', '#D1D5DB'] : ['#8B5CF6', '#7C3AED']}
                  style={styles.locationButtonGradient}
                >
                  <Ionicons 
                    name="location" 
                    size={16} 
                    color={isLoading ? "#9CA3AF" : "#FFFFFF"} 
                  />
                </LinearGradient>
              </Pressable>
              {isLoading && (
                <View style={styles.locationLoadingIndicator}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                </View>
              )}
              <View style={styles.locationTooltip}>
                <Text style={styles.locationTooltipText}>
                  Use current location
                </Text>
              </View>
            </Animated.View>
          )}


          {isLoading && !showLocationButton && (
            <View style={styles.loadingIcon}>
              <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
          )}
        </LinearGradient>
      </Animatable.View>

      {/* Reliable Suggestions List */}
      {showSuggestions && showSuggestionsList && (
        <Animated.View
          style={[
            styles.suggestionsContainer,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                }),
              }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.suggestionsList}>
            {suggestions.length > 0 ? (
              <>
                <View style={styles.suggestionsHeader}>
                  <Text style={styles.suggestionsHeaderText}>
                    {isLoading ? 'Searching...' : `${suggestions.length} suggestions found`}
                  </Text>
                </View>
                <FlatList
                  data={suggestions}
                  renderItem={renderSuggestionItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={styles.suggestionsFlatList}
                  keyboardShouldPersistTaps="handled"
                />
              </>
            ) : (
              <View style={styles.noSuggestions}>
                <View style={styles.noSuggestionsIcon}>
                  <Ionicons name="search" size={24} color="#9CA3AF" />
                </View>
                <Text style={styles.noSuggestionsText}>
                  {isLoading ? 'Searching for addresses...' : 'No suggestions found'}
                </Text>
                <Text style={styles.noSuggestionsSubtext}>
                  Try typing a city name like "New York" or "Boston"
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
    zIndex: 9999,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputWrapperFocused: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  inputIcon: {
    width: 40,
    alignItems: 'center',
  },
  iconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackgroundFocused: {
    backgroundColor: '#EDE9FE',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
    paddingLeft: 12,
    fontWeight: '500',
  },
  loadingIcon: {
    width: 40,
    alignItems: 'center',
  },
  locationButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  locationButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLoadingIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationTooltip: {
    position: 'absolute',
    top: -30,
    right: -20,
    backgroundColor: '#1F2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    opacity: 0,
  },
  locationTooltipText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 10000,
    marginTop: 8,
    elevation: 9999,
  },
  suggestionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 9999,
    maxHeight: 320,
    minHeight: 80,
  },
  suggestionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  suggestionsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  suggestionsFlatList: {
    borderRadius: 20,
  },
  suggestionItem: {
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  suggestionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  suggestionIcon: {
    width: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  suggestionArrow: {
    width: 24,
    alignItems: 'center',
  },
  noSuggestions: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  noSuggestionsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  noSuggestionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  noSuggestionsSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default ReliableAddressInput;
