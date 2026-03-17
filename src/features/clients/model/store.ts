import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { clientsApi } from '@/features/clients/api/clients.api';
import type { Client } from '@/entities/client/types';
import type { CreateClientPayload, UpdateClientPayload } from '@/features/clients/model/types';

export const useClientsStore = defineStore('clients', () => {
  const list = ref<Client[]>([]);
  const loading = ref(false);
  const error = ref('');

  const clients = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await clientsApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити клієнтів';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOne(id: string): Promise<Client> {
    error.value = '';
    const item = await clientsApi.getOne(id);
    const index = list.value.findIndex((c) => c.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    } else {
      list.value = [...list.value, item];
    }
    return item;
  }

  async function create(payload: CreateClientPayload): Promise<Client> {
    error.value = '';
    const item = await clientsApi.create(payload);
    list.value = [...list.value, item];
    return item;
  }

  async function update(id: string, payload: UpdateClientPayload): Promise<Client> {
    error.value = '';
    const item = await clientsApi.update(id, payload);
    const index = list.value.findIndex((c) => c.id === id);
    if (index >= 0) {
      list.value = [...list.value.slice(0, index), item, ...list.value.slice(index + 1)];
    }
    return item;
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await clientsApi.delete(id);
    list.value = list.value.filter((c) => c.id !== id);
  }

  function removeFromList(id: string): { item: Client; index: number } | undefined {
    const index = list.value.findIndex((c) => c.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((c) => c.id !== id);
    return { item, index };
  }

  function restoreAt(item: Client, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function setError(msg: string) {
    error.value = msg;
  }

  function clearError() {
    error.value = '';
  }

  return {
    clients,
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
