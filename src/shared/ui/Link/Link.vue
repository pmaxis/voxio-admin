<template>
  <router-link :to="to" v-bind="$attrs">
    <slot />
  </router-link>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

defineProps<{
  to: RouteLocationRaw;
}>();
</script>
