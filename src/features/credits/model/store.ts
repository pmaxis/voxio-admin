import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { creditsApi } from '@/features/credits/api/credits.api';
import type { Credit } from '@/entities/credit/types';

export const useCreditsStore = defineStore('credits', () => {
  const list = ref<Credit[]>([]);
  const loading = ref(false);
  const error = ref('');

  const credits = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await creditsApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити кредити';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await creditsApi.delete(id);
    list.value = list.value.filter((c) => c.id !== id);
  }

  function removeFromList(id: string): { item: Credit; index: number } | undefined {
    const index = list.value.findIndex((c) => c.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((c) => c.id !== id);
    return { item, index };
  }

  function restoreAt(item: Credit, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function clearError() {
    error.value = '';
  }

  return {
    credits,
    loading,
    error,
    fetchAll,
    remove,
    removeFromList,
    restoreAt,
    clearError,
  };
});
