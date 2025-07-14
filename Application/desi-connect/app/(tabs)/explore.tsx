import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E6F0FA', dark: '#1D2B3A' }} 
      headerImage={
        <IconSymbol
          size={310}
          color="#007AFF" // ✅ Primary blue
          name="car"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>Explore</ThemedText>
      </ThemedView>

      <ThemedText style={styles.descriptionText}>
        Discover how Desi Connect helps you travel smarter.
      </ThemedText>

      <Collapsible title="What is Desi Connect?">
        <ThemedText style={styles.sectionText}>
          Desi Connect is a ride-sharing app that connects people traveling in the same direction.
          You can post a ride or join someone else’s journey and make travel more affordable, flexible, and social.
        </ThemedText>
      </Collapsible>

      <Collapsible title="How to Post or Find a Ride">
        <ThemedText style={styles.sectionText}>
          To post a ride, enter your route, time, and available seats. To find a ride, search by
          destination or route and request to join. It&apos;s that simple!
        </ThemedText>
      </Collapsible>

      <Collapsible title="Is it Safe?">
        <ThemedText style={styles.sectionText}>
          Yes. Profiles are verified and ratings help you choose trusted riders and drivers. We also
          recommend connecting via chat before confirming any ride.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Benefits of Ride Sharing">
        <ThemedText style={styles.sectionText}>
          Ride sharing reduces travel costs, helps the environment by lowering carbon emissions, and
          creates opportunities to meet new people heading your way.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Earn by Offering Rides">
        <ThemedText style={styles.sectionText}>
          Have empty seats while commuting or traveling? Use Desi Connect to offer rides and earn money
          on trips you&apos;re already taking.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Built for the Community">
        <ThemedText style={styles.sectionText}>
          Whether you&apos;re a student, a traveler, or a daily commuter, Desi Connect is designed to support
          your journey while building a friendly and helpful travel network.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  titleText: {
    color: '#003366',
  },
  descriptionText: {
    marginBottom: 16,
    fontSize: 14,
    color: '#333',
  },
  sectionText: {
    color: '#444',
    fontSize: 15,
    lineHeight: 22,
  },
});
