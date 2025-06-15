import { configApiOrigin } from "@/config/configApiOrigin";
import { configFetch, ResponseBase } from "@/config/configFetch";
import SessionStorage from "react-native-session-storage";

export const queryLogout = async (): Promise<ResponseBase> => {
  const url = new URL(`${configApiOrigin()}/auth/jwt/logout`);
  const options = { ...configFetch({ method: "POST" }) };
  const response = await fetch(url, options);
  const data = await response.json();

   try {
    console.log("removed!", SessionStorage)
    SessionStorage.removeItem("tokenJWTaccess");
    
  } catch (e) {
    console.error("Failed to remove token from session storage", e);
  }

  if (data.error) {
    console.log(4545555,data)
    throw Error(data.message);
  }
  
  return data;
};
