import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/auth.api';
import { profileApi } from '@/features/profile';
import type { AuthUser, LoginPayload } from './types';

type AccessTokenPayload = {
  userId: string;
  permissions?: string[];
};

function parseAccessTokenPayload(token: string): AccessTokenPayload | null {
  try {
    const [, payloadRaw] = token.split('.');
    if (!payloadRaw) return null;
    const base64 = payloadRaw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as AccessTokenPayload;
    if (!payload?.userId) return null;
    return payload;
  } catch {
    return null;
  }
}

export const useAuth = defineStore('auth', () => {
  const accessToken = ref<string | null>(null);
  const user = ref<AuthUser | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  /** Відновлення сесії з refresh_token cookie */
  async function init() {
    try {
      const { accessToken: token } = await authApi.refresh();
      accessToken.value = token;
      await fetchMe();
    } catch {
      accessToken.value = null;
      user.value = null;
    }
  }

  async function login(payload: LoginPayload) {
    const { accessToken: token } = await authApi.login(payload);
    accessToken.value = token;
    await fetchMe();
  }

  async function fetchMe() {
    const token = accessToken.value;
    if (!token) {
      user.value = null;
      return;
    }
    const payload = parseAccessTokenPayload(token);
    if (!payload) {
      accessToken.value = null;
      user.value = null;
      return;
    }
    const data = await profileApi.getProfile();
    user.value = {
      ...data,
      permissions: payload.permissions ?? [],
    };
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      accessToken.value = null;
      user.value = null;
    }
  }

  function getToken(): string | null {
    return accessToken.value;
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    init,
    login,
    logout,
    fetchMe,
    getToken,
  };
});
