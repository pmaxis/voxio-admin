import { apiClient } from '@/shared/api/client';
import type { User } from '@/entities/user/types';

export type UpdateProfilePayload = {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  thirdName?: string;
};

export const profileApi = {
  getProfile: () => apiClient.get<User>('/profile'),
  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.patch<User>('/profile', payload),
};
