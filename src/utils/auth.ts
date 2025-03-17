import { BE_LOGIN, BE_MODE } from 'app/constants';
import {
  DEFAULT_AUTHORIZATION_TOKEN_EXPIRATION,
  StorageKeys,
} from 'globalConstants';
import Cookies from 'js-cookie';

let tokenExpiration = DEFAULT_AUTHORIZATION_TOKEN_EXPIRATION;

export function setTokenExpiration(expires: number) {
  tokenExpiration = expires;
}

export function getToken() {
  // qingyang add
  if (BE_MODE && BE_LOGIN) {
    //TODO:
    return `bearer ${Cookies.get('bestudio_token') || 'test_token'}`;
  }
  return Cookies.get(StorageKeys.AuthorizationToken);
}

export function setToken(token: string) {
  Cookies.set(StorageKeys.AuthorizationToken, token, {
    expires: new Date(new Date().getTime() + tokenExpiration),
  });
}

export function removeToken() {
  Cookies.remove(StorageKeys.AuthorizationToken);
}
