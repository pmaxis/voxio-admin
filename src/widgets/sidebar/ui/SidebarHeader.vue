<template>
  <Link :to="{ name: 'dashboard' }" class="flex shrink-0 items-center border-b border-zinc-800 px-3 py-3">
    <span class="font-semibold text-zinc-100">Voxio</span>
  </Link>
</template>

<script setup lang="ts">
import { Link } from '@/shared/ui';
</script>
