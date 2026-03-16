<template>
  <component
    :is="tag"
    :to="to"
    :type="tag === 'button' ? 'button' : undefined"
    :class="itemClass"
    class="block w-full whitespace-nowrap px-3 py-2 text-left text-sm transition-colors first:rounded-t-[7px] last:rounded-b-[7px] focus:outline-none focus:ring-0"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw;
    danger?: boolean;
  }>(),
  { danger: false },
);

const emit = defineEmits<{ click: [e: MouseEvent] }>();

const tag = computed(() => (props.to ? 'router-link' : 'button'));
const itemClass = computed(() =>
  props.danger ? 'text-red-400 hover:bg-red-500/20' : 'text-zinc-200 hover:bg-zinc-700',
);

function handleClick(e: MouseEvent) {
  emit('click', e);
}
</script>
