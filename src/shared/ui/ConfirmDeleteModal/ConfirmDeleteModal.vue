<template>
  <div
    v-if="modelValue"
    class="voxio-confirm-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    @click.self="$emit('update:modelValue', null)"
  >
    <div class="voxio-confirm-modal w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
      <p class="text-base font-semibold text-zinc-100">
        Ви дійсно бажаєте видалити <slot name="message" />?
      </p>
      <p class="mt-2 text-xs text-zinc-500">
        Цю дію не можна скасувати. Об'єкт буде видалено назавжди.
      </p>
      <div class="mt-4 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" @click="$emit('update:modelValue', null)">
          Ні
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          :disabled="loading"
          @click="$emit('confirm')"
        >
          {{ loading ? '…' : 'Так, видалити' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/shared/ui';

withDefaults(
  defineProps<{
    modelValue: unknown;
    loading?: boolean;
  }>(),
  { loading: false },
);

defineEmits<{
  (e: 'update:modelValue', value: null): void;
  (e: 'confirm'): void;
}>();
</script>
