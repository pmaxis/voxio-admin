<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до списку ролей.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Ролі</h2>
          <Button v-if="canCreate" :to="{ name: 'roleCreate' }" variant="secondary">
            Додати роль
          </Button>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="roles.length === 0" class="text-zinc-500 text-sm">Ролей поки немає.</div>
        <Table v-else :items="roles" key-field="id">
          <template #head>
            <TableTh>Slug</TableTh>
            <TableTh>Назва</TableTh>
            <TableTh v-if="canUpdate || canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: role }">
            <TableTd>
              <router-link
                v-if="canUpdate"
                :to="{ name: 'roleEdit', params: { id: role.id } }"
                class="font-mono text-sm text-zinc-300 hover:text-amber-400 hover:underline"
              >
                {{ role.slug }}
              </router-link>
              <span v-else class="font-mono text-sm text-zinc-300">{{ role.slug }}</span>
            </TableTd>
            <TableTd>
              <span class="font-medium text-zinc-200">{{ role.name }}</span>
            </TableTd>
            <TableTd v-if="canUpdate || canDelete" align="end">
              <Dropdown>
                <DropdownItem :to="{ name: 'roleEdit', params: { id: role.id } }">
                  Редагувати
                </DropdownItem>
                <DropdownItem v-if="canDelete" danger @click="confirmDelete(role)">
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
        роль {{ deleteTarget?.name }}
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
import { useRolesStore } from '@/features/roles';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { Role } from '@/entities/role/types';

const { can } = usePermissions();
const canRead = computed(() => can(PERMISSIONS.ROLES_READ));
const canCreate = computed(() => can(PERMISSIONS.ROLES_CREATE));
const canUpdate = computed(() => can(PERMISSIONS.ROLES_UPDATE));
const canDelete = computed(() => can(PERMISSIONS.ROLES_DELETE));

const { successWithUndo, error: showError } = useToast();
const rolesStore = useRolesStore();
const { roles, loading, error } = storeToRefs(rolesStore);

const deleteTarget = ref<Role | null>(null);

async function load() {
  if (!canRead.value) return;
  try {
    await rolesStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити ролі');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const name = deleteTarget.value.name;
  const removed = rolesStore.removeFromList(id);
  deleteTarget.value = null;
  rolesStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await rolesStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo(`Роль ${name} видалено`, () => {
    clearTimeout(timeoutId);
    rolesStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(role: Role) {
  deleteTarget.value = role;
}

onMounted(load);
</script>
