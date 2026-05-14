<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Drawer from 'primevue/drawer'
import AppSidebar from '../../components/app-sidebar/AppSidebar.vue'
import AppTopbar from '../../components/app-topbar/AppTopbar.vue'

const navigationVisible = ref(false)
const { t } = useI18n()

function openNavigation() {
  navigationVisible.value = true
}
</script>

<template>
  <div class="bt-dashboard-shell">
    <a class="bt-skip-link" href="#dashboard-main">{{ t('app.skipToContent') }}</a>
    <AppSidebar class="bt-dashboard-sidebar" />

    <Drawer
      v-model:visible="navigationVisible"
      class="bt-dashboard-drawer"
      position="left"
      :show-close-icon="false"
    >
      <AppSidebar drawer @navigate="navigationVisible = false" />
    </Drawer>

    <section class="bt-dashboard-stage" :aria-label="t('app.mainContent')">
      <AppTopbar @toggle-navigation="openNavigation" />

      <main id="dashboard-main" class="bt-dashboard-content" tabindex="-1">
        <RouterView />
      </main>
    </section>
  </div>
</template>
