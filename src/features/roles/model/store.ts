import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { rolesApi } from '@/features/roles/api/roles.api';
import type { Role } from '@/entities/role/types';
import type { CreateRolePayload, UpdateRolePayload } from '@/features/roles/model/types';

export const useRolesStore = defineStore('roles', () => {
  const list = ref<Role[]>([]);
  const loading = ref(false);
  const error = ref('');

  const roles = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await rolesApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити ролі';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string): Promise<Role> {
    error.value = '';
    const item = await rolesApi.getOne(id);
    const index = list.value.findIndex((r) => r.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    } else {
      list.value = [...list.value, item];
    }
    return item;
  }

  async function create(payload: CreateRolePayload): Promise<Role> {
    error.value = '';
    const item = await rolesApi.create(payload);
    list.value = [...list.value, item];
    return item;
  }

  async function update(id: string, payload: UpdateRolePayload): Promise<Role> {
    error.value = '';
    const item = await rolesApi.update(id, payload);
    const index = list.value.findIndex((r) => r.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    }
    return item;
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await rolesApi.delete(id);
    list.value = list.value.filter((r) => r.id !== id);
  }

  function removeFromList(id: string): { item: Role; index: number } | undefined {
    const index = list.value.findIndex((r) => r.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((r) => r.id !== id);
    return { item, index };
  }

  function restoreAt(item: Role, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  async function addPermission(roleId: string, permissionId: string): Promise<Role> {
    error.value = '';
    await rolesApi.addPermission(roleId, permissionId);
    return await fetchOne(roleId);
  }

  async function deletePermission(roleId: string, permissionId: string): Promise<Role> {
    error.value = '';
    await rolesApi.deletePermission(roleId, permissionId);
    return await fetchOne(roleId);
  }

  function setError(msg: string) {
    error.value = msg;
  }

  function clearError() {
    error.value = '';
  }

  return {
    roles,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    removeFromList,
    restoreAt,
    addPermission,
    deletePermission,
    setError,
    clearError,
  };
});
