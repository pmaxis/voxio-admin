import type { Client } from '@/entities/client/types';
import type { File } from '@/entities/file/types';

export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface Job {
  id: string;
  status: JobStatus;
  duration: number | null;
  clientId: string;
  inputFileId: string | null;
  outputFileId: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  inputFile?: File | null;
  outputFile?: File | null;
}
