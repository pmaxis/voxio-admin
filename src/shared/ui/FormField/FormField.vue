<template>
  <div class="voxio-form-field">
    <label v-if="label" :for="fieldId" :class="labelClass">
      {{ label }}
    </label>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';

const props = withDefaults(
  defineProps<{
    label?: string;
    fieldId?: string;
    size?: 'sm' | 'md';
  }>(),
  { size: 'md' }
);

provide('formFieldId', props.fieldId);

const labelClass = computed(() => [
  'voxio-form-field-label block font-medium',
  props.size === 'sm' ? 'mb-1 text-xs text-zinc-400' : 'mb-1.5 text-sm text-zinc-300',
]);
</script>
