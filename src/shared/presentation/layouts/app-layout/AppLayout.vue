<script setup>
import { ref } from 'vue'
import Drawer from 'primevue/drawer'
import AppSidebar from '../../components/app-sidebar/AppSidebar.vue'
import AppTopbar from '../../components/app-topbar/AppTopbar.vue'

const navigationVisible = ref(false)

function openNavigation() {
  navigationVisible.value = true
}
</script>

<template>
  <div class="bt-dashboard-shell">
    <AppSidebar class="bt-dashboard-sidebar" />

    <Drawer
      v-model:visible="navigationVisible"
      class="bt-dashboard-drawer"
      position="left"
      :show-close-icon="false"
    >
      <AppSidebar drawer @navigate="navigationVisible = false" />
    </Drawer>

    <section class="bt-dashboard-stage">
      <AppTopbar @toggle-navigation="openNavigation" />

      <main class="bt-dashboard-content">
        <RouterView />
      </main>
    </section>
  </div>
</template>
