import { setAuthGetter } from '@/shared/api/client';
import { useAuth } from '@/features/auth';

/** Реєструє отримувач Bearer-токена для API-клієнта. */
export function initApiProvider(): void {
  setAuthGetter(() => useAuth().getToken());
}
