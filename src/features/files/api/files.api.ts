import { apiClient } from '@/shared/api/client';
import type { File } from '@/entities/file/types';

export const filesApi = {
  getAll: () => apiClient.get<File[]>('/files'),
  getOne: (id: string) => apiClient.get<File>(`/files/${id}`),
  delete: (id: string) => apiClient.delete(`/files/${id}`),
};
