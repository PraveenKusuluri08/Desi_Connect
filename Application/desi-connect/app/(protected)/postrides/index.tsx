import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import { collection, doc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import ReliableAddressInput from "../../../components/ReliableAddressInput";
import { AddressSuggestion } from "../../../components/utils/placesService";
import { db } from "../../../config/fbConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Modern Input Component (for non-address inputs)
const ModernInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = "default",
  multiline = false,
  height = 56,
  delay = 0 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.inputContainer}
    >
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <View style={styles.inputIcon}>
          <Ionicons name={icon} size={20} color={isFocused ? "#8B5CF6" : "#6B7280"} />
        </View>
        <TextInput
          placeholder={placeholder}
          style={[styles.modernInput, { height: height }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </Animatable.View>
  );
};

// Modern Date Picker Component
const ModernDatePicker = ({ date, onPress, delay = 0 }) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.inputContainer}
    >
      <Pressable style={styles.datePickerWrapper} onPress={onPress}>
        <View style={styles.inputIcon}>
          <Ionicons name="calendar" size={20} color="#8B5CF6" />
        </View>
        <View style={styles.dateContent}>
          <Text style={styles.dateLabel}>Departure Date & Time</Text>
          <Text style={styles.dateValue}>
            {date.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
      </Pressable>
    </Animatable.View>
  );
};

// Seat Counter Component
const SeatCounter = ({ seats, onDecrease, onIncrease, delay = 0 }) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      delay={delay}
      style={styles.inputContainer}
    >
      <View style={styles.seatCounterWrapper}>
        <View style={styles.inputIcon}>
          <Ionicons name="people" size={20} color="#8B5CF6" />
        </View>
        <View style={styles.seatContent}>
          <Text style={styles.seatLabel}>Number of Passengers</Text>
          <Text style={styles.seatSubLabel}>How many people can join?</Text>
        </View>
        <View style={styles.counterControls}>
          <Pressable 
            style={[styles.counterButton, seats <= 1 && styles.counterButtonDisabled]}
            onPress={onDecrease}
            disabled={seats <= 1}
          >
            <Ionicons name="remove" size={20} color={seats <= 1 ? "#9CA3AF" : "#8B5CF6"} />
          </Pressable>
          <Text style={styles.counterValue}>{seats}</Text>
          <Pressable 
            style={[styles.counterButton, seats >= 8 && styles.counterButtonDisabled]}
            onPress={onIncrease}
            disabled={seats >= 8}
          >
            <Ionicons name="add" size={20} color={seats >= 8 ? "#9CA3AF" : "#8B5CF6"} />
          </Pressable>
        </View>
      </View>
    </Animatable.View>
  );
};

