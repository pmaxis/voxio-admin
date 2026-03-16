<template>
  <div class="relative flex shrink-0">
    <aside
      class="flex w-64 shrink-0 flex-col overflow-hidden border-r border-zinc-800 bg-zinc-900/60"
    >
      <SidebarHeader />

      <SidebarMain />

      <SidebarFooter
        ref="footerRef"
        :user-initials="userInitials"
        :is-light-theme="isLightTheme"
        :is-user-menu-open="isUserMenuOpen"
        @toggle-menu="isUserMenuOpen = !isUserMenuOpen"
        @logout="handleLogout"
      />
    </aside>

    <SidebarUserMenu
      ref="userMenuRef"
      :user="auth.user"
      :user-pib="userPib"
      :user-initials="userInitials"
      :is-light-theme="isLightTheme"
      :is-dark-mode="themeStore.theme === 'dark'"
      :is-open="isUserMenuOpen"
      :style="userMenuStyle"
      @logout="handleLogout"
      @toggle-theme="themeStore.toggleTheme()"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/features/auth';
import { useThemeStore } from '@/features/theme/store';
import SidebarHeader from './ui/SidebarHeader.vue';
import SidebarMain from './ui/SidebarMain.vue';
import SidebarFooter from './ui/SidebarFooter.vue';
import SidebarUserMenu from './ui/SidebarUserMenu.vue';

const router = useRouter();
const auth = useAuth();
const themeStore = useThemeStore();

const footerRef = ref<InstanceType<typeof SidebarFooter> | null>(null);
const userMenuRef = ref<InstanceType<typeof SidebarUserMenu> | null>(null);
const isUserMenuOpen = ref(false);
const userMenuStyle = ref<Record<string, string>>({});

const isLightTheme = computed(() => themeStore.theme === 'light');

const userPib = computed(() => {
  const u = auth.user;
  if (!u) return '';
  const parts = [u.lastName, u.firstName, u.thirdName].filter(Boolean);
  return parts.length ? parts.join(' ') : '';
});

const userInitials = computed(() => {
  const u = auth.user;
  if (!u) return 'U';
  const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.trim();
  if (initials) return initials.toUpperCase();
  return u.email.slice(0, 1).toUpperCase();
});

function updateUserMenuPosition() {
  const buttonEl = footerRef.value?.buttonRef;
  if (!buttonEl) return;
  const rect = buttonEl.getBoundingClientRect();
  const margin = 12;
  const preferredWidth = 320;
  const left = Math.min(Math.max(rect.left, margin), window.innerWidth - preferredWidth - margin);
  userMenuStyle.value = {
    left: `${left}px`,
    bottom: `${window.innerHeight - rect.top + 8}px`,
  };
}

function handleViewportChange() {
  if (isUserMenuOpen.value) updateUserMenuPosition();
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node;
  if (footerRef.value?.buttonRef?.contains(target)) return;
  if (userMenuRef.value?.panelRef?.contains(target)) return;
  if (isUserMenuOpen.value) isUserMenuOpen.value = false;
}

async function handleLogout() {
  isUserMenuOpen.value = false;
  await auth.logout();
  router.replace({ name: 'login' });
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true);
  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleViewportChange, true);
});

watch(isUserMenuOpen, async (open) => {
  if (!open) {
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange, true);
    return;
  }
  await nextTick();
  updateUserMenuPosition();
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleViewportChange, true);
});
</script>
