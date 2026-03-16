<template>
  <div class="w-full">
    <div v-if="loadError" class="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
      <p class="text-red-400">{{ loadError }}</p>
      <router-link
        :to="{ name: 'users' }"
        class="mt-2 inline-block text-sm text-amber-400 hover:underline"
      >
        ← Назад до списку
      </router-link>
    </div>
    <div v-else class="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="mb-4 flex items-center gap-3">
        <router-link :to="{ name: 'users' }" class="text-zinc-400 hover:text-zinc-200 text-sm">
          ← Користувачі
        </router-link>
      </div>
      <h2 class="text-base font-medium text-zinc-200 mb-4">
        {{ isEdit ? 'Редагувати користувача' : 'Новий користувач' }}
      </h2>

      <Form v-if="!isEdit || user" bordered @submit="handleSubmit">
        <!-- Рядок 1: Прізвище, Ім'я, По батькові -->
        <div class="grid grid-cols-3 gap-4">
          <FormField label="Прізвище" field-id="user-lastName" size="sm">
            <Input v-model="form.lastName" required placeholder="Прізвище" />
          </FormField>
          <FormField label="Імʼя" field-id="user-firstName" size="sm">
            <Input v-model="form.firstName" required placeholder="Імʼя" />
          </FormField>
          <FormField label="По батькові" field-id="user-thirdName" size="sm">
            <Input v-model="form.thirdName" placeholder="По батькові" />
          </FormField>
        </div>

        <!-- Рядок 2: Email -->
        <div>
          <FormField label="Email" field-id="user-email" size="sm">
            <Input v-model="form.email" type="email" required placeholder="user@example.com" />
          </FormField>
        </div>

        <!-- Рядок 3: Пароль, Повторити пароль -->
        <div class="grid grid-cols-2 gap-4">
          <FormField
            :label="isEdit ? 'Пароль (необовʼязково)' : 'Пароль'"
            field-id="user-password"
            size="sm"
          >
            <Input
              v-model="form.password"
              type="password"
              :required="!isEdit"
              :placeholder="isEdit ? 'Залиште порожнім, щоб не змінювати' : 'Пароль'"
            />
            <p v-if="isEdit" class="mt-1 text-xs text-zinc-500">
              Заповніть лише якщо потрібно змінити пароль.
            </p>
          </FormField>
          <FormField
            :label="isEdit ? 'Повторити пароль' : 'Повторити пароль'"
            field-id="user-passwordConfirm"
            size="sm"
          >
            <Input
              v-model="form.passwordConfirm"
              type="password"
              :required="!isEdit"
              :placeholder="isEdit ? 'Підтвердіть новий пароль' : 'Повторити пароль'"
            />
          </FormField>
        </div>

        <FormField label="Ролі" field-id="user-roles" size="sm">
          <div class="relative" ref="rolesDropdownRef">
            <div
              class="voxio-multiselect-box min-h-10 w-full flex flex-wrap items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
            >
              <span
                v-for="r in selectedRolesList"
                :key="r.slug"
                class="user-role-chip inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 pl-2 pr-1 py-1 text-sm text-amber-200"
              >
                <span class="min-w-0 truncate">{{ r.name }}</span>
                <button
                  type="button"
                  class="user-role-chip-remove flex h-5 w-5 shrink-0 items-center justify-center rounded text-inherit opacity-70 hover:opacity-100 hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  aria-label="Прибрати роль"
                  @click="toggleRole(r.slug)"
                >
                  ×
                </button>
              </span>
              <button
                type="button"
                class="voxio-multiselect-trigger rounded px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="rolesAvailableToAdd.length === 0"
                @click="rolesDropdownOpen = !rolesDropdownOpen"
              >
                {{ rolesAvailableToAdd.length === 0 ? 'Усі ролі обрані' : '+ Обрати ролі' }}
              </button>
            </div>
            <div
              v-show="rolesDropdownOpen"
              class="voxio-multiselect-dropdown absolute top-full left-0 z-20 mt-1 max-h-56 w-full min-w-0 overflow-y-auto rounded-lg border border-zinc-600 bg-zinc-800 py-1 shadow-lg"
            >
              <p v-if="rolesStore.roles.length === 0" class="px-3 py-2 text-sm text-zinc-500">
                Ролей немає.
              </p>
              <button
                v-for="r in rolesAvailableToAdd"
                :key="r.slug"
                type="button"
                class="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700"
                @click="addRoleAndClose(r.slug)"
              >
                {{ r.name }}
              </button>
            </div>
          </div>
        </FormField>

        <ErrorMessage :message="error" />
        <template #actions>
          <Button :to="{ name: 'users' }" variant="ghost">Скасувати</Button>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button, Input, FormField, Form, ErrorMessage } from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useUsersStore } from '@/features/users';
