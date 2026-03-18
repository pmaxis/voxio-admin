<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до завдань.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Завдання</h2>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="jobs.length === 0" class="text-zinc-500 text-sm">
          Завдань поки немає.
        </div>
        <Table v-else :items="jobs" key-field="id">
          <template #head>
            <TableTh>ID</TableTh>
            <TableTh>Статус</TableTh>
            <TableTh>Клієнт</TableTh>
            <TableTh>Тривалість</TableTh>
            <TableTh>Створено</TableTh>
            <TableTh v-if="canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: j }">
            <TableTd>
              <span class="font-mono text-sm text-zinc-300">{{ j.id.slice(0, 8) }}…</span>
            </TableTd>
            <TableTd>
              <Chip :color="statusColor(j.status)" :is-light-theme="isLightTheme">
                {{ statusLabel(j.status) }}
              </Chip>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200">{{ j.client?.telegramId ?? j.clientId }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">
                {{ j.duration != null ? `${j.duration} с` : '—' }}
              </span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatDate(j.createdAt) }}</span>
            </TableTd>
            <TableTd v-if="canDelete" align="end">
              <Dropdown>
                <DropdownItem danger @click="confirmDelete(j)">Видалити</DropdownItem>
              </Dropdown>
            </TableTd>
          </template>
        </Table>
      </template>
    </div>

    <ConfirmDeleteModal v-model="deleteTarget" @confirm="handleDelete">
      <template #message>
        завдання {{ deleteTarget?.id }}
      </template>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/features/theme/store';
import {
  ErrorMessage,
  Table,
  TableTh,
  TableTd,
  Dropdown,
  DropdownItem,
  ConfirmDeleteModal,
  Chip,
} from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useJobsStore } from '@/features/jobs';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Job, JobStatus } from '@/entities/job/types';

const { can } = usePermissions();
const themeStore = useThemeStore();
const isLightTheme = computed(() => themeStore.theme === 'light');
const canRead = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canDelete = computed(() => can(PERMISSIONS.MANAGE_ALL));

const { successWithUndo, error: showError } = useToast();
const jobsStore = useJobsStore();
const { jobs, loading, error } = storeToRefs(jobsStore);

const deleteTarget = ref<Job | null>(null);

function statusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    QUEUED: 'В черзі',
    PROCESSING: 'Обробка',
    COMPLETED: 'Завершено',
    FAILED: 'Помилка',
  };
  return labels[status] ?? status;
}

function statusColor(status: JobStatus): 'blue' | 'amber' | 'green' | 'red' {
  switch (status) {
    case 'COMPLETED':
      return 'green';
    case 'FAILED':
      return 'red';
    case 'PROCESSING':
      return 'amber';
    default:
      return 'blue';
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

async function load() {
  if (!canRead.value) return;
  try {
    await jobsStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити завдання');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const removed = jobsStore.removeFromList(id);
  deleteTarget.value = null;
  jobsStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await jobsStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo('Завдання видалено', () => {
    clearTimeout(timeoutId);
    jobsStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(job: Job) {
  deleteTarget.value = job;
}

onMounted(load);
</script>
