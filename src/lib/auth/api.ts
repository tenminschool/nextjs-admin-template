import { SOURCE_PLATFORM, apiUrl } from '@/lib/api';
import type { AuthTokens, AuthUser } from './types';

interface LoginApiResponse {
  data: {
    token: {
      access_token: string;
      refresh_token: string;
      expires_at: string;
      refresh_expires_at: string;
    };
    user_info: {
      id: string;
      username: string;
      name: string;
      designation?: string;
      profile_img?: string;
    };
  };
}

export class AuthApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function request<T>(
  url: string,
  init: RequestInit & { auth?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-TENMS-SOURCE-PLATFORM': SOURCE_PLATFORM || '',
    ...(init.headers as Record<string, string>),
  };
  if (init.auth) headers['Authorization'] = `Bearer ${init.auth}`;

  const res = await fetch(url, { ...init, headers, cache: 'no-store' });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message =
      body?.error?.message ||
      body?.message ||
      `Request failed with status ${res.status}`;
    throw new AuthApiError(message, res.status);
  }

  return body as T;
}

function mapResponse(res: LoginApiResponse): {
  tokens: AuthTokens;
  user: AuthUser;
} {
  const t = res.data.token;
  const u = res.data.user_info;
  return {
    tokens: {
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      expiresAt: Number(t.expires_at),
      refreshExpiresAt: Number(t.refresh_expires_at),
    },
    user: {
      id: u.id,
      username: u.username,
      name: u.name,
      designation: u.designation,
      profileImg: u.profile_img,
    },
  };
}

export async function loginWithPassword(username: string, password: string) {
  const res = await request<LoginApiResponse>(apiUrl('auth', 'login'), {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return mapResponse(res);
}

export async function loginWithGoogleToken(token: string) {
  const res = await request<LoginApiResponse>(apiUrl('auth', 'oauth'), {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return mapResponse(res);
}

export async function logoutRemote(accessToken: string) {
  try {
    await request(apiUrl('auth', 'logout'), {
      method: 'POST',
      auth: accessToken,
    });
  } catch {
    // Best-effort: local cleanup runs regardless.
  }
}
