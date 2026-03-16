/** Ключі дозволів — мають збігатися з бекендом (ability.constants PERMISSIONS). */
export const PERMISSIONS = {
  MANAGE_ALL: 'manage.all',

  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',
  USERS_MANAGE_ROLES: 'users.manage.roles',

  ROLES_READ: 'roles.read',
  ROLES_CREATE: 'roles.create',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',
  ROLES_MANAGE_PERMISSIONS: 'roles.manage.permissions',

  PERMISSIONS_READ: 'permissions.read',
  PERMISSIONS_CREATE: 'permissions.create',
  PERMISSIONS_UPDATE: 'permissions.update',
  PERMISSIONS_DELETE: 'permissions.delete',

  SESSIONS_READ: 'sessions.read',
  SESSIONS_DELETE: 'sessions.delete',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
