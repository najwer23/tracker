import { useContext, useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { queryLogout } from "@/api/auth/logout.query";
import { Spinner } from "@/spinner/Spinner";

import { JwtContext } from "@/api/auth/jwt.context";

export default function Logout() {
  const router = useRouter();
  const path = usePathname();
  const { refreshToken } = useContext(JwtContext);

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
      refreshToken();
      router.replace("/");
    }
  }, [data]);

  return <Spinner />;
}
