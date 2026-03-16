<template>
  <form
    :class="formClass"
    @submit.prevent="$emit('submit')"
  >
    <slot />
    <div v-if="$slots.actions" class="flex justify-end gap-2 pt-2">
      <slot name="actions" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

defineEmits<{ submit: [] }>();

const props = withDefaults(
  defineProps<{
    bordered?: boolean;
  }>(),
  { bordered: false }
);

const formClass = computed(() =>
  props.bordered
    ? 'voxio-form w-full space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-6'
    : 'space-y-4'
);
</script>
