<template>
  <span
    class="rounded-md border px-2 py-0.5 text-[11px]"
    :class="colorClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    isLightTheme: boolean;
    color?: 'blue' | 'amber' | 'green' | 'red';
  }>(),
  { color: 'blue' },
);

const colorMap = {
  blue:  ['border-blue-400/50 bg-blue-50 text-blue-700',   'border-blue-500/40 bg-blue-500/10 text-blue-300'],
  amber: ['border-amber-400/50 bg-amber-50 text-amber-700', 'border-amber-500/40 bg-amber-500/10 text-amber-300'],
  green: ['border-green-400/50 bg-green-50 text-green-700', 'border-green-500/40 bg-green-500/10 text-green-300'],
  red:   ['border-red-400/50 bg-red-50 text-red-700',       'border-red-500/40 bg-red-500/10 text-red-300'],
} as const;

const colorClass = computed(() => {
  const pair = colorMap[props.color] ?? colorMap.blue;
  return props.isLightTheme ? pair[0] : pair[1];
});
</script>
