<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до сховища.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Сховище</h2>
          <div class="flex gap-1 rounded-lg border border-zinc-700 bg-zinc-800/50 p-1">
            <button
              type="button"
              :class="[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'input'
                  ? 'bg-zinc-600 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200',
              ]"
              @click="activeTab = 'input'"
            >
              Вхідні
            </button>
            <button
              type="button"
              :class="[
                'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                activeTab === 'output'
                  ? 'bg-zinc-600 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200',
              ]"
              @click="activeTab = 'output'"
            >
              Вихідні
            </button>
          </div>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="currentFiles.length === 0" class="text-zinc-500 text-sm">
          Файлів поки немає.
        </div>
        <Table v-else :items="currentFiles" key-field="id">
          <template #head>
            <TableTh>Файл</TableTh>
            <TableTh>Тип</TableTh>
            <TableTh>Розмір</TableTh>
            <TableTh>Створено</TableTh>
            <TableTh v-if="canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: f }">
            <TableTd>
              <span class="font-mono text-sm text-zinc-300 break-all">{{ f.url }}</span>
            </TableTd>
            <TableTd>
              <Chip
                :color="f.type === 'INPUT_AUDIO' ? 'blue' : 'green'"
                :is-light-theme="isLightTheme"
              >
                {{ fileTypeLabel(f.type) }}
              </Chip>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatSize(f.size) }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatDate(f.createdAt) }}</span>
            </TableTd>
            <TableTd v-if="canDelete" align="end">
              <Dropdown>
                <DropdownItem danger @click="confirmDelete(f)">Видалити</DropdownItem>
              </Dropdown>
            </TableTd>
          </template>
        </Table>
      </template>
    </div>

    <ConfirmDeleteModal v-model="deleteTarget" @confirm="handleDelete">
      <template #message>
        файл {{ deleteTarget?.url }}
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
import { useFilesStore } from '@/features/files';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { File } from '@/entities/file/types';

const { can } = usePermissions();
const themeStore = useThemeStore();
const isLightTheme = computed(() => themeStore.theme === 'light');
const canRead = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canDelete = computed(() => can(PERMISSIONS.MANAGE_ALL));

const { successWithUndo, error: showError } = useToast();
const filesStore = useFilesStore();
const { files, loading, error } = storeToRefs(filesStore);

const activeTab = ref<'input' | 'output'>('input');

const inputFiles = computed(() => files.value.filter((f) => f.type === 'INPUT_AUDIO'));
const outputFiles = computed(() => files.value.filter((f) => f.type === 'OUTPUT_AUDIO'));
const currentFiles = computed(() =>
  activeTab.value === 'input' ? inputFiles.value : outputFiles.value,
);

const deleteTarget = ref<File | null>(null);

function fileTypeLabel(type: string): string {
  return type === 'INPUT_AUDIO' ? 'Вхідне аудіо' : 'Вихідне аудіо';
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    await filesStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити файли');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const url = deleteTarget.value.url;
  const removed = filesStore.removeFromList(id);
  deleteTarget.value = null;
  filesStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await filesStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo(`Файл ${url} видалено`, () => {
    clearTimeout(timeoutId);
    filesStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(file: File) {
  deleteTarget.value = file;
}

onMounted(load);
</script>
