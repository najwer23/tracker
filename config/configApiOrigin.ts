import Constants from "expo-constants";

export const configApiOrigin = (): string => {
  const extra = Constants.expoConfig?.extra;

  if (__DEV__) {
    return extra?.NAJWER23API_FASTIFY_ORIGIN_DEV ?? "";
  } else {
    return extra?.NAJWER23API_FASTIFY_ORIGIN_PROD ?? "";
  }
};
