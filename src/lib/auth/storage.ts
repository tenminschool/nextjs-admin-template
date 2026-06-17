import { STORAGE_KEYS } from './config';
import type { AuthUser } from './types';

const STORAGE_EVENT = 'admin:user-storage';

let cachedRaw: string | null = null;
let cachedUser: AuthUser | null = null;

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEYS.user);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedUser;
  cachedRaw = raw;
  try {
    cachedUser = raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.user);
  window.localStorage.removeItem(STORAGE_KEYS.accessToken);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(STORAGE_KEYS.accessToken);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.accessToken, token);
}

export function subscribeStoredUser(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onCrossTab = (event: StorageEvent) => {
    if (event.key === STORAGE_KEYS.user) cb();
  };
  window.addEventListener('storage', onCrossTab);
  window.addEventListener(STORAGE_EVENT, cb);
  return () => {
    window.removeEventListener('storage', onCrossTab);
    window.removeEventListener(STORAGE_EVENT, cb);
  };
}
