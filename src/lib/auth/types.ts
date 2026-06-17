export interface AuthUser {
  id: string;
  username: string;
  name: string;
  designation?: string;
  profileImg?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
}
