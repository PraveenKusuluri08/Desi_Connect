import { Image } from "expo-image";
import { StyleSheet, Dimensions } from "react-native";
import {router} from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Button from "@/components/Button";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/desi-connect.jpg")}
          style={styles.reactLogo}
          contentFit="cover"
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.welcomeTitle}>
          Welcome to Desi Connect! 🚗
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Ride Together, Save Together
        </ThemedText>
        <ThemedText style={styles.text}>
          Desi Connect lets you find and offer rides to people heading in the
          same direction. Share your journey, cut travel costs, and make new
          friends on the road.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Why Desi Connect?
        </ThemedText>
        <ThemedText style={styles.text}>
          Whether you&apos;re commuting, visiting family, or exploring a new
          place — Desi Connect helps reduce travel expenses and build a helpful
          travel community.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Simple. Fast. Social.
        </ThemedText>
        <ThemedText style={styles.text}>
          Post your ride or search for one in just a few taps. No complicated
          process — just people helping people get where they need to go.
        </ThemedText>
      </ThemedView>

      <ThemedView style={{ alignItems: "center", marginTop: 20, gap: 16 }}>
        <Button
          label="Create an account"
          handlePressed={() => router.navigate("/signup")}
          variant="primary"
        />
        <Button
          label="Log In"
          handlePressed={() =>router.navigate("/login")}
          variant="outline"
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  text: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  reactLogo: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.3,
    position: "absolute",
    top: 0,
    left: 0,
  },
});
