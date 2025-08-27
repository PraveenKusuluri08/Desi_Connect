import { db } from "@/config/fbConfig";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import * as Animatable from "react-native-animatable";

interface University {
  name: string;
  country: string;
  state_province?: string;
  domains: string[];
  web_pages: string[];
}

export default function UniversitySearchScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { fromSignup } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<string | null>(null);

  const searchUniversities = async (query: string) => {
    if (query.length < 3) {
      setUniversities([]);
      return;
    }

    setLoading(true);
    try {
      // Using the free Universities API
      const response = await fetch(
        `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}&country=United+States`
      );
      const data = await response.json();
      
      // Filter and limit results
      const filteredData = data
        .filter((uni: University) => 
          uni.name.toLowerCase().includes(query.toLowerCase()) &&
          uni.country === "United States"
        )
        .slice(0, 20); // Limit to 20 results
      
      setUniversities(filteredData);
    } catch (error) {
      console.error('Error searching universities:', error);
      Alert.alert('Error', 'Failed to search universities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchUniversities(searchQuery);
      }
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleUniversitySelect = async (university: University) => {
    try {
      if (fromSignup === 'true') {
        // For signup flow, go back with the selected university
        console.log('University selected for signup:', university.name);
        console.log('Navigating back with university:', university.name);
        
        // Try using replace to go back to signup with the university
        router.replace({
          pathname: '/signup',
          params: { selectedUniversity: university.name }
        });
      } else if (user?.uid) {
        // For existing users, update their profile
        await updateDoc(doc(db, 'users', user.uid), {
          university: university.name
        });
        console.log('University set to:', university.name);
        Alert.alert(
          'Success', 
          `University set to ${university.name}`,
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error updating university:', error);
      Alert.alert('Error', 'Failed to update university');
    }
  };

  const renderUniversityItem = ({ item }: { item: University }) => (
    <Animatable.View animation="fadeInUp" style={styles.universityItem}>
      <TouchableOpacity
        style={styles.universityButton}
        onPress={() => handleUniversitySelect(item)}
      >
        <View style={styles.universityInfo}>
          <Text style={styles.universityName}>{item.name}</Text>
          <Text style={styles.universityLocation}>
            {item.state_province ? `${item.state_province}, ` : ''}{item.country}
          </Text>
          {item.domains.length > 0 && (
            <Text style={styles.universityDomain}>
              {item.domains[0]}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />

      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search University</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for your university..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color="#8B5CF6" />}
        </View>
      </View>

      {/* Results */}
      <FlatList
        data={universities}
        renderItem={renderUniversityItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery.length > 0 && !loading ? (
            <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No universities found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with a different keyword
              </Text>
            </Animatable.View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  resultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  universityItem: {
    marginBottom: 8,
  },
  universityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  universityLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  universityDomain: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
}); 