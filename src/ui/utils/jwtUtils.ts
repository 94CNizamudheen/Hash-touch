
export function decodeJWT<T = any>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded) as T;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export interface JWTPayload {
  email: string;
  name: string;
  sub: string;
  roleId: string;
  admin: boolean;
  enable2FA: boolean;
  location_ids: string[];
  iat: number;
  exp: number;
}
