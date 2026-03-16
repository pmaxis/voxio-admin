<template>
  <div
    class="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    aria-live="polite"
    aria-label="Сповіщення"
  >
    <div class="flex flex-col gap-3 pointer-events-auto">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :toast="toast"
        @dismiss="remove"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Toast from './Toast.vue';
import { useToast } from './useToast';

const { toasts, remove } = useToast();
</script>
