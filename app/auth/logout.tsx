import { useEffect } from "react";
import { useFocusEffect, usePathname, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryLogout } from "@/api/logout.query";
import { Spinner } from "@/spinner/Spinner";
import { FormTabParamList } from "@/navigation/Navigation.types";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export default function Logout() {
  const router = useRouter();
  const path = usePathname();
  const navigation = useNavigation<NavigationProp<FormTabParamList>>();

  const { mutate, data } = useMutation({
    mutationKey: ["queryLogout", "queryLogout"],
    mutationFn: queryLogout,
  });

  useEffect(() => {
    if (path == "/auth/logout") {
      mutate();
    }
  }, [path]);

  useEffect(() => {
    if (data?.code === "OK") {
      router.replace("/auth/login");
      router.replace("/");
    }
  }, [data]);

  return <Spinner />;
}
