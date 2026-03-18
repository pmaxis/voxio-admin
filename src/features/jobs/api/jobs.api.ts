import { apiClient } from '@/shared/api/client';
import type { Job } from '@/entities/job/types';

export const jobsApi = {
  getAll: () => apiClient.get<Job[]>('/jobs'),
  getOne: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
  delete: (id: string) => apiClient.delete(`/jobs/${id}`),
};
