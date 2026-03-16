<template>
  <div class="w-full">
    <div v-if="loadError" class="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
      <p class="text-red-400">{{ loadError }}</p>
      <router-link
        :to="{ name: 'roles' }"
        class="mt-2 inline-block text-sm text-amber-400 hover:underline"
      >
        ← Назад до списку
      </router-link>
    </div>
    <div v-else class="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="mb-4 flex items-center gap-3">
        <router-link
          :to="{ name: 'roles' }"
          class="text-zinc-400 hover:text-zinc-200 text-sm"
        >
          ← Ролі
        </router-link>
      </div>
      <h2 class="text-base font-medium text-zinc-200 mb-4">
        {{ isEdit ? 'Редагувати роль' : 'Нова роль' }}
      </h2>

      <Form
        v-if="!isEdit || role"
        bordered
        @submit="handleSubmit"
      >
        <FormField label="Slug" field-id="role-slug" size="sm">
          <Input
            v-model="form.slug"
            required
            placeholder="наприклад, admin"
          />
        </FormField>
        <FormField label="Назва" field-id="role-name" size="sm">
          <Input
            v-model="form.name"
            required
            placeholder="наприклад, Адміністратор"
          />
        </FormField>

        <div v-if="isEdit && role" class="mt-6 space-y-3 border-t border-zinc-700 pt-6">
          <div class="flex items-center gap-3">
            <h3 class="text-sm font-medium text-zinc-200">Дозволи ролі</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              class="ml-auto shrink-0"
              aria-label="Додати дозволи"
              @click="openPermissionsModal"
            >
              +
            </Button>
          </div>
          <div class="space-y-2">
            <div
              v-for="item in rolePermissionsDisplay"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
            >
              <span class="font-mono text-sm font-medium text-zinc-200">{{ item.key }}</span>
              <span v-if="item.description" class="ml-2 text-sm text-zinc-500">
                — {{ item.description }}
              </span>
              <Button
                type="button"
                variant="dangerGhost"
                size="sm"
                @click="removePermissionLocal(item.id)"
              >
                Видалити
              </Button>
            </div>
            <p v-if="rolePermissionsDisplay.length === 0" class="text-sm text-zinc-500">
              Дозволів немає. Натисніть «+», щоб обрати дозволи.
            </p>
          </div>
        </div>

        <Teleport to="body">
          <div
            v-if="permissionsModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="permissions-modal-title"
            @click.self="closePermissionsModal"
          >
            <div
              class="w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-xl"
              @click.stop
            >
              <h2
                id="permissions-modal-title"
                class="border-b border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-200"
              >
                Обрати дозволи для ролі
              </h2>
              <div class="min-h-0 flex-1 overflow-y-auto p-4">
                <p v-if="permissionsStore.permissions.length === 0" class="text-sm text-zinc-500">
                  Дозволів немає.
                </p>
                <div v-else class="space-y-1">
                  <label
                    v-for="p in permissionsStore.permissions"
                    :key="p.id"
                    class="flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm transition-colors hover:bg-zinc-800"
                  >
                    <input
                      type="checkbox"
                      :checked="modalSelectedPermissionIds.includes(p.id)"
                      class="h-4 w-4 rounded border-zinc-500 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                      @change="toggleModalPermission(p.id)"
                    />
                    <span class="font-mono text-zinc-200">{{ p.key }}</span>
                    <span v-if="p.description" class="text-zinc-500">— {{ p.description }}</span>
                  </label>
                </div>
              </div>
              <div class="flex justify-end gap-2 border-t border-zinc-700 px-4 py-3">
                <Button type="button" variant="ghost" @click="closePermissionsModal">
                  Скасувати
                </Button>
                <Button type="button" variant="secondary" @click="savePermissionsModal">
                  Зберегти
                </Button>
              </div>
            </div>
          </div>
        </Teleport>

        <ErrorMessage :message="error" />
        <template #actions>
          <Button :to="{ name: 'roles' }" variant="ghost">Скасувати</Button>
          <Button type="submit" variant="secondary" :disabled="submitLoading">
            {{ submitLoading ? 'Збереження…' : 'Зберегти' }}
          </Button>
        </template>
      </Form>
      <div v-else-if="isEdit" class="text-zinc-400 text-sm">Завантаження…</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, Input, FormField, Form, ErrorMessage } from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useRolesStore } from '@/features/roles';
