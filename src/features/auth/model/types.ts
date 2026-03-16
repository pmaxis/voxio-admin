import type { User } from '@/entities/user/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface AuthUser extends User {
  /** Ключі дозволів з access token payload */
  permissions?: string[];
}
