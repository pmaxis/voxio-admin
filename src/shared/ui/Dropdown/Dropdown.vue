<template>
  <div ref="rootRef" class="relative inline-block">
    <button
      type="button"
      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
      aria-haspopup="true"
      :aria-expanded="open"
      @click="toggle"
    >
      <span class="sr-only">Дії</span>
      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
        />
      </svg>
    </button>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-show="open"
          ref="panelRef"
          class="fixed z-100 min-w-40 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-lg"
          role="menu"
          :style="panelStyle"
          @click="open = false"
        >
          <slot />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const panelStyle = ref<Record<string, string>>({});

function updatePosition() {
  if (!rootRef.value) return;
  const rect = rootRef.value.getBoundingClientRect();
  const gap = 4;
  const spaceBelow = window.innerHeight - rect.bottom;
  const panelHeight = 120;
  const openUpward = spaceBelow < panelHeight && rect.top > spaceBelow;
  const rightPx = window.innerWidth - rect.right;
  if (openUpward) {
    panelStyle.value = {
      bottom: `${window.innerHeight - rect.top + gap}px`,
      right: `${rightPx}px`,
      top: 'auto',
      left: 'auto',
      transformOrigin: 'bottom right',
    };
  } else {
    panelStyle.value = {
      top: `${rect.bottom + gap}px`,
      right: `${rightPx}px`,
      bottom: 'auto',
      left: 'auto',
      transformOrigin: 'top right',
    };
  }
}

function toggle() {
  if (!open.value) {
    updatePosition();
  }
  open.value = !open.value;
}

function handleClickOutside(e: MouseEvent) {
  if (
    rootRef.value &&
    !rootRef.value.contains(e.target as Node) &&
    panelRef.value &&
    !panelRef.value.contains(e.target as Node)
  ) {
    open.value = false;
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    updatePosition();
    document.addEventListener('click', handleClickOutside, true);
  } else {
    document.removeEventListener('click', handleClickOutside, true);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside, true);
});
</script>