import { usePermissionsStore } from '@/features/permissions';
import type { Role } from '@/entities/role/types';
import type { Permission } from '@/entities/permission/types';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();
const rolesStore = useRolesStore();
const permissionsStore = usePermissionsStore();

const role = ref<Role | null>(null);
const loadError = ref('');
const submitLoading = ref(false);
const error = ref('');
const form = reactive({ slug: '', name: '' });

const assignedPermissionIds = ref<string[]>([]);
const permissionsModalOpen = ref(false);
const modalSelectedPermissionIds = ref<string[]>([]);

const isEdit = computed(() => {
  const id = route.params.id as string;
  return id && id !== 'new';
});

const rolePermissionsDisplay = computed((): Permission[] => {
  return assignedPermissionIds.value
    .map((id) => permissionsStore.permissions.find((p) => p.id === id))
    .filter((p): p is Permission => p != null);
});

async function load() {
  const id = route.params.id as string;
  if (!id || id === 'new') {
    form.slug = '';
    form.name = '';
    role.value = null;
    assignedPermissionIds.value = [];
    loadError.value = '';
    return;
  }
  loadError.value = '';
  role.value = null;
  try {
    role.value = await rolesStore.fetchOne(id);
    form.slug = role.value.slug;
    form.name = role.value.name;
    assignedPermissionIds.value = (role.value.permissions ?? []).map((p) => p.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося завантажити роль';
    loadError.value = msg;
    showError(msg);
  }
}

async function loadPermissions() {
  try {
    await permissionsStore.fetchAll();
  } catch {
    // ignore
  }
}

function openPermissionsModal() {
  modalSelectedPermissionIds.value = [...assignedPermissionIds.value];
  permissionsModalOpen.value = true;
}

function closePermissionsModal() {
  permissionsModalOpen.value = false;
}

function toggleModalPermission(permissionId: string) {
  if (modalSelectedPermissionIds.value.includes(permissionId)) {
    modalSelectedPermissionIds.value = modalSelectedPermissionIds.value.filter((id) => id !== permissionId);
  } else {
    modalSelectedPermissionIds.value = [...modalSelectedPermissionIds.value, permissionId];
  }
}

function savePermissionsModal() {
  assignedPermissionIds.value = [...modalSelectedPermissionIds.value];
  permissionsModalOpen.value = false;
}

function removePermissionLocal(permissionId: string) {
  assignedPermissionIds.value = assignedPermissionIds.value.filter((id) => id !== permissionId);
}

async function handleSubmit() {
  submitLoading.value = true;
  error.value = '';
  try {
    if (isEdit.value && role.value) {
      await rolesStore.update(role.value.id, {
        slug: form.slug,
        name: form.name,
      });
      const currentOnServer = (role.value.permissions ?? []).map((p) => p.id);
      const toAdd = assignedPermissionIds.value.filter((id) => !currentOnServer.includes(id));
      const toRemove = currentOnServer.filter((id) => !assignedPermissionIds.value.includes(id));
      for (const id of toAdd) {
        await rolesStore.addPermission(role.value.id, id);
      }
      for (const id of toRemove) {
        await rolesStore.deletePermission(role.value.id, id);
      }
    } else {
      await rolesStore.create({
        slug: form.slug,
        name: form.name,
      });
    }
    success(isEdit.value ? 'Роль оновлено' : 'Роль створено');
    router.push({ name: 'roles' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Помилка збереження';
    error.value = msg;
    showError(msg);
  } finally {
    submitLoading.value = false;
  }
}

onMounted(() => {
  load();
  if (isEdit.value) void loadPermissions();
});
watch(() => route.params.id, () => {
  load();
  if (isEdit.value) void loadPermissions();
});
</script>
