import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/features/auth';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import AppLayout from '@/widgets/layout/AppLayout.vue';

const usersRouteNames = ['users', 'userCreate', 'userEdit'] as const;
const rolesRouteNames = ['roles', 'roleCreate', 'roleEdit'] as const;
const permissionsRouteNames = ['permissions', 'permissionCreate', 'permissionEdit'] as const;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/pages/DashboardPage.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/pages/SettingsPage.vue'),
        },
        {
          path: 'roles/new',
          name: 'roleCreate',
          component: () => import('@/pages/RoleFormPage.vue'),
        },
        {
          path: 'roles/:id/edit',
          name: 'roleEdit',
          component: () => import('@/pages/RoleFormPage.vue'),
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/pages/RolesPage.vue'),
        },
        {
          path: 'permissions/new',
          name: 'permissionCreate',
          component: () => import('@/pages/PermissionFormPage.vue'),
        },
        {
          path: 'permissions/:id/edit',
          name: 'permissionEdit',
          component: () => import('@/pages/PermissionFormPage.vue'),
        },
        {
          path: 'permissions',
          name: 'permissions',
          component: () => import('@/pages/PermissionsPage.vue'),
        },
        {
          path: 'users/new',
          name: 'userCreate',
          component: () => import('@/pages/UserFormPage.vue'),
        },
        {
          path: 'users/:id/edit',
          name: 'userEdit',
          component: () => import('@/pages/UserFormPage.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/pages/UsersPage.vue'),
        },
        {
          path: 'my-account',
          name: 'myAccount',
          component: () => import('@/pages/MyAccountPage.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuth();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    await auth.init();
  }
  const isAuth = auth.isAuthenticated;
  if (to.meta.requiresAuth && !isAuth) {
    next({ name: 'login', query: { redirect: to.fullPath } });
    return;
  }
  if (to.meta.guest && isAuth) {
    next({ name: 'dashboard' });
    return;
  }
  // Адмінка лише для користувачів з manage.all — інакше розлогінити та показати сповіщення на логіні
  if (isAuth && to.meta.requiresAuth) {
    const { can } = usePermissions();
    if (!can(PERMISSIONS.MANAGE_ALL)) {
      await auth.logout();
      next({ name: 'login', query: { reason: 'no_admin_access' } });
      return;
    }
  }
  // Доступ до розділів за пермішенами
  const name = to.name as string;
  if (isAuth && usersRouteNames.includes(name as (typeof usersRouteNames)[number])) {
    const { can } = usePermissions();
    const allowed =
      name === 'users'
        ? can(PERMISSIONS.USERS_READ)
        : name === 'userCreate'
          ? can(PERMISSIONS.USERS_CREATE)
          : can(PERMISSIONS.USERS_UPDATE);
    if (!allowed) {
      next({ name: 'dashboard' });
      return;
    }
  }

  if (isAuth && rolesRouteNames.includes(name as (typeof rolesRouteNames)[number])) {
    const { can } = usePermissions();
    const allowed =
      name === 'roles'
        ? can(PERMISSIONS.ROLES_READ)
        : name === 'roleCreate'
          ? can(PERMISSIONS.ROLES_CREATE)
          : can(PERMISSIONS.ROLES_UPDATE);
    if (!allowed) {
      next({ name: 'dashboard' });
      return;
    }
  }

  if (isAuth && permissionsRouteNames.includes(name as (typeof permissionsRouteNames)[number])) {
    const { can } = usePermissions();
    const allowed =
      name === 'permissions'
        ? can(PERMISSIONS.PERMISSIONS_READ)
        : name === 'permissionCreate'
          ? can(PERMISSIONS.PERMISSIONS_CREATE)
          : can(PERMISSIONS.PERMISSIONS_UPDATE);
    if (!allowed) {
      next({ name: 'dashboard' });
      return;
    }
  }

  next();
});

export default router;
