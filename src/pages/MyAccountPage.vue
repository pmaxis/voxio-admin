<template>
  <div class="space-y-6">
    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-base font-medium text-zinc-200">Мій акаунт</h2>
          <p class="mt-1 text-sm text-zinc-400">
            Редагування ПІБ, email та пароля. Роль змінити неможливо.
          </p>
        </div>
        <button
          v-if="!editing"
          type="button"
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          title="Редагувати профіль"
          @click="startEdit"
        >
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        </button>
      </div>

      <form v-if="!editing" class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-zinc-500">ПІБ</p>
          <p class="mt-1 text-sm text-zinc-100">{{ fullName || '—' }}</p>
        </div>
        <div class="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2">
          <p class="text-xs uppercase tracking-wide text-zinc-500">Email</p>
          <p class="mt-1 text-sm text-zinc-100">{{ auth.user?.email ?? '—' }}</p>
        </div>
      </form>

      <form v-else class="mt-5 space-y-4" @submit.prevent="submitProfile">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Прізвище</label>
            <input
              v-model="form.lastName"
              type="text"
              class="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Ім'я</label>
            <input
              v-model="form.firstName"
              type="text"
              class="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500">По батькові</label>
            <input
              v-model="form.thirdName"
              type="text"
              class="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Новий пароль (залиште порожнім, щоб не змінювати)
            </label>
            <input
              v-model="form.password"
              type="password"
              minlength="8"
              class="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none"
              placeholder="Мінімум 8 символів"
            />
          </div>
        </div>
        <p v-if="profileError" class="text-sm text-red-400">{{ profileError }}</p>
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" :disabled="profileSaving" @click="cancelEdit">
            Скасувати
          </Button>
          <Button type="submit" variant="secondary" :disabled="profileSaving">
            {{ profileSaving ? 'Збереження…' : 'Зберегти' }}
          </Button>
        </div>
      </form>
    </div>

    <div class="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h3 class="text-base font-medium text-zinc-200">Мої сесії</h3>
        <button
          type="button"
          class="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800 focus:outline-none"
          :disabled="loading"
          @click="loadSessions"
        >
          {{ loading ? 'Оновлення...' : 'Оновити' }}
        </button>
      </div>

      <p v-if="error" class="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
        {{ error }}
      </p>

      <div v-if="loading" class="text-sm text-zinc-400">Завантаження сесій...</div>
      <div v-else-if="sessions.length === 0" class="text-sm text-zinc-500">
        Активні сесії не знайдено.
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="truncate text-sm text-zinc-100">{{ session.userAgent || 'Невідомий пристрій' }}</p>
              <p class="mt-1 text-xs text-zinc-400">
                IP: {{ session.ipAddress || '—' }} | Закінчується: {{ formatDate(session.expiresAt) }}
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-lg border border-red-500/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/20 focus:outline-none disabled:opacity-60"
              :disabled="deletingSessionId === session.id"
              @click="deleteSession(session.id)"
            >
              {{ deletingSessionId === session.id ? 'Видалення...' : 'Видалити' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuth } from '@/features/auth';
import { profileApi } from '@/features/profile';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/ui';
import { useToast } from '@/shared/ui/Toast';

type SessionItem = {
  id: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt?: string;
};

type RawSessionItem = {
  id: string;
  userId?: string;
  user_id?: string;
  ipAddress?: string | null;
  ip_address?: string | null;
  userAgent?: string | null;
  user_agent?: string | null;
  expiresAt?: string;
  expires_at?: string;
};

const auth = useAuth();
const { success, error: showError } = useToast();
const loading = ref(false);
const error = ref('');
const sessions = ref<SessionItem[]>([]);
const deletingSessionId = ref<string | null>(null);

const editing = ref(false);
const profileSaving = ref(false);
const profileError = ref('');
const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  thirdName: '',
});

function startEdit() {
  const u = auth.user;
  if (!u) return;
  form.value = {
    email: u.email ?? '',
    password: '',
    firstName: u.firstName ?? '',
    lastName: u.lastName ?? '',
    thirdName: u.thirdName ?? '',
  };
  profileError.value = '';
  editing.value = true;
}

function cancelEdit() {
  editing.value = false;
  profileError.value = '';
}

async function submitProfile() {
  profileError.value = '';
  profileSaving.value = true;
  try {
    const payload: Record<string, string> = {
      email: form.value.email,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
    };
    if (form.value.thirdName !== undefined) payload.thirdName = form.value.thirdName;
    if (form.value.password.trim()) payload.password = form.value.password;
    await profileApi.updateProfile(payload);
    await auth.fetchMe();
    editing.value = false;
    success('Профіль оновлено');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося зберегти';
    profileError.value = msg;
    showError(msg);
  } finally {
    profileSaving.value = false;
  }
}

const fullName = computed(() => {
  const u = auth.user;
  if (!u) return '';
  return [u.lastName, u.firstName, u.thirdName].filter(Boolean).join(' ');
});

function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function normalizeSession(raw: RawSessionItem): SessionItem {
  return {
    id: raw.id,
    userId: raw.userId ?? raw.user_id ?? '',
    ipAddress: raw.ipAddress ?? raw.ip_address ?? null,
    userAgent: raw.userAgent ?? raw.user_agent ?? null,
    expiresAt: raw.expiresAt ?? raw.expires_at,
  };
}

async function loadSessions() {
  if (!auth.user?.id) return;
  loading.value = true;
  error.value = '';
  try {
    const allRaw = await apiClient.get<RawSessionItem[]>('/sessions');
    const normalized = allRaw.map(normalizeSession);
    sessions.value = normalized.filter((item) => item.userId === auth.user?.id);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося завантажити сесії';
    error.value = msg;
    showError(msg);
    sessions.value = [];
  } finally {
    loading.value = false;
  }
}

async function deleteSession(sessionId: string) {
  deletingSessionId.value = sessionId;
  error.value = '';
  try {
    await apiClient.delete(`/sessions/${sessionId}`);
    sessions.value = sessions.value.filter((session) => session.id !== sessionId);
    success('Сесію видалено');
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Не вдалося видалити сесію';
    error.value = msg;
    showError(msg);
  } finally {
    deletingSessionId.value = null;
  }
}

onMounted(() => {
  void loadSessions();
});
</script>
