<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div v-if="!canRead" class="text-zinc-500 text-sm">
        У вас немає доступу до списку користувачів.
      </div>
      <template v-else>
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-medium text-zinc-200">Користувачі</h2>
          <Button v-if="canCreate" :to="{ name: 'userCreate' }" variant="secondary">
            Додати користувача
          </Button>
        </div>

        <ErrorMessage :message="error" class="mb-4" />

        <div v-if="loading" class="text-zinc-400 text-sm">Завантаження…</div>
        <div v-else-if="users.length === 0" class="text-zinc-500 text-sm">
          Користувачів поки немає.
        </div>
        <Table v-else :items="users" key-field="id">
          <template #head>
            <TableTh>Email</TableTh>
            <TableTh>Прізвище</TableTh>
            <TableTh>Імʼя</TableTh>
            <TableTh>По батькові</TableTh>
            <TableTh v-if="canUpdate || canDelete" align="end">Дії</TableTh>
          </template>
          <template #row="{ item: u }">
            <TableTd>
              <router-link
                v-if="canUpdate"
                :to="{ name: 'userEdit', params: { id: u.id } }"
                class="font-medium text-zinc-200 hover:text-amber-400 hover:underline"
              >
                {{ u.email }}
              </router-link>
              <span v-else class="font-medium text-zinc-200">{{ u.email }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200">{{ u.lastName ?? '—' }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-200">{{ u.firstName ?? '—' }}</span>
            </TableTd>
            <TableTd>
              <span class="text-zinc-400">{{ u.thirdName ?? '—' }}</span>
            </TableTd>
            <TableTd v-if="canUpdate || canDelete" align="end">
              <Dropdown>
                <DropdownItem v-if="canUpdate" :to="{ name: 'userEdit', params: { id: u.id } }">
                  Редагувати
                </DropdownItem>
                <DropdownItem v-if="canDelete" danger @click="confirmDelete(u)">
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
        користувача {{ deleteTarget?.email }}
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
import { useUsersStore } from '@/features/users';
import { usePermissions } from '@/shared/composables/usePermissions';
import { PERMISSIONS } from '@/shared/constants/permissions';
import type { User } from '@/entities/user/types';

const { can } = usePermissions();
const canRead = computed(() => can(PERMISSIONS.USERS_READ));
const canCreate = computed(() => can(PERMISSIONS.USERS_CREATE));
const canUpdate = computed(() => can(PERMISSIONS.USERS_UPDATE));
const canDelete = computed(() => can(PERMISSIONS.USERS_DELETE));

const { successWithUndo, error: showError } = useToast();
const usersStore = useUsersStore();
const { users, loading, error } = storeToRefs(usersStore);

const deleteTarget = ref<User | null>(null);

async function load() {
  if (!canRead.value) return;
  try {
    await usersStore.fetchAll();
  } catch (e: unknown) {
    showError(e instanceof Error ? e.message : 'Не вдалося завантажити користувачів');
  }
}

function handleDelete() {
  if (!deleteTarget.value) return;
  const id = deleteTarget.value.id;
  const email = deleteTarget.value.email;
  const removed = usersStore.removeFromList(id);
  deleteTarget.value = null;
  usersStore.clearError();

  if (!removed) return;

  const timeoutId = setTimeout(async () => {
    try {
      await usersStore.remove(id);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : 'Помилка видалення');
    }
  }, 5000);

  successWithUndo(`Користувача ${email} видалено`, () => {
    clearTimeout(timeoutId);
    usersStore.restoreAt(removed.item, removed.index);
  });
}

function confirmDelete(user: User) {
  deleteTarget.value = user;
}

onMounted(load);
</script>
