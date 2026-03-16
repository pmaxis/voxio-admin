import { apiClient } from '@/shared/api/client';
import type { Permission } from '@/entities/permission/types';
import type {
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from '@/features/permissions/model/types';

export const permissionsApi = {
  getAll: () => apiClient.get<Permission[]>('/permissions'),
  getOne: (id: string) => apiClient.get<Permission>(`/permissions/${id}`),
  create: (payload: CreatePermissionPayload) => apiClient.post<Permission>('/permissions', payload),
  update: (id: string, payload: UpdatePermissionPayload) =>
    apiClient.patch<Permission>(`/permissions/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/permissions/${id}`),
};
