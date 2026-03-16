<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full font-semibold',
      sizeClass,
      isLightTheme
        ? 'border border-amber-300 bg-amber-100 text-amber-800'
        : 'border border-zinc-600 bg-amber-500/20 text-amber-300',
    ]"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    initials: string;
    isLightTheme: boolean;
    size?: 'sm' | 'md';
  }>(),
  { size: 'sm' },
);

const sizeClass = computed(() =>
  props.size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs',
);
</script>
