import { configApiOrigin } from "@/config/configApiOrigin";
import { configFetch, ResponseBase } from "@/config/configFetch";
import SessionStorage from "react-native-session-storage";

export const queryLogout = async (): Promise<ResponseBase> => {
  const url = new URL(`${configApiOrigin()}/auth/jwt/logout`);
  const options = { ...configFetch({ method: "POST" }) };
  const response = await fetch(url, options);
  const data = await response.json();

  SessionStorage.removeItem("tokenJWTaccess");

  if (data.error) {
    throw Error(data.message);
  }

  return data;
};
