export const API_BASE = `https://${process.env.NEXT_PUBLIC_API_PREFIX ?? ''}api.10minuteschool${process.env.NEXT_PUBLIC_DOMAIN}`;

export const SOURCE_PLATFORM = process.env.NEXT_PUBLIC_TENMS_SOURCE_PLATFORM;

export type ServiceName = keyof typeof API_SERVICES;

export const API_SERVICES = {
  auth: `${API_BASE}/auth/v1`,
} as const;

export const API_ROUTES = {
  auth: {
    login: '/admin/login',
    oauth: '/admin/oauth/login',
    refresh: '/admin/token/refresh',
    logout: '/logout',
  },
} as const satisfies Record<ServiceName, Record<string, string>>;

export function apiUrl<S extends ServiceName>(
  service: S,
  route: keyof (typeof API_ROUTES)[S],
): string {
  return `${API_SERVICES[service]}${API_ROUTES[service][route]}`;
}
