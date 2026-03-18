import type { Job } from '@/entities/job/types';

export interface Transcript {
  id: string;
  originalText: string;
  translatedText: string | null;
  jobId: string;
  createdAt: string;
  updatedAt: string;
  job?: Job;
}
