import { computed } from 'vue';
import { useAuth } from '@/features/auth';
import type { PermissionName } from '@/shared/constants/permissions';

/**
 * Повертає список пермішенів поточного користувача та функцію can(permission).
 * manage.all дає доступ до всього.
 */
export function usePermissions() {
  const auth = useAuth();

  const permissions = computed(() => auth.user?.permissions ?? []);

  function can(permission: PermissionName): boolean {
    const list = permissions.value;
    if (list.includes('manage.all')) return true;
    return list.includes(permission);
  }

  return { permissions, can };
}
