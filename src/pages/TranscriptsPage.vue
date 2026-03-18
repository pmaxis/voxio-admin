<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до транскриптів.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Транскрипти</h2>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="transcripts.length === 0" class="text-zinc-500 text-sm">
          Транскриптів поки немає.
        </div>
        <Table v-else :items="transcripts" key-field="id">
          <template #head>
            <TableTh>ID</TableTh>
            <TableTh>Оригінал</TableTh>
            <TableTh>Переклад</TableTh>
            <TableTh>Job</TableTh>
            <TableTh>Клієнт</TableTh>
            <TableTh>Створено</TableTh>
            <TableTh v-if="canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: t }">
            <TableTd>
              <span class="font-mono text-sm text-zinc-300">{{ t.id.slice(0, 8) }}…</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200 line-clamp-2 max-w-xs" :title="t.originalText">
                {{ t.originalText }}
              </span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 line-clamp-2 max-w-xs" :title="t.translatedText ?? ''">
                {{ t.translatedText ?? '—' }}
              </span>
            </TableTd>
            <TableTd>
              <span class="font-mono text-sm text-zinc-400">
                {{ (t.job?.id ?? t.jobId).slice(0, 8) }}…
              </span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">
                {{ t.job?.client?.telegramId ?? '—' }}
              </span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatDate(t.createdAt) }}</span>
            </TableTd>
            <TableTd v-if="canDelete" align="end">
              <Dropdown>
                <DropdownItem danger @click="confirmDelete(t)">Видалити</DropdownItem>
              </Dropdown>
            </TableTd>
          </template>
        </Table>
      </template>
    </div>

    <ConfirmDeleteModal v-model="deleteTarget" @confirm="handleDelete">
      <template #message>
        транскрипт {{ deleteTarget?.id }}
      </template>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  ErrorMessage,
  Table,
  TableTh,
  TableTd,
  Dropdown,
  DropdownItem,
  ConfirmDeleteModal,
} from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useTranscriptsStore } from '@/features/transcripts';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Transcript } from '@/entities/transcript/types';

const { can } = usePermissions();
const canRead = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canDelete = computed(() => can(PERMISSIONS.MANAGE_ALL));

const { successWithUndo, error: showError } = useToast();
const transcriptsStore = useTranscriptsStore();
const { transcripts, loading, error } = storeToRefs(transcriptsStore);

const deleteTarget = ref<Transcript | null>(null);

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
    await transcriptsStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити транскрипти');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const removed = transcriptsStore.removeFromList(id);
  deleteTarget.value = null;
  transcriptsStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await transcriptsStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo('Транскрипт видалено', () => {
    clearTimeout(timeoutId);
    transcriptsStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(transcript: Transcript) {
  deleteTarget.value = transcript;
}

onMounted(load);
</script>
