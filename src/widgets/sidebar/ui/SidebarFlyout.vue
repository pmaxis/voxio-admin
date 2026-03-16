<template>
  <div
    class="absolute inset-0 flex flex-col rounded-lg m-2 shadow-xl z-10"
    :class="isLightTheme ? 'bg-white border border-zinc-200' : 'bg-zinc-900 border border-zinc-800'"
    role="dialog"
    :aria-label="group.label"
  >
    <div
      class="flex shrink-0 items-center px-3 py-2.5"
      :class="isLightTheme ? 'border-b border-zinc-200' : 'border-b border-zinc-800'"
    >
      <Button
        variant="bare"
        size="icon-sm"
        class="mr-2"
        :class="
          isLightTheme
            ? 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
        "
        aria-label="Назад"
        @click="$emit('close')"
      >
        <span aria-hidden="true">←</span>
      </Button>
      <h2
        class="min-w-0 truncate text-sm font-medium"
        :class="isLightTheme ? 'text-zinc-800' : 'text-zinc-200'"
      >
        {{ group.label }}
      </h2>
    </div>
    <nav class="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
      <NavItem
        v-for="child in group.children"
        :key="child.name"
        :to="child.to"
        :label="child.label"
        :is-active="isChildActive(child)"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Button } from '@/shared/ui';
import type { NavGroup } from '../model/useSidebarNav';
import NavItem from './NavItem.vue';

const props = defineProps<{
  group: NavGroup;
  isLightTheme: boolean;
}>();

defineEmits<{
  close: [];
}>();

const route = useRoute();

function isChildActive(child: { routeNames: string[] }): boolean {
  const name = route.name as string;
  return Boolean(name && child.routeNames.includes(name));
}
</script>
