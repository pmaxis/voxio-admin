<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :to="to"
    :disabled="disabled"
    :class="buttonClass"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'dangerGhost'
  | 'link'
  | 'sidebar'
  | 'sidebarDanger'
  | 'bare';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    type?: 'button' | 'submit';
    disabled?: boolean;
    to?: RouteLocationRaw;
    size?: 'sm' | 'md' | 'full' | 'icon-sm' | 'icon-md';
  }>(),
  {
    variant: 'primary',
    type: 'button',
    disabled: false,
    size: 'md',
  }
);

const tag = computed(() => (props.to ? 'router-link' : 'button'));

const baseClass =
  'voxio-btn inline-flex rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 disabled:opacity-50 disabled:cursor-not-allowed';

const sharedIconLayout = 'items-center justify-center gap-2 font-medium';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    `${sharedIconLayout} bg-amber-600 text-zinc-950 hover:bg-amber-500`,
  secondary:
    `${sharedIconLayout} border border-amber-500/70 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30`,
  ghost:
    `${sharedIconLayout} border border-zinc-600 text-zinc-300 hover:bg-zinc-700`,
  danger:
    `${sharedIconLayout} bg-red-600/80 text-white hover:bg-red-600`,
  dangerGhost:
    `${sharedIconLayout} border border-red-500/40 text-red-300 hover:bg-red-500/20`,
  link:
    'rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/20',
  sidebar:
    'flex w-full items-center justify-start gap-3 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-normal text-zinc-300 hover:bg-zinc-800/80 hover:text-zinc-100',
  sidebarDanger:
    'flex w-full items-center justify-start gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-normal text-zinc-400 hover:bg-zinc-800/80 hover:text-red-400',
  bare: '',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  full: 'w-full px-4 py-2.5',
  'icon-sm': 'h-8 w-8 shrink-0 items-center justify-center',
  'icon-md': 'h-9 w-9 shrink-0 items-center justify-center',
};

const noSizeVariants = new Set(['link', 'sidebar', 'sidebarDanger']);

const buttonClass = computed(() => [
  baseClass,
  variantClasses[props.variant],
  noSizeVariants.has(props.variant) ? '' : sizeClasses[props.size ?? 'md'],
]);
</script>
