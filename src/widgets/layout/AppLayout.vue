<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100 flex">
    <AppSidebar />
    <main class="flex-1 min-w-0 flex flex-col overflow-auto">
      <div class="p-6">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/widgets/sidebar/AppSidebar.vue';
</script>
