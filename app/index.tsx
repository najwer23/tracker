import LocationTracker from "@/locationTracker/LocationTracker";
import { useRouter } from "expo-router";

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Tracker!</Text>

      <Text style={styles.subtitle}>
        Your reliable companion for real-time GPS tracking.
      </Text>

      <View style={styles.bulletList}>
        <View style={styles.bulletItem}>
          <Text style={styles.boldSubtitle}>Stay Connected</Text>
          <Text style={styles.description}>
            Always know where you are and where you’re going.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.boldSubtitle}>Track with Confidence</Text>
          <Text style={styles.description}>
            Accurate, up-to-date location information at your fingertips.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.boldSubtitle}>Safe & Secure</Text>
          <Text style={styles.description}>
            Your privacy is our priority — your location data stays protected.
          </Text>
        </View>

        <View style={styles.bulletItem}>
          <Text style={styles.boldSubtitle}>Easy to Use</Text>
          <Text style={styles.description}>
            Simple interface designed for seamless tracking on the go.
          </Text>
        </View>
      </View>
      <Text style={styles.cta}>
        Get started now and take control of your journey with Tracker!
      </Text>

      <View style={styles.containerFooter}>
        <Text style={styles.copyright}>©</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://najwer23.github.io")}
        >
          <Text style={styles.link}>najwer23.github.io</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  copyright: {
    fontSize: 16,
    color: "#555",
    marginRight: 6,
    marginTop: 20,
  },
  link: {
    color: "black",
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
    textDecorationLine: "underline",
    marginTop: 40,
  },
  boldSubtitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#007AFF",
    textAlign: "left",
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: "#555",
    textAlign: "left",
    paddingHorizontal: 10,
  },
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  bulletList: {
    marginBottom: 50,
    marginTop: 50,
  },
  bulletItem: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    lineHeight: 22,
  },
  cta: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
  },
});
