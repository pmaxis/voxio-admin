<template>
  <Form @submit="handleSubmit">
    <FormField label="Email" field-id="email">
      <Input
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="admin@example.com"
      />
    </FormField>
    <FormField label="Пароль" field-id="password">
      <Input
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        placeholder="••••••••"
      />
    </FormField>
    <ErrorMessage :message="error" />
    <Button type="submit" variant="primary" size="full" :disabled="loading">
      {{ loading ? 'Вхід...' : 'Увійти' }}
    </Button>
  </Form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Button, Input, FormField, Form, ErrorMessage } from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';
import { useAuth } from '../model/useAuth';

const emit = defineEmits<{ success: [] }>();

const router = useRouter();
const { error: showError } = useToast();
const auth = useAuth();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login({ email: email.value, password: password.value });
    emit('success');
    await router.replace({ name: 'dashboard' });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Помилка входу';
    error.value = msg;
    showError(msg);
  } finally {
    loading.value = false;
  }
}
</script>
