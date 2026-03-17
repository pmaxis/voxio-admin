import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { filesApi } from '@/features/files/api/files.api';
import type { File } from '@/entities/file/types';

export const useFilesStore = defineStore('files', () => {
  const list = ref<File[]>([]);
  const loading = ref(false);
  const error = ref('');

  const files = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await filesApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити файли';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await filesApi.delete(id);
    list.value = list.value.filter((f) => f.id !== id);
  }

  function removeFromList(id: string): { item: File; index: number } | undefined {
    const index = list.value.findIndex((f) => f.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((f) => f.id !== id);
    return { item, index };
  }

  function restoreAt(item: File, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function clearError() {
    error.value = '';
  }

  return {
    files,
    loading,
    error,
    fetchAll,
    remove,
    removeFromList,
    restoreAt,
    clearError,
  };
});
