<template>
  <div class="w-full">
    <div v-if="loadError" class="rounded-xl border border-red-900/50 bg-red-950/30 p-6">
      <p class="text-red-400">{{ loadError }}</p>
      <router-link
        :to="{ name: 'clients' }"
        class="mt-2 inline-block text-sm text-amber-400 hover:underline"
      >
        ← Назад до списку
      </router-link>
    </div>
    <div v-else class="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="mb-4 flex items-center gap-3">
        <router-link :to="{ name: 'clients' }" class="text-zinc-400 hover:text-zinc-200 text-sm">
          ← Клієнти
        </router-link>
      </div>
      <h2 class="text-base font-medium text-zinc-200 mb-4">
        {{ isEdit ? 'Редагувати клієнта' : 'Новий клієнт' }}
      </h2>

      <Form v-if="!isEdit || client" bordered @submit="handleSubmit">
        <FormField label="Telegram ID" field-id="client-telegramId" size="sm">
          <Input
            v-model="form.telegramId"
            :disabled="isEdit"
            required
            placeholder="наприклад, 123456789"
          />
          <p v-if="isEdit" class="mt-1 text-xs text-zinc-500">
            Telegram ID не можна змінити після створення.
          </p>
        </FormField>
        <FormField label="Username" field-id="client-username" size="sm">
          <Input v-model="form.username" placeholder="@username (необовʼязково)" />
        </FormField>

        <ErrorMessage :message="error" />
        <template #actions>
          <Button :to="{ name: 'clients' }" variant="ghost">Скасувати</Button>
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
import { useClientsStore } from '@/features/clients';
import type { Client } from '@/entities/client/types';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();
const clientsStore = useClientsStore();

const client = ref<Client | null>(null);
const loadError = ref('');
const submitLoading = ref(false);
const error = ref('');
const form = reactive({ telegramId: '', username: '' });

const isEdit = computed(() => {
  const id = route.params.id as string;
  return Boolean(id && id !== 'new');
});

async function load() {
  const id = route.params.id as string;
  if (!id || id === 'new') {
    form.telegramId = '';
    form.username = '';
    client.value = null;
    loadError.value = '';
    return;
  }
  loadError.value = '';
  client.value = null;
  try {
    client.value = await clientsStore.fetchOne(id);
    form.telegramId = client.value.telegramId;
    form.username = client.value.username ?? '';
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося завантажити клієнта';
    loadError.value = msg;
    showError(msg);
  }
}

async function handleSubmit() {
  submitLoading.value = true;
  error.value = '';
  try {
    if (isEdit.value && client.value) {
      await clientsStore.update(client.value.id, {
        username: form.username || undefined,
      });
    } else {
      await clientsStore.create({
        telegramId: form.telegramId,
        username: form.username || undefined,
      });
    }
    success(isEdit.value ? 'Клієнта оновлено' : 'Клієнта створено');
    router.push({ name: 'clients' });
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
