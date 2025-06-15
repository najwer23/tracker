import { JwtContext } from "@/api/jwt.context";
import { useLocationTracker } from "@/locationTracker/LocationTracker.context";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function Save() {
  const { isAuthenticated } = useContext(JwtContext);
  const router = useRouter();

  const {
    duration,
    totalDistance,
    setLocationsList,
    setDuration,
    setTotalDistance,
  } = useLocationTracker();

  if (!isAuthenticated) {
    // Show login prompt card
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Please log in to access Save feature.
        </Text>
        <Button
          title="Go to Login"
          onPress={() =>
            router.push({
              pathname: "/auth/login",
              params: { redirectTo: "map-tracker" },
            })
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Welcome to Save screen!</Text>
      <Text>{duration}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
});
