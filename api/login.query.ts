import { configApiOrigin } from '@/config/configApiOrigin';
import { configFetch, ResponseBase } from '@/config/configFetch';
import SessionStorage from 'react-native-session-storage';

type QueryLoginResponse = {
  data?: {
    tokenJWTaccess: string;
    tokenJWTrefresh: string;
  };
} & ResponseBase;

export const queryLogin = async (body: Record<string, string>): Promise<QueryLoginResponse> => {
  const url = new URL(`${configApiOrigin()}/auth/jwt/login`);
  const options = { ...configFetch({ method: 'POST', body: body }) };

  const response = await fetch(url, options);

  const data = await response.json();

  if (data.error) {
    throw Error(data.message);
  }

  SessionStorage.setItem('tokenJWTaccess', data.data.tokenJWTaccess);

  return data;
};
