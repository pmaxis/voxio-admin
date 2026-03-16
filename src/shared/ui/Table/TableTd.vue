<template>
  <td :class="tdClass">
    <slot />
  </td>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    align?: 'start' | 'end';
  }>(),
  { align: 'start' }
);

const tdClass = computed(() => [
  'px-4 py-3',
  props.align === 'end' ? 'text-right' : 'text-left',
]);
</script>
