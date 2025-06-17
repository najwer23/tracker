import React, { createContext, useState, useEffect, ReactNode } from "react";
import SessionStorage from "react-native-session-storage";
import { usePathname } from "expo-router";

interface JwtContextType {
  tokenLoading: boolean;
  token: string | null;
  isAuthenticated: boolean;
  refreshToken: () => Promise<void>;
}

export const JwtContext = createContext<JwtContextType>({
  tokenLoading: true,
  token: null,
  isAuthenticated: false,
  refreshToken: async () => {},
});

interface JwtProviderProps {
  children: ReactNode;
}

export function JwtProvider({ children }: JwtProviderProps) {
  const path = usePathname();
  const [tokenLoading, setTokenLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  async function fetchToken() {
    const storedToken = await SessionStorage.getItem("tokenJWTaccess");
    if (typeof storedToken === "string") {
      setToken(storedToken);
    } else {
      setToken(null);
    }
    setTokenLoading(false);
  }

  useEffect(() => {
    setTokenLoading(true);
    fetchToken();
  }, [path]);

  const isAuthenticated = !!token;

  return (
    <JwtContext.Provider
      value={{ tokenLoading, token, isAuthenticated, refreshToken: fetchToken }}
    >
      {children}
    </JwtContext.Provider>
  );
}
