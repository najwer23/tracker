import { ActivityIndicator, StyleSheet, View } from "react-native";

export const Spinner = () => {
  return (
    <View style={[styles.container, styles.horizontal]}>
      <ActivityIndicator size={60} color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
});
