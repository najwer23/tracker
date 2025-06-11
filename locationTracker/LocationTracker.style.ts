import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  listTitle: { marginTop: 20, fontWeight: "bold", fontSize: 16 },
  mapContainer: {
    flex: 1,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
