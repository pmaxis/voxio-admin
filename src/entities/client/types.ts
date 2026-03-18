export interface Client {
  id: string;
  telegramId: string;
  username: string | null;
  balance?: number;
  createdAt: string;
  updatedAt: string;
}
