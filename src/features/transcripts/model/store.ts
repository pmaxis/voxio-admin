import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transcriptsApi } from '@/features/transcripts/api/transcripts.api';
import type { Transcript } from '@/entities/transcript/types';

export const useTranscriptsStore = defineStore('transcripts', () => {
  const list = ref<Transcript[]>([]);
  const loading = ref(false);
  const error = ref('');

  const transcripts = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await transcriptsApi.getAll();
    } catch (e: unknown) {
      error.value =
        e instanceof Error ? e.message : 'Не вдалося завантажити транскрипти';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await transcriptsApi.delete(id);
    list.value = list.value.filter((t) => t.id !== id);
  }

  function removeFromList(id: string): { item: Transcript; index: number } | undefined {
    const index = list.value.findIndex((t) => t.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((t) => t.id !== id);
    return { item, index };
  }

  function restoreAt(item: Transcript, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function clearError() {
    error.value = '';
  }

  return {
    transcripts,
    loading,
    error,
    fetchAll,
    remove,
    removeFromList,
    restoreAt,
    clearError,
  };
});
