<template>
  <input
    :id="inputId"
    :value="modelValue"
    :type="type"
    :required="required"
    :disabled="disabled"
    :placeholder="placeholder"
    :autocomplete="autocomplete"
    :class="inputClass"
    v-bind="$attrs"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    autocomplete?: string;
    inputId?: string;
    mono?: boolean;
  }>(),
  {
    type: 'text',
    required: false,
    disabled: false,
    mono: false,
  }
);

defineOptions({ inheritAttrs: false });

const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const injectedId = inject<string | undefined>('formFieldId', undefined);
const inputId = computed(() => props.inputId ?? injectedId ?? undefined);

const inputClass = computed(() => [
  'voxio-input w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500',
  props.mono && 'font-mono',
]);
</script>
