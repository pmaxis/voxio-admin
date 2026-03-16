import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Theme } from '@/shared/types/theme';

const STORAGE_KEY = 'voxio-admin-theme';

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>('dark');

  function applyTheme(next: Theme) {
    theme.value = next;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(next === 'dark' ? 'theme-dark' : 'theme-light');
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }

  function toggleTheme() {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  function initTheme() {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
      return;
    }
    applyTheme('dark');
  }

  return {
    theme,
    toggleTheme,
    initTheme,
  };
});