import { useRolesStore } from '@/features/roles';
import type { User } from '@/entities/user/types';
import type { Role } from '@/entities/role/types';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();
const usersStore = useUsersStore();
const rolesStore = useRolesStore();

const user = ref<User | null>(null);
const loadError = ref('');
const submitLoading = ref(false);
const error = ref('');
const form = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  firstName: '',
  lastName: '',
  thirdName: '',
});

const assignedRoleSlugs = ref<string[]>([]);
const rolesDropdownOpen = ref(false);
const rolesDropdownRef = ref<HTMLElement | null>(null);

const isEdit = computed(() => {
  const id = route.params.id as string;
  return id && id !== 'new';
});

const selectedRolesList = computed((): Role[] => {
  return assignedRoleSlugs.value
    .map((slug) => rolesStore.roles.find((r) => r.slug === slug))
    .filter((r): r is Role => r != null);
});

const rolesAvailableToAdd = computed(() => {
  const set = new Set(assignedRoleSlugs.value);
  return rolesStore.roles.filter((r) => !set.has(r.slug));
});

function toggleRole(roleSlug: string) {
  if (assignedRoleSlugs.value.includes(roleSlug)) {
    assignedRoleSlugs.value = assignedRoleSlugs.value.filter((slug) => slug !== roleSlug);
  } else {
    assignedRoleSlugs.value = [...assignedRoleSlugs.value, roleSlug];
  }
}

function addRoleAndClose(roleSlug: string) {
  if (!assignedRoleSlugs.value.includes(roleSlug)) {
    assignedRoleSlugs.value = [...assignedRoleSlugs.value, roleSlug];
  }
  rolesDropdownOpen.value = false;
}

async function load() {
  const id = route.params.id as string;
  if (!id || id === 'new') {
    form.email = '';
    form.password = '';
    form.passwordConfirm = '';
    form.firstName = '';
    form.lastName = '';
    form.thirdName = '';
    user.value = null;
    assignedRoleSlugs.value = [];
    loadError.value = '';
    return;
  }
  loadError.value = '';
  user.value = null;
  try {
    user.value = await usersStore.fetchOne(id);
    form.email = user.value.email;
    form.password = '';
    form.passwordConfirm = '';
    form.firstName = user.value.firstName ?? '';
    form.lastName = user.value.lastName ?? '';
    form.thirdName = user.value.thirdName ?? '';
    assignedRoleSlugs.value = (user.value.roles ?? []).map((r) => r.slug);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося завантажити користувача';
    loadError.value = msg;
    showError(msg);
  }
}

async function loadRoles() {
  try {
    await rolesStore.fetchAll();
  } catch {
    // ignore
  }
}

async function handleSubmit() {
  const needsPassword = !isEdit.value || form.password;
  if (needsPassword && form.password !== form.passwordConfirm) {
    error.value = 'Паролі не збігаються';
    return;
  }
  submitLoading.value = true;
  error.value = '';
  try {
    if (isEdit.value && user.value) {
      await usersStore.update(user.value.id, {
        email: form.email,
        ...(form.password ? { password: form.password } : {}),
        firstName: form.firstName,
        lastName: form.lastName,
        thirdName: form.thirdName || undefined,
      });
      const currentOnServer = (user.value.roles ?? []).map((r) => r.slug);
      const toAdd = assignedRoleSlugs.value.filter((slug) => !currentOnServer.includes(slug));
      const toRemove = currentOnServer.filter((slug) => !assignedRoleSlugs.value.includes(slug));
      for (const slug of toAdd) {
        const role = rolesStore.roles.find((r) => r.slug === slug);
        if (!role) continue;
        await usersStore.addRole(user.value.id, role.id);
      }
      for (const slug of toRemove) {
        const role = rolesStore.roles.find((r) => r.slug === slug);
        if (!role) continue;
        await usersStore.deleteRole(user.value.id, role.id);
      }
    } else {
      const newUser = await usersStore.create({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        thirdName: form.thirdName || undefined,
      });
      for (const slug of assignedRoleSlugs.value) {
        const role = rolesStore.roles.find((r) => r.slug === slug);
        if (!role) continue;
        await usersStore.addRole(newUser.id, role.id);
      }
    }
    success(isEdit.value ? 'Користувача оновлено' : 'Користувача створено');
    router.push({ name: 'users' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Помилка збереження';
    error.value = msg;
    showError(msg);
  } finally {
    submitLoading.value = false;
  }
}

function onClickOutsideRoles(e: MouseEvent) {
  if (rolesDropdownRef.value && !rolesDropdownRef.value.contains(e.target as Node)) {
    rolesDropdownOpen.value = false;
  }
}

onMounted(() => {
  load();
  void loadRoles();
  document.addEventListener('click', onClickOutsideRoles);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutsideRoles);
});
watch(
  () => route.params.id,
  () => {
    load();
    void loadRoles();
    rolesDropdownOpen.value = false;
  },
);
</script>
