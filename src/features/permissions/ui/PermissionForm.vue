<template>
  <div class="w-full">
    <div v-if="loadError" class="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
      <p class="text-red-400">{{ loadError }}</p>
      <router-link
        :to="{ name: 'permissions' }"
        class="mt-2 inline-block text-sm text-amber-400 hover:underline"
      >
        ← Назад до списку
      </router-link>
    </div>
    <div v-else class="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="mb-4 flex items-center gap-3">
        <router-link
          :to="{ name: 'permissions' }"
          class="text-zinc-400 hover:text-zinc-200 text-sm"
        >
          ← Дозволи
        </router-link>
      </div>
      <h2 class="text-base font-medium text-zinc-200 mb-4">
        {{ isEdit ? 'Редагувати дозвіл' : 'Новий дозвіл' }}
      </h2>

      <Form
        v-if="!isEdit || permission"
        bordered
        @submit="handleSubmit"
      >
        <FormField label="Ключ (key)" field-id="perm-key" size="sm">
          <Input
            v-model="form.key"
            required
            mono
            placeholder="наприклад, users:read"
          />
        </FormField>
        <FormField label="Опис (необовʼязково)" field-id="perm-desc" size="sm">
          <Input
            v-model="form.description"
            placeholder="Опис дозволу"
          />
        </FormField>
        <ErrorMessage :message="error" />
        <template #actions>
          <Button :to="{ name: 'permissions' }" variant="ghost">Скасувати</Button>
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
import { usePermissionsStore } from '@/features/permissions';
import type { Permission } from '@/entities/permission/types';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();
const permissionsStore = usePermissionsStore();

const permission = ref<Permission | null>(null);
const loadError = ref('');
const submitLoading = ref(false);
const error = ref('');
const form = reactive({ key: '', description: '' });

const isEdit = computed(() => {
  const id = route.params.id as string;
  return id && id !== 'new';
});

async function load() {
  const id = route.params.id as string;
  if (!id || id === 'new') {
    form.key = '';
    form.description = '';
    permission.value = null;
    loadError.value = '';
    return;
  }
  loadError.value = '';
  permission.value = null;
  try {
    permission.value = await permissionsStore.fetchOne(id);
    form.key = permission.value.key;
    form.description = permission.value.description ?? '';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося завантажити дозвіл';
    loadError.value = msg;
    showError(msg);
  }
}

async function handleSubmit() {
  submitLoading.value = true;
  error.value = '';
  try {
    if (isEdit.value && permission.value) {
      await permissionsStore.update(permission.value.id, {
        key: form.key,
        description: form.description || undefined,
      });
    } else {
      await permissionsStore.create({
        key: form.key,
        description: form.description || undefined,
      });
    }
    success(isEdit.value ? 'Дозвіл оновлено' : 'Дозвіл створено');
    router.push({ name: 'permissions' });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Помилка збереження';
    error.value = msg;
    showError(msg);
  } finally {
    submitLoading.value = false;
  }
}

onMounted(load);
watch(() => route.params.id, load);
</script>