export default function PostRideScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [seats, setSeats] = useState(1);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  


  const buttonScale = useRef(new Animated.Value(1)).current;

  const onChangeDate = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSeatDecrease = () => {
    if (seats > 1) setSeats(seats - 1);
  };

  const handleSeatIncrease = () => {
    if (seats < 8) setSeats(seats + 1);
  };

  const handleFromAddressSelect = (address: AddressSuggestion) => {
    console.log('Selected from address:', address);
    // You can store additional address details here if needed
  };

  const handleToAddressSelect = (address: AddressSuggestion) => {
    console.log('Selected to address:', address);
    // You can store additional address details here if needed
  };

  // Location picker navigation
  const handleOpenLocationPicker = () => {
    if (from && to) {
      router.push({
        pathname: '/location-picker',
        params: {
          pickupAddress: from,
          destinationAddress: to
        }
      });
    }
  };

  const handlePostRide = async () => {
    if (!from || !to) {
      alert("Please fill in pickup and destination locations.");
      return;
    }

    setIsLoading(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const rideRef = doc(collection(db, "rides"));
      const rideData = {
        id: rideRef.id,
        from,
        to,
        date: date.toISOString(),
        seats: seats.toString(),
        notes,
        isRidedAccepted: false,
        rideCreatedBy: user?.uid,
        createdAt: new Date().toISOString(),
      };

      await setDoc(rideRef, rideData);

      alert("🚗 Ride posted successfully!");
      router.push("/home");
    } catch (error) {
      console.error("Error posting ride:", error);
      alert("Failed to post ride. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </Pressable>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Post a Ride</Text>
          <Text style={styles.headerSubtitle}>Share your journey with others</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animatable.View
          animation="fadeInDown"
          style={styles.heroSection}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.heroGradient}
          >
            <Ionicons name="car-sport" size={48} color="#fff" />
            <Text style={styles.heroTitle}>Share Your Ride</Text>
          
          </LinearGradient>
        </Animatable.View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Trip Details</Text>
          
          <ReliableAddressInput
            icon="radio-button-on"
            placeholder="From (Pickup location)"
            value={from}
            onChangeText={setFrom}
            onAddressSelect={handleFromAddressSelect}
            isFocused={fromFocused}
            onFocus={() => setFromFocused(true)}
            onBlur={() => setFromFocused(false)}
            delay={200}
          />

          <ReliableAddressInput
            icon="location"
            placeholder="To (Destination)"
            value={to}
            onChangeText={setTo}
            onAddressSelect={handleToAddressSelect}
            isFocused={toFocused}
            onFocus={() => setToFocused(true)}
            onBlur={() => setToFocused(false)}
            delay={300}
          />

          {/* Location Picker Button - DISABLED */}
          {/* <Animatable.View
            animation="fadeInUp"
            delay={400}
            style={styles.inputContainer}
          >
            <Pressable
              style={[
                styles.locationPickerButton,
                (!from || !to) && styles.locationPickerButtonDisabled
              ]}
              onPress={handleOpenLocationPicker}
              disabled={!from || !to}
            >
              <LinearGradient
                colors={(!from || !to) ? ['#E5E7EB', '#D1D5DB'] : ['#3B82F6', '#2563EB']}
                style={styles.locationPickerGradient}
              >
                <Ionicons 
                  name="map" 
                  size={24} 
                  color={(!from || !to) ? "#9CA3AF" : "#FFFFFF"} 
                />
                <Text style={[
                  styles.locationPickerText,
                  (!from || !to) && styles.locationPickerTextDisabled
                ]}>
                  {(!from || !to) ? 'Fill both locations first' : 'View Route on Map'}
                </Text>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={(!from || !to) ? "#9CA3AF" : "#FFFFFF"} 
                />
              </LinearGradient>
            </Pressable>
          </Animatable.View> */}

          <ModernDatePicker
            date={date}
            onPress={() => setShowPicker(true)}
            delay={400}
          />

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          <SeatCounter
            seats={seats}
            onDecrease={handleSeatDecrease}
            onIncrease={handleSeatIncrease}
            delay={500}
          />

          <Animatable.View
            animation="fadeInUp"
            delay={600}
            style={styles.inputContainer}
          >
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.notesWrapper}>
              <View style={styles.notesIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color="#8B5CF6" />
              </View>
              <TextInput
                placeholder="Add notes for passengers (meeting point, contact info, etc.)"
                style={styles.notesInput}
                multiline
                value={notes}
                onChangeText={setNotes}
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>
          </Animatable.View>

          {/* Tips Section */}
          <Animatable.View
            animation="fadeInUp"
            delay={700}
            style={styles.tipsSection}
          >
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.tipText}>Be specific about pickup location</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.tipText}>Include your contact information in notes</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.tipText}>Set a fair price based on distance</Text>
              </View>
            </View>
          </Animatable.View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <Animatable.View
          animation="fadeInUp"
          delay={800}
          style={styles.actionContainer}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Pressable
              style={[styles.postButton, isLoading && styles.postButtonDisabled]}
              onPress={handlePostRide}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#7C3AED']}
                style={styles.postButtonGradient}
              >
                {isLoading ? (
                  <>
                    <Ionicons name="hourglass" size={24} color="#fff" />
                    <Text style={styles.postButtonText}>Posting...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="car-sport" size={24} color="#fff" />
                    <Text style={styles.postButtonText}>Post My Ride</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </Animatable.View>
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Hero Section
  heroSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Form Section
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },

  // Input Styles
  inputContainer: {
    marginBottom: 16,
    zIndex: 999,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.15,
  },
  inputIcon: {
    width: 32,
    alignItems: 'center',
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
    paddingLeft: 12,
  },

  // Date Picker Styles
  datePickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dateContent: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },

  // Seat Counter Styles
  seatCounterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  seatContent: {
    flex: 1,
    marginLeft: 12,
  },
  seatLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
    marginBottom: 4,
  },
  seatSubLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#F9FAFB',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    minWidth: 32,
    textAlign: 'center',
  },

  // Notes Styles
  notesWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    padding: 16,
    alignItems: 'flex-start',
  },
  notesIcon: {
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
  },
  notesInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    minHeight: 80,
  },

  // Tips Section
  tipsSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },

  // Location Picker Button
  locationPickerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  locationPickerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  locationPickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  locationPickerButtonDisabled: {
    opacity: 0.6,
  },
  locationPickerTextDisabled: {
    color: '#9CA3AF',
  },

  // Bottom Action
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  actionContainer: {
    width: '100%',
  },
  postButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  postButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
});