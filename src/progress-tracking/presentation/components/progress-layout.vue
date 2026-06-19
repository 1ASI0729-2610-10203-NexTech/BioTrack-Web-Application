<script setup>
import '../styles/progress-tracking.css'
import ProgressSidebar from './progress-sidebar.vue'
import ProgressTopbar from './progress-topbar.vue'
</script>

<template>
  <div class="pt-scope">
    <div class="pt-shell">
      <ProgressSidebar />
      <div class="pt-main">
        <ProgressTopbar />
        <div class="pt-content">
          <RouterView />
        </div>
      </div>
    </div>
  </div>
</template>
