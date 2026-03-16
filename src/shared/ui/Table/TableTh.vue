<template>
  <th :class="thClass">
    <slot />
  </th>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    align?: 'start' | 'end';
  }>(),
  { align: 'start' }
);

const thClass = computed(() => [
  'px-4 py-3 font-medium text-zinc-400',
  props.align === 'end' ? 'text-right' : 'text-left',
]);
</script>
