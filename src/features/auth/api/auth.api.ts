import { apiClient } from '@/shared/api/client';
import type { LoginPayload, LoginResponse } from '../model/types';

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.postWithCredentials<LoginResponse>('/auth/login', payload),
  refresh: () => apiClient.postWithCredentials<LoginResponse>('/auth/refresh'),
  logout: () => apiClient.postWithCredentials('/auth/logout'),
};
