import type { Client } from '@/entities/client/types';
import type { Job } from '@/entities/job/types';

export type CreditType = 'BONUS' | 'USAGE' | 'PURCHASE' | 'REFUND';

export interface Credit {
  id: string;
  amount: number;
  type: CreditType;
  clientId: string;
  jobId: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  job?: Job | null;
}
