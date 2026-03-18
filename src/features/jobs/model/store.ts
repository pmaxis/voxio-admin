import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { jobsApi } from '@/features/jobs/api/jobs.api';
import type { Job } from '@/entities/job/types';

export const useJobsStore = defineStore('jobs', () => {
  const list = ref<Job[]>([]);
  const loading = ref(false);
  const error = ref('');

  const jobs = computed(() => list.value);

  async function fetchAll() {
    loading.value = true;
    error.value = '';
    try {
      list.value = await jobsApi.getAll();
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Не вдалося завантажити завдання';
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: string): Promise<void> {
    error.value = '';
    await jobsApi.delete(id);
    list.value = list.value.filter((j) => j.id !== id);
  }

  function removeFromList(id: string): { item: Job; index: number } | undefined {
    const index = list.value.findIndex((j) => j.id === id);
    if (index < 0) return undefined;
    const item = list.value[index]!;
    list.value = list.value.filter((j) => j.id !== id);
    return { item, index };
  }

  function restoreAt(item: Job, index: number): void {
    list.value = [...list.value.slice(0, index), item, ...list.value.slice(index)];
  }

  function clearError() {
    error.value = '';
  }

  return {
    jobs,
    loading,
    error,
    fetchAll,
    remove,
    removeFromList,
    restoreAt,
    clearError,
  };
});
