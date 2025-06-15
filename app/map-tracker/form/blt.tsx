import { useState, useEffect } from "react";
import { Spinner } from "@/spinner/Spinner";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { lazy, Suspense } from "react";
import { View, StyleSheet } from "react-native";
import { FormTabParamList } from "@/navigation/Navigation.types";

const LocationTracker = lazy(() =>
  Promise.all([
    import("../../../locationTracker/LocationTracker"),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([module]) => module)
);

export default function Blt() {
  const { initialTab } = useLocalSearchParams<{ initialTab?: string }>();
  const navigation = useNavigation<NavigationProp<FormTabParamList>>();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function handleNavigation() {
      setIsLoading(true);
      if (initialTab === "Save") {
        navigation.navigate("Save");
        await router.push({ pathname: "/map-tracker/form/form" });
      }
      timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    handleNavigation();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [initialTab, navigation, router]);

  return (
    <View style={{ flex: 1 }}>
      <Suspense fallback={<Spinner />}>
        <View
          style={{
            flex: 1,
            opacity: isLoading ? 0 : 1,
            pointerEvents: isLoading ? "none" : "auto",
          }}
        >
          <LocationTracker />
        </View>
      </Suspense>

      {isLoading && (
        <View style={styles.spinnerOverlay}>
          <Spinner />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 1000,
  },
});
