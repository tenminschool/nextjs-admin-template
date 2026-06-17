export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export const STORAGE_KEYS = {
  user: 'admin_user',
  accessToken: 'admin_access_token',
} as const;

export const LOGIN_PATH = '/login';
export const POST_LOGIN_REDIRECT = '/dashboard';
