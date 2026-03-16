import type { Role } from '@/entities/role/types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  thirdName?: string | null;
  createdAt: string;
  updatedAt: string;
  roles?: Role[];
}
