<template>
  <div v-bind="$attrs">
    <p v-if="message" class="text-sm text-red-400">
      {{ message }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
  message?: string | null;
}>();
</script>
