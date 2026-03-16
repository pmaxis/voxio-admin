import { apiClient } from '@/shared/api/client';
import type { Role } from '@/entities/role/types';
import type { CreateRolePayload, UpdateRolePayload } from '@/features/roles/model/types';

export const rolesApi = {
  getAll: () => apiClient.get<Role[]>('/roles'),
  getOne: (id: string) => apiClient.get<Role>(`/roles/${id}`),
  create: (payload: CreateRolePayload) => apiClient.post<Role>('/roles', payload),
  update: (id: string, payload: UpdateRolePayload) =>
    apiClient.patch<Role>(`/roles/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/roles/${id}`),
  addPermission: (roleId: string, permissionId: string) =>
    apiClient.post(`/roles/${roleId}/permissions`, { permissionId }),
  deletePermission: (roleId: string, permissionId: string) =>
    apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`),
};
