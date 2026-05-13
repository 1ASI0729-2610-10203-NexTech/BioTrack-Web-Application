<script setup>
import DataTable from 'primevue/datatable'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <DataTable v-bind="$attrs">
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>
  </DataTable>
</template>
