import { apiClient } from '@/shared/api/client';
import type { Client } from '@/entities/client/types';
import type { CreateClientPayload, UpdateClientPayload } from '@/features/clients/model/types';

export const clientsApi = {
  getAll: () => apiClient.get<Client[]>('/clients'),
  getOne: (id: string) => apiClient.get<Client>(`/clients/${id}`),
  create: (payload: CreateClientPayload) => apiClient.post<Client>('/clients', payload),
  update: (id: string, payload: UpdateClientPayload) =>
    apiClient.patch<Client>(`/clients/${id}`, payload),
  delete: (id: string) => apiClient.delete(`/clients/${id}`),
};
