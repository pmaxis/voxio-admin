<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до кредитів.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Кредити</h2>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="credits.length === 0" class="text-zinc-500 text-sm">
          Кредитів поки немає.
        </div>
        <Table v-else :items="credits" key-field="id">
          <template #head>
            <TableTh>ID</TableTh>
            <TableTh>Сума</TableTh>
            <TableTh>Тип</TableTh>
            <TableTh>Клієнт</TableTh>
            <TableTh>Job</TableTh>
            <TableTh>Створено</TableTh>
            <TableTh v-if="canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: c }">
            <TableTd>
              <span class="font-mono text-sm text-zinc-300">{{ c.id.slice(0, 8) }}…</span>
            </TableTd>
            <TableTd>
              <span
                class="text-sm font-medium"
                :class="c.amount >= 0 ? 'text-emerald-400' : 'text-red-400'"
              >
                {{ c.amount >= 0 ? '+' : '' }}{{ c.amount }}
              </span>
            </TableTd>
            <TableTd>
              <Chip :color="typeColor(c.type)" :is-light-theme="isLightTheme">
                {{ typeLabel(c.type) }}
              </Chip>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200">{{ c.client?.telegramId ?? c.clientId }}</span>
            </TableTd>
            <TableTd>
              <span class="font-mono text-sm text-zinc-400">
                {{ c.jobId ? `${c.jobId.slice(0, 8)}…` : '—' }}
              </span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatDate(c.createdAt) }}</span>
            </TableTd>
            <TableTd v-if="canDelete" align="end">
              <Dropdown>
                <DropdownItem danger @click="confirmDelete(c)">Видалити</DropdownItem>
              </Dropdown>
            </TableTd>
          </template>
        </Table>
      </template>
    </div>

    <ConfirmDeleteModal v-model="deleteTarget" @confirm="handleDelete">
      <template #message>
        кредит {{ deleteTarget?.id }}
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
import { useCreditsStore } from '@/features/credits';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Credit, CreditType } from '@/entities/credit/types';

const { can } = usePermissions();
const themeStore = useThemeStore();
const isLightTheme = computed(() => themeStore.theme === 'light');
const canRead = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canDelete = computed(() => can(PERMISSIONS.MANAGE_ALL));

const { successWithUndo, error: showError } = useToast();
const creditsStore = useCreditsStore();
const { credits, loading, error } = storeToRefs(creditsStore);

const deleteTarget = ref<Credit | null>(null);

function typeLabel(type: CreditType): string {
  const labels: Record<CreditType, string> = {
    BONUS: 'Бонус',
    USAGE: 'Використання',
    PURCHASE: 'Покупка',
    REFUND: 'Повернення',
  };
  return labels[type] ?? type;
}

function typeColor(type: CreditType): 'green' | 'blue' | 'amber' | 'red' {
  switch (type) {
    case 'BONUS':
      return 'green';
    case 'PURCHASE':
      return 'blue';
    case 'REFUND':
      return 'amber';
    case 'USAGE':
      return 'red';
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
    await creditsStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити кредити');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const removed = creditsStore.removeFromList(id);
  deleteTarget.value = null;
  creditsStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await creditsStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo('Кредит видалено', () => {
    clearTimeout(timeoutId);
    creditsStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(credit: Credit) {
  deleteTarget.value = credit;
}

onMounted(load);
</script>
