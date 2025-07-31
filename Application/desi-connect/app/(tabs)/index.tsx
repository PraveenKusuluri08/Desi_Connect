import React, { useEffect, useRef } from "react";
import { 
  Image, 
  StyleSheet, 
  Dimensions, 
  Animated, 
  View,
  TouchableOpacity,
  StatusBar,
  Text
} from "react-native";
import { router } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/Button";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Icon components
const CarIcon = () => (
  <Text style={styles.iconText}>🚗</Text>
);

const SaveIcon = () => (
  <Text style={styles.iconText}>💰</Text>
);

const CommunityIcon = () => (
  <Text style={styles.iconText}>👥</Text>
);

const SpeedIcon = () => (
  <Text style={styles.iconText}>⚡</Text>
);

export default function HomeScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger animations for smooth entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const FeatureCard = ({ icon, title, description, delay = 0, accent = '#667eea' }) => {
    const cardAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    useEffect(() => {
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
      }).start();

      // Subtle pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    return (
      <Animated.View 
        style={[
          styles.featureCard,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                })
              },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <View style={[styles.cardContent, { borderLeftColor: accent }]}>
          <View style={[styles.iconContainer, { backgroundColor: accent + '15' }]}>
            {icon}
            <View style={[styles.iconGlow, { backgroundColor: accent + '20' }]} />
          </View>
          <View style={styles.cardTextContainer}>
            <ThemedText type="subtitle" style={styles.cardTitle}>
              {title}
            </ThemedText>
            <ThemedText style={styles.cardText}>
              {description}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };

  const AnimatedButton = ({ label, onPress, variant, delay = 0 }) => {
    const buttonScale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(buttonScale, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          {
            opacity: buttonAnim,
            transform: [
              {
                translateY: buttonAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              },
              { scale: buttonScale }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modernButton,
            variant === 'primary' ? styles.primaryButton : styles.outlineButton
          ]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <ThemedText style={[
            styles.buttonText,
            variant === 'primary' ? styles.primaryButtonText : styles.outlineButtonText
          ]}>
            {label}
          </ThemedText>
          {variant === 'primary' && <View style={styles.buttonShine} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#667eea", dark: "#1D3D47" }}
        headerImage={
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/desi-connect.jpg")}
              style={styles.headerImage}
              contentFit="cover"
            />
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              <Animated.View style={[styles.floatingElement, { transform: [{ rotate: spin }] }]}>
                <Text style={styles.floatingIcon}>✨</Text>
              </Animated.View>
            </View>
          </View>
        }
      >
        <ThemedView style={styles.contentContainer}>
          {/* Welcome Section */}
          <Animated.View 
            style={[
              styles.welcomeContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeHeader}>
                <ThemedText type="title" style={styles.welcomeTitle}>
                  Welcome to Desi Connect! 🚗
                </ThemedText>
                <View style={styles.titleUnderline} />
              </View>
              <ThemedText style={styles.welcomeSubtitle}>
                Ride Together, Save Together
              </ThemedText>
              <View style={styles.sparkleContainer}>
                <Text style={[styles.sparkle, { left: 20, top: 10 }]}>✨</Text>
                <Text style={[styles.sparkle, { right: 30, top: 5 }]}>🌟</Text>
                <Text style={[styles.sparkle, { left: 60, bottom: 15 }]}>💫</Text>
              </View>
            </View>
          </Animated.View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <FeatureCard
              icon={<CarIcon />}
              title="Smart Ride Matching"
              description="Find rides heading in your direction with our intelligent matching system."
              delay={200}
              accent="#667eea"
            />
            
            <FeatureCard
              icon={<SaveIcon />}
              title="Save Money"
              description="Cut your travel costs significantly by sharing rides with fellow travelers."
              delay={400}
              accent="#10b981"
            />
            
            <FeatureCard
              icon={<CommunityIcon />}
              title="Build Community"
              description="Connect with like-minded people and build lasting friendships on your journeys."
              delay={600}
              accent="#f59e0b"
            />
            
            <FeatureCard
              icon={<SpeedIcon />}
              title="Quick & Easy"
              description="Post or find rides in seconds with our streamlined, user-friendly interface."
              delay={800}
              accent="#ef4444"
            />
          </View>

          {/* Call to Action */}
          <Animated.View 
            style={[
              styles.ctaContainer,
              {
                opacity: buttonAnim,
                transform: [{
                  translateY: buttonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.ctaCard}>
              <View style={styles.ctaHeader}>
                <ThemedText style={styles.ctaTitle}>
                  Ready to start your journey?
                </ThemedText>
                <View style={styles.ctaTitleAccent} />
              </View>
              <ThemedText style={styles.ctaSubtitle}>
                Join thousands of happy travelers
              </ThemedText>
              
              <View style={styles.buttonContainer}>
                <AnimatedButton
                  label="Create Account"
                  onPress={() => router.navigate("/signup")}
                  variant="primary"
                />
                <AnimatedButton
                  label="Log In"
                  onPress={() => router.navigate("/login")}
                  variant="outline"
                />
              </View>
            </View>
          </Animated.View>
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.4,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(102, 126, 234, 0.7)',
  },
  headerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingElement: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  floatingIcon: {
    fontSize: 30,
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f8fafc',
  },
  welcomeContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 8,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  welcomeSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#667eea',
    letterSpacing: 0.5,
  },
  sparkleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 16,
    opacity: 0.7,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconGlow: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -5,
    left: -5,
    zIndex: -1,
  },
  iconText: {
    fontSize: 28,
  },
  cardTextContainer: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  cardText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  ctaContainer: {
    margin: 20,
    marginTop: 40,
  },
  ctaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ctaHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1e293b',
    marginBottom: 8,
  },
  ctaTitleAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#667eea',
    borderRadius: 2,
  },
  ctaSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  modernButton: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#667eea',
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryButtonText: {
    color: '#ffffff',
  },
  outlineButtonText: {
    color: '#667eea',
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: [{ skewX: '-20deg' }],
  },
});