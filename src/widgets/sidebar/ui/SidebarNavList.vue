<template>
  <nav class="min-h-0 flex-1 overflow-y-auto p-3 space-y-1" :class="{ invisible: hasOpenFlyout }">
    <template v-for="item in navStructure" :key="item.type === 'link' ? item.name : item.id">
      <NavItem
        v-if="item.type === 'link'"
        :to="item.to"
        :label="item.label"
        :is-active="isLinkActive(item)"
      />
      <NavItem
        v-else
        :label="item.label"
        :is-group="true"
        :is-active="isGroupActive(item) || openFlyoutId === item.id"
        :is-open="openFlyoutId === item.id"
        @click="$emit('toggle-group', item)"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { NavItem as NavItemType, NavGroup } from '../model/useSidebarNav';
import NavItem from './NavItem.vue';

const props = defineProps<{
  navStructure: NavItemType[];
  openFlyoutId: string | null;
  hasOpenFlyout: boolean;
}>();

defineEmits<{
  'toggle-group': [group: NavGroup];
}>();

const route = useRoute();

function isLinkActive(item: { name: string; routeNames?: string[] }): boolean {
  const name = route.name as string;
  if (!name) return false;
  if (item.routeNames) {
    return item.routeNames.includes(name);
  }
  return route.name === item.name;
}

function isChildActive(child: { routeNames: string[] }): boolean {
  const name = route.name as string;
  return Boolean(name && child.routeNames.includes(name));
}

function isGroupActive(group: NavGroup): boolean {
  return group.children.some((child) => isChildActive(child));
}
</script>
