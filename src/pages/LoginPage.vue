<template>
  <div class="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
    <div class="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl">
      <h1 class="text-xl font-semibold text-zinc-100 mb-1">Voxio Admin</h1>
      <p class="text-sm text-zinc-400 mb-6">Увійдіть до панелі керування</p>
      <p
        v-if="accessDeniedMessage"
        class="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-400"
      >
        {{ accessDeniedMessage }}
      </p>
      <LoginForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { LoginForm } from '@/features/auth';

const route = useRoute();

const accessDeniedMessage = computed(() =>
  route.query.reason === 'no_admin_access'
    ? 'У вас немає доступу до адмін-панелі. Увійдіть обліковим записом адміністратора.'
    : null,
);
</script>
