import { apiClient } from '@/shared/api/client';
import type { Transcript } from '@/entities/transcript/types';

export const transcriptsApi = {
  getAll: () => apiClient.get<Transcript[]>('/transcripts'),
  getOne: (id: string) => apiClient.get<Transcript>(`/transcripts/${id}`),
  delete: (id: string) => apiClient.delete(`/transcripts/${id}`),
};
