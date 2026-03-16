<template>
  <Teleport to="body">
    <div
      v-if="isOpen && user"
      ref="panelRef"
      class="fixed z-50 w-[calc(100vw-3rem)] max-w-80 overflow-hidden rounded-xl border shadow-2xl"
      :class="isLightTheme ? 'border-zinc-300 bg-white' : 'border-zinc-700 bg-zinc-900'"
      :style="style"
    >
      <div
        class="flex items-center gap-3 border-b p-3"
        :class="isLightTheme ? 'border-zinc-200' : 'border-zinc-800'"
      >
        <Avatar :initials="userInitials" :is-light-theme="isLightTheme" size="md" />
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-semibold"
            :class="isLightTheme ? 'text-zinc-900' : 'text-zinc-100'"
          >
            {{ userPib || user.email }}
          </p>
          <p class="truncate text-xs" :class="isLightTheme ? 'text-zinc-600' : 'text-zinc-400'">
            {{ user.email }}
          </p>
        </div>
        <Chip :is-light-theme="isLightTheme">Адмін</Chip>
      </div>

      <div class="p-2">
        <Link
          :to="{ name: 'myAccount' }"
          class="block w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none"
          :class="
            isLightTheme ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-400 hover:text-zinc-100'
          "
        >
          Мій акаунт
        </Link>
      </div>

      <div class="border-t p-3" :class="isLightTheme ? 'border-zinc-200' : 'border-zinc-800'">
        <Button
          variant="bare"
          class="mb-2 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none"
          :class="
            isLightTheme
              ? 'border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              : 'border-zinc-700 text-zinc-200 hover:bg-zinc-800'
          "
          @click="$emit('toggle-theme')"
        >
          <span>Темна тема</span>
          <span :class="isLightTheme ? 'text-zinc-500' : 'text-zinc-400'">
            {{ isDarkMode ? 'Увімк' : 'Вимк' }}
          </span>
        </Button>
        <Button
          variant="bare"
          class="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none"
          :class="
            isLightTheme
              ? 'border-red-200 text-red-700 hover:bg-red-50'
              : 'border-zinc-700 text-zinc-100 hover:bg-zinc-800'
          "
          @click="$emit('logout')"
        >
          Вийти
        </Button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '@/entities/user/types';
import { Avatar, Button, Chip, Link } from '@/shared/ui';

defineProps<{
  user: User | null;
  userPib: string;
  userInitials: string;
  isLightTheme: boolean;
  isDarkMode: boolean;
  isOpen: boolean;
  style: Record<string, string>;
}>();

defineEmits<{
  logout: [];
  'toggle-theme': [];
}>();

const panelRef = ref<HTMLElement | null>(null);

defineExpose({ panelRef });
</script>
