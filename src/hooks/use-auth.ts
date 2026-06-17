'use client';

import { useState, useSyncExternalStore } from 'react';
import { logoutRemote } from '@/lib/auth/api';
import {
  clearStoredUser,
  getStoredUser,
  subscribeStoredUser,
  getAccessToken,
} from '@/lib/auth/storage';
import { LOGIN_PATH } from '@/lib/auth/config';

const noopSubscribe = () => () => {};

export function useAuth() {
  const user = useSyncExternalStore(
    subscribeStoredUser,
    getStoredUser,
    () => null,
  );
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    const token = getAccessToken();
    clearStoredUser();
    if (token) await logoutRemote(token).catch(() => {});
    window.location.href = LOGIN_PATH;
  };

  return { user, hydrated, logout, isLoggingOut };
}
