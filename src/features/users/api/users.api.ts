import { apiClient } from '@/shared/api/client';
import type { User } from '@/entities/user/types';
import type { CreateUserPayload, UpdateUserPayload } from '@/features/users/model/types';

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  getOne: (id: string) => apiClient.get<User>(`/users/${id}`),
  create: (payload: CreateUserPayload) => apiClient.post<User>('/users', payload),
  update: (id: string, payload: UpdateUserPayload) =>
    apiClient.patch<User>(`/users/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  addRole: (userId: string, roleId: string) =>
    apiClient.post(`/users/${userId}/roles`, { roleId }),
  deleteRole: (userId: string, roleId: string) =>
    apiClient.delete(`/users/${userId}/roles/${roleId}`),
};
