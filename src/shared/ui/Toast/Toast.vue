<template>
  <Transition name="toast">
    <div
      v-if="visible"
      role="alert"
      class="voxio-toast"
      :class="[
        'group relative flex items-center gap-3 rounded-xl border backdrop-blur-sm min-w-[300px] max-w-[420px] px-4 py-3',
        'shadow-xl shadow-black/20',
        variantClasses[toast.variant],
      ]"
    >
      <div
        :class="[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-semibold tabular-nums',
          toast.onUndo ? 'bg-emerald-500/20 text-emerald-400 text-lg' : iconBgClasses[toast.variant],
        ]"
      >
        <span v-if="toast.onUndo">{{ countdown }}</span>
        <component v-else :is="icons[toast.variant]" :class="iconClasses[toast.variant]" />
      </div>
      <p class="flex-1 min-w-0 text-sm font-medium leading-snug text-zinc-100">
        {{ toast.message }}
      </p>
      <template v-if="toast.onUndo">
        <button
          type="button"
          class="shrink-0 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          @click="handleUndo"
        >
          Скасувати
        </button>
      </template>
      <button
        v-else
        type="button"
        class="shrink-0 rounded-lg p-1.5 text-zinc-400 opacity-60 transition-all hover:bg-zinc-700/50 hover:opacity-100 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        aria-label="Закрити"
        @click="dismiss"
      >
        <CloseIcon class="h-4 w-4" />
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h } from 'vue';
import type { ToastItem, ToastVariant } from './types';

const props = defineProps<{
  toast: ToastItem;
}>();

const emit = defineEmits<{
  dismiss: [id: string];
}>();

const visible = ref(false);
const DEFAULT_DURATION = 5000;

const countdown = ref(
  props.toast.onUndo && props.toast.undoDuration
    ? Math.ceil(props.toast.undoDuration / 1000)
    : 0
);

let countdownIntervalId: ReturnType<typeof setInterval> | null = null;

const variantClasses: Record<ToastVariant, string> = {
  success:
    'border-emerald-500/30 bg-zinc-900/95 bg-gradient-to-br from-emerald-500/15 to-transparent',
  error:
    'border-red-500/30 bg-zinc-900/95 bg-gradient-to-br from-red-500/15 to-transparent',
  info:
    'border-amber-500/30 bg-zinc-900/95 bg-gradient-to-br from-amber-500/15 to-transparent',
  warning:
    'border-amber-400/40 bg-zinc-900/95 bg-gradient-to-br from-amber-400/20 to-transparent',
};

const iconBgClasses: Record<ToastVariant, string> = {
  success: 'bg-emerald-500/20 text-emerald-400',
  error: 'bg-red-500/20 text-red-400',
  info: 'bg-amber-500/20 text-amber-400',
  warning: 'bg-amber-400/25 text-amber-300',
};

const iconClasses: Record<ToastVariant, string> = {
  success: 'h-5 w-5',
  error: 'h-5 w-5',
  info: 'h-5 w-5',
  warning: 'h-5 w-5',
};

const CheckIcon = () =>
  h(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor' },
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z',
      'clip-rule': 'evenodd',
    })
  );

const XIcon = () =>
  h(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor' },
    h('path', {
      d: 'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 101.06 1.06L10 11.06l2.72 2.72a.75.75 0 101.06-1.06L11.06 10l2.72-2.72a.75.75 0 00-1.06-1.06L10 8.94 7.28 6.22z',
    })
  );

const InfoIcon = () =>
  h(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor' },
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z',
      'clip-rule': 'evenodd',
    })
  );

const ExclamationIcon = () =>
  h(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor' },
    h('path', {
      'fill-rule': 'evenodd',
      d: 'M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z',
      'clip-rule': 'evenodd',
    })
  );

const CloseIcon = () =>
  h(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 20 20', fill: 'currentColor' },
    h('path', {
      d: 'M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-2.72 2.72a.75.75 0 101.06 1.06L10 11.06l2.72 2.72a.75.75 0 101.06-1.06L11.06 10l2.72-2.72a.75.75 0 00-1.06-1.06L10 8.94 7.28 6.22z',
    })
  );

const icons: Record<ToastVariant, () => ReturnType<typeof h>> = {
  success: CheckIcon,
  error: XIcon,
  info: InfoIcon,
  warning: ExclamationIcon,
};

let timeoutId: ReturnType<typeof setTimeout> | null = null;

function dismiss() {
  visible.value = false;
  if (timeoutId) clearTimeout(timeoutId);
  if (countdownIntervalId) clearInterval(countdownIntervalId);
  setTimeout(() => emit('dismiss', props.toast.id), 250);
}

function handleUndo() {
  props.toast.onUndo?.();
  dismiss();
}

onMounted(() => {
  visible.value = true;
  const duration = props.toast.duration ?? DEFAULT_DURATION;

  if (props.toast.onUndo && props.toast.undoDuration) {
    countdownIntervalId = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0 && countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
    }, 1000);
  }

  if (duration > 0) {
    timeoutId = setTimeout(dismiss, duration);
  }
});

onBeforeUnmount(() => {
  if (countdownIntervalId) clearInterval(countdownIntervalId);
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(80%) scale(0.95);
}
</style>
