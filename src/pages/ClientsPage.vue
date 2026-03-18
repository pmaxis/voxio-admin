<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до списку клієнтів.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Клієнти</h2>
          <Button v-if="canCreate" :to="{ name: 'clientCreate' }" variant="secondary">
            Додати клієнта
          </Button>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="clients.length === 0" class="text-zinc-500 text-sm">
          Клієнтів поки немає.
        </div>
        <Table v-else :items="clients" key-field="id">
          <template #head>
            <TableTh>Telegram ID</TableTh>
            <TableTh>Username</TableTh>
            <TableTh>Секунд</TableTh>
            <TableTh>Створено</TableTh>
            <TableTh v-if="canUpdate || canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: c }">
            <TableTd>
              <router-link
                v-if="canUpdate"
                :to="{ name: 'clientEdit', params: { id: c.id } }"
                class="font-mono text-sm text-zinc-300 hover:text-amber-400 hover:underline"
              >
                {{ c.telegramId }}
              </router-link>
              <span v-else class="font-mono text-sm text-zinc-300">{{ c.telegramId }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200">{{ c.username ?? '—' }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200 font-medium">{{ c.balance ?? 0 }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400 text-sm">{{ formatDate(c.createdAt) }}</span>
            </TableTd>
            <TableTd v-if="canUpdate || canDelete" align="end">
              <Dropdown>
                <DropdownItem v-if="canUpdate" :to="{ name: 'clientEdit', params: { id: c.id } }">
                  Редагувати
                </DropdownItem>
                <DropdownItem v-if="canDelete" danger @click="confirmDelete(c)">
                  Видалити
                </DropdownItem>
              </Dropdown>
            </TableTd>
          </template>
        </Table>
      </template>
    </div>

    <ConfirmDeleteModal v-model="deleteTarget" @confirm="handleDelete">
      <template #message>
        клієнта {{ deleteTarget?.telegramId }}
      </template>
    </ConfirmDeleteModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import {
  Button,
  ErrorMessage,
  Table,
  TableTh,
  TableTd,
  Dropdown,
  DropdownItem,
  ConfirmDeleteModal,
} from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useClientsStore } from '@/features/clients';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Client } from '@/entities/client/types';

const { can } = usePermissions();
const canRead = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canCreate = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canUpdate = computed(() => can(PERMISSIONS.MANAGE_ALL));
const canDelete = computed(() => can(PERMISSIONS.MANAGE_ALL));

const { successWithUndo, error: showError } = useToast();
const clientsStore = useClientsStore();
const { clients, loading, error } = storeToRefs(clientsStore);

const deleteTarget = ref<Client | null>(null);

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

async function load() {
  if (!canRead.value) return;
  try {
    await clientsStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити клієнтів');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const telegramId = deleteTarget.value.telegramId;
  const removed = clientsStore.removeFromList(id);
  deleteTarget.value = null;
  clientsStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await clientsStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo(`Клієнта ${telegramId} видалено`, () => {
    clearTimeout(timeoutId);
    clientsStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(client: Client) {
  deleteTarget.value = client;
}

onMounted(load);
</script>
