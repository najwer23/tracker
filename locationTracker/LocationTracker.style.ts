import { StyleSheet } from "react-native";

export const style = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
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
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  containerStats: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
    paddingBottom: 8,
    alignItems: "center", // vertically center items in the row
    justifyContent: "space-between",
  },
  columnLeft: {
    flex: 1,
    justifyContent: "space-around", // align content to top of the column
  },
  distanceText: {
    fontSize: 18,
    fontWeight: "600",
  },
  columnRight: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 20
  },
  buttonWrapper: {
    marginVertical: 6,
  },
  buttonWrapperPlay:{
    backgroundColor: "#228B22"
  },
   buttonWrapperBin:{
    backgroundColor: "red"
  },
  buttonWrapperPause: {
    backgroundColor: "orange"
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonPressed: {
    backgroundColor: "#005BBB", // fallback pressed color for iOS
  },
});
