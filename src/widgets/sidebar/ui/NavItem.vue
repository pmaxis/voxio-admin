<template>
  <Link
    v-if="to"
    :to="to"
    :class="[baseClass, isActive ? activeNavClass : inactiveNavClass]"
    v-bind="$attrs"
  >
    <span class="truncate min-w-0">{{ label }}</span>
  </Link>
  <button
    v-else
    type="button"
    :aria-expanded="isOpen"
    :aria-haspopup="true"
    :class="[baseClass, isActive ? activeNavClass : inactiveNavClass]"
    v-bind="$attrs"
  >
    <span class="truncate min-w-0">{{ label }}</span>
    <span class="shrink-0 ml-2 text-zinc-500" aria-hidden="true">›</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { useThemeStore } from '@/features/theme/store';
import { Link } from '@/shared/ui';

defineProps<{
  label: string;
  to?: RouteLocationRaw;
  isActive: boolean;
  isOpen?: boolean;
}>();

const themeStore = useThemeStore();
const isLightTheme = computed(() => themeStore.theme === 'light');

const baseClass =
  'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 focus:outline-none';

const activeNavClass = computed(() =>
  isLightTheme.value
    ? 'border border-amber-400 bg-amber-100 text-amber-800 shadow-sm'
    : 'border border-amber-500/70 bg-amber-500/15 text-amber-300 shadow-sm',
);

const inactiveNavClass = computed(() =>
  isLightTheme.value
    ? 'border border-transparent text-zinc-700 hover:border-amber-300 hover:bg-amber-100 hover:text-zinc-900'
    : 'border border-transparent text-zinc-400 hover:border-zinc-600/70 hover:bg-zinc-800/70 hover:text-zinc-50',
);
</script>
