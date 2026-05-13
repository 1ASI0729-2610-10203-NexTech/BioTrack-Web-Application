<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import AppLayout from './shared/presentation/layouts/app-layout/AppLayout.vue'

const route = useRoute()
const usesDashboardLayout = computed(() => route.meta.layout !== 'public')
</script>

<template>
  <Toast position="top-right" />
  <AppLayout v-if="usesDashboardLayout" />
  <RouterView v-else />
</template>
