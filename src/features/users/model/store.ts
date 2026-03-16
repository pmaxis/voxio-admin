import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usersApi } from '@/features/users/api/users.api';
import type { User } from '@/entities/user/types';
import type { CreateUserPayload, UpdateUserPayload } from '@/features/users/model/types';

export const useUsersStore = defineStore('users', () => {
  const list = ref<User[]>([]);
  const loading = ref(false);
  const error = ref('');

  const users = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await usersApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити користувачів';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string): Promise<User> {
    error.value = '';
    const item = await usersApi.getOne(id);
    const index = list.value.findIndex((u) => u.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    } else {
      list.value = [...list.value, item];
    }
    return item;
  }

  async function create(payload: CreateUserPayload): Promise<User> {
    error.value = '';
    const item = await usersApi.create(payload);
    list.value = [...list.value, item];
    return item;
  }

  async function update(id: string, payload: UpdateUserPayload): Promise<User> {
    error.value = '';
    const item = await usersApi.update(id, payload);
    const index = list.value.findIndex((u) => u.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    }
    return item;
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await usersApi.delete(id);
    list.value = list.value.filter((u) => u.id !== id);
  }

  /** Оптимістичне видалення зі списку (без API). Повертає елемент та індекс для restore. */
  function removeFromList(id: string): { item: User; index: number } | undefined {
    const index = list.value.findIndex((u) => u.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((u) => u.id !== id);
    return { item, index };
  }

  /** Відновлення елемента в список (для undo). */
  function restoreAt(item: User, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  async function addRole(userId: string, roleId: string): Promise<User> {
    error.value = '';
    await usersApi.addRole(userId, roleId);
    return await fetchOne(userId);
  }

  async function deleteRole(userId: string, roleId: string): Promise<User> {
    error.value = '';
    await usersApi.deleteRole(userId, roleId);
    return await fetchOne(userId);
  }

  function setError(msg: string) {
    error.value = msg;
  }

  function clearError() {
    error.value = '';
  }

  return {
    users,
    loading,
    error,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    removeFromList,
    restoreAt,
    addRole,
    deleteRole,
    setError,
    clearError,
  };
});
