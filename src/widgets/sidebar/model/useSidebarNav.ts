import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';

export type NavLink = {
  type: 'link';
  name: string;
  label: string;
  to: RouteLocationRaw;
  /** Якщо задано, пункт активний при будь-якому з цих route names */
  routeNames?: string[];
};

export type NavChild = {
  name: string;
  label: string;
  to: RouteLocationRaw;
  routeNames: string[];
};

export type NavGroup = {
  type: 'group';
  id: string;
  label: string;
  children: NavChild[];
};

export type NavItem = NavLink | NavGroup;

const navStructureRaw: NavItem[] = [
  { type: 'link', name: 'dashboard', label: 'Головна', to: { name: 'dashboard' } },
  {
    type: 'link',
    name: 'users',
    label: 'Користувачі',
    to: { name: 'users' },
    routeNames: ['users', 'userCreate', 'userEdit'],
  },
  {
    type: 'group',
    id: 'roles-permissions',
    label: 'Ролі та дозволи',
    children: [
      {
        name: 'roles',
        label: 'Ролі',
        to: { name: 'roles' },
        routeNames: ['roles', 'roleCreate', 'roleEdit'],
      },
      {
        name: 'permissions',
        label: 'Дозволи',
        to: { name: 'permissions' },
        routeNames: ['permissions', 'permissionCreate', 'permissionEdit'],
      },
    ],
  },
];

export function useSidebarNav() {
  const route = useRoute();
  const router = useRouter();
  const { can } = usePermissions();

  const navStructure = computed(() =>
    navStructureRaw
      .filter((item) => {
        if (item.type === 'link' && item.name === 'users') {
          return can(PERMISSIONS.USERS_READ);
        }
        if (item.type === 'group' && item.id === 'roles-permissions') {
          const hasRoles = can(PERMISSIONS.ROLES_READ);
          const hasPermissions = can(PERMISSIONS.PERMISSIONS_READ);
          return hasRoles || hasPermissions;
        }
        return true;
      })
      .map((item) => {
        if (item.type === 'group' && item.id === 'roles-permissions') {
          return {
            ...item,
            children: item.children.filter((child) =>
              child.name === 'roles'
                ? can(PERMISSIONS.ROLES_READ)
                : can(PERMISSIONS.PERMISSIONS_READ),
            ),
          };
        }
        return item;
      })
      .filter((item) => {
        if (item.type === 'group' && item.children.length === 0) return false;
        return true;
      }),
  );

  const openFlyoutId = ref<string | null>(null);

  const openFlyoutGroup = computed(() => {
    if (!openFlyoutId.value) return null;
    const found = navStructure.value.find((i) => i.type === 'group' && i.id === openFlyoutId.value);
    return found && found.type === 'group' ? found : null;
  });

  function isActive(name: string): boolean {
    return route.name === name;
  }

  function isChildActive(child: NavChild): boolean {
    const name = route.name as string;
    return Boolean(name && child.routeNames.includes(name));
  }

  function isGroupActive(group: NavGroup): boolean {
    return group.children.some((child) => isChildActive(child));
  }

  function toggleGroup(group: NavGroup) {
    const firstChild = group.children[0];
    if (openFlyoutId.value === group.id) {
      openFlyoutId.value = null;
    } else if (firstChild) {
      openFlyoutId.value = group.id;
      router.push(firstChild.to);
    }
  }

  function closeFlyout() {
    const firstLink = navStructure.value.find((i) => i.type === 'link');
    if (firstLink?.type === 'link') {
      router.push(firstLink.to);
    }
    openFlyoutId.value = null;
  }

  watch(
    () => route.name,
    (name) => {
      if (!name) return;
      for (const item of navStructure.value) {
        if (
          item.type === 'group' &&
          item.children.some((c) => c.routeNames.includes(name as string))
        ) {
          openFlyoutId.value = item.id;
          return;
        }
      }
    },
    { immediate: true },
  );

  return {
    navStructure,
    openFlyoutId,
    openFlyoutGroup,
    isActive,
    isChildActive,
    isGroupActive,
    toggleGroup,
    closeFlyout,
  };
}
