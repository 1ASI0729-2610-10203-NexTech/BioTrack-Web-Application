<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './shared/presentation/layouts/app-layout/AppLayout.vue'

const route = useRoute()
const usesDashboardLayout = computed(() => route.meta.layout !== 'public')
</script>

<template>
  <AppLayout v-if="usesDashboardLayout" />
  <RouterView v-else />
</template>
