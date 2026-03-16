import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { permissionsApi } from '@/features/permissions/api/permissions.api';
import type { Permission } from '@/entities/permission/types';
import type {
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from '@/features/permissions/model/types';

export const usePermissionsStore = defineStore('permissions', () => {
  const list = ref<Permission[]>([]);
  const loading = ref(false);
  const error = ref('');

  const permissions = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await permissionsApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити дозволи';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string): Promise<Permission> {
    error.value = '';
    const item = await permissionsApi.getOne(id);
    const index = list.value.findIndex((p) => p.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    } else {
      list.value = [...list.value, item];
    }
    return item;
  }

  async function create(payload: CreatePermissionPayload): Promise<Permission> {
    error.value = '';
    const item = await permissionsApi.create(payload);
    list.value = [...list.value, item];
    return item;
  }

  async function update(id: string, payload: UpdatePermissionPayload): Promise<Permission> {
    error.value = '';
    const item = await permissionsApi.update(id, payload);
    const index = list.value.findIndex((p) => p.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    }
    return item;
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await permissionsApi.delete(id);
    list.value = list.value.filter((p) => p.id !== id);
  }

  function removeFromList(id: string): { item: Permission; index: number } | undefined {
    const index = list.value.findIndex((p) => p.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((p) => p.id !== id);
    return { item, index };
  }

  function restoreAt(item: Permission, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function setError(msg: string) {
    error.value = msg;
  }

  function clearError() {
    error.value = '';
  }

  return {
    permissions,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    removeFromList,
    restoreAt,
    setError,
    clearError,
  };
});
