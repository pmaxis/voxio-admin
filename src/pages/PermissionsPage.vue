<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до списку дозволів.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Дозволи (permissions)</h2>
          <Button v-if="canCreate" :to="{ name: 'permissionCreate' }" variant="secondary">
            Додати дозвіл
          </Button>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="permissions.length === 0" class="text-zinc-500 text-sm">
          Дозволів поки немає.
        </div>
        <Table v-else :items="permissions" key-field="id">
          <template #head>
            <TableTh>Ключ</TableTh>
            <TableTh v-if="canUpdate || canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: perm }">
            <TableTd>
              <router-link
                v-if="canUpdate"
                :to="{ name: 'permissionEdit', params: { id: perm.id } }"
                class="font-mono text-sm font-medium text-zinc-200 hover:text-amber-400 hover:underline"
              >
                {{ perm.key }}
              </router-link>
              <span v-else class="font-mono text-sm font-medium text-zinc-200">{{ perm.key }}</span>
              <span v-if="perm.description" class="ml-2 text-sm text-zinc-500">
                — {{ perm.description }}
              </span>
            </TableTd>
            <TableTd v-if="canUpdate || canDelete" align="end">
              <Dropdown>
                <DropdownItem :to="{ name: 'permissionEdit', params: { id: perm.id } }">
                  Редагувати
                </DropdownItem>
                <DropdownItem v-if="canDelete" danger @click="confirmDelete(perm)">
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
        дозвіл <span class="font-mono">{{ deleteTarget?.key }}</span>
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
import { usePermissionsStore } from '@/features/permissions';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Permission } from '@/entities/permission/types';

const { can } = usePermissions();
const canRead = computed(() => can(PERMISSIONS.PERMISSIONS_READ));
const canCreate = computed(() => can(PERMISSIONS.PERMISSIONS_CREATE));
const canUpdate = computed(() => can(PERMISSIONS.PERMISSIONS_UPDATE));
const canDelete = computed(() => can(PERMISSIONS.PERMISSIONS_DELETE));

const { successWithUndo, error: showError } = useToast();
const permissionsStore = usePermissionsStore();
const { permissions, loading, error } = storeToRefs(permissionsStore);

const deleteTarget = ref<Permission | null>(null);

async function load() {
  if (!canRead.value) return;
  try {
    await permissionsStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити дозволи');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const key = deleteTarget.value.key;
  const removed = permissionsStore.removeFromList(id);
  deleteTarget.value = null;
  permissionsStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await permissionsStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo(`Дозвіл ${key} видалено`, () => {
    clearTimeout(timeoutId);
    permissionsStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(perm: Permission) {
  deleteTarget.value = perm;
}

onMounted(load);
</script>
