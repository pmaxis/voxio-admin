<template>
  <div class="shrink-0 border-t border-zinc-800 p-3">
    <div class="flex items-center justify-between">
      <button
        ref="buttonRef"
        type="button"
        class="rounded-full p-0.5 focus:outline-none"
        aria-haspopup="true"
        :aria-expanded="isUserMenuOpen"
        @click="$emit('toggle-menu')"
      >
        <Avatar :initials="userInitials" :is-light-theme="isLightTheme" />
      </button>

      <div class="flex items-center">
        <Button
          variant="bare"
          size="icon-md"
          :class="isLightTheme ? 'border border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900' : 'border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100'"
          aria-label="Вийти"
          @click="$emit('logout')"
        >
          <span aria-hidden="true">⎋</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Avatar, Button } from '@/shared/ui';

defineProps<{
  userInitials: string;
  isLightTheme: boolean;
  isUserMenuOpen: boolean;
}>();

defineEmits<{
  'toggle-menu': [];
  logout: [];
}>();

const buttonRef = ref<HTMLElement | null>(null);

defineExpose({ buttonRef });
</script>
