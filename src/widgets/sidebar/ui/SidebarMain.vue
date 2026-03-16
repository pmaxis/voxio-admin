<template>
  <div class="relative min-h-0 flex-1 flex flex-col overflow-hidden">
    <SidebarNavList
      :nav-structure="navStructure"
      :open-flyout-id="openFlyoutId"
      :has-open-flyout="!!openFlyoutGroup"
      @toggle-group="toggleGroup"
    />
    <SidebarFlyout
      v-if="openFlyoutGroup"
      :group="openFlyoutGroup"
      :is-light-theme="isLightTheme"
      @close="closeFlyout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '@/features/theme/store';
import { useSidebarNav } from '../model/useSidebarNav';
import SidebarNavList from './SidebarNavList.vue';
import SidebarFlyout from './SidebarFlyout.vue';

const themeStore = useThemeStore();
const { navStructure, openFlyoutId, openFlyoutGroup, toggleGroup, closeFlyout } = useSidebarNav();

const isLightTheme = computed(() => themeStore.theme === 'light');
</script>
