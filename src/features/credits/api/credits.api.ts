import { apiClient } from '@/shared/api/client';
import type { Credit } from '@/entities/credit/types';

export const creditsApi = {
  getAll: () => apiClient.get<Credit[]>('/credits'),
  getOne: (id: string) => apiClient.get<Credit>(`/credits/${id}`),
  delete: (id: string) => apiClient.delete(`/credits/${id}`),
};
