<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse text-sm">
      <thead>
        <tr class="border-b border-zinc-700">
          <slot name="head" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="getKey(item)"
          class="border-b border-zinc-800 transition-colors hover:bg-zinc-800/50"
        >
          <slot name="row" :item="item" />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    items: any[];
    keyField?: string;
  }>(),
  { keyField: 'id' }
);

function getKey(item: any): string | number {
  const value = (item as Record<string, unknown>)[props.keyField];
  return value as string | number;
}
</script>
