<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useIdentityAccessStore } from '../../../identity-access/application/identity-access.store'
import { progressTrackingRepository } from '../../infrastructure/progress-tracking.repository.js'

const route = useRoute()
const identityAccessStore = useIdentityAccessStore()
const { t } = useI18n()

const sessionUser = ref({ fullName: '', role: '', initials: 'JP' })

onMounted(() => {
  sessionUser.value = progressTrackingRepository.getSessionUser()
})

const navItems = computed(() => [
  { label: t('navigation.dashboard'), icon: 'pi pi-home', to: '/dashboard' },
  { label: t('navigation.myProfile'), icon: 'pi pi-user', to: '/patient-profile' },
  { label: t('navigation.myPatients'), icon: 'pi pi-users', to: '/patients', roles: ['NUTRICIONISTA'] },
  { label: t('navigation.nutritionalPlan'), icon: 'pi pi-check-square', to: '/nutritional-plan' },
  { label: t('navigation.myProgress'), icon: 'pi pi-chart-line', to: '/progress-tracking/consumption-record' },
  { label: t('navigation.consultations'), icon: 'pi pi-calendar', to: '/consultations', roles: ['PACIENTE', 'NUTRICIONISTA'] },
  { label: t('navigation.billing'), icon: 'pi pi-credit-card', to: '/subscriptions-billing' },
])

function isVisible(item) {
  if (!item.roles?.length) return true
  return item.roles.includes(identityAccessStore.role)
}

function isProgressSectionActive() {
  return route.path.startsWith('/progress-tracking')
}

const progressModuleLinks = computed(() => [
  { label: t('progressTracking.sidebar.consumptionRecord'), to: '/progress-tracking/consumption-record' },
  { label: t('progressTracking.sidebar.progressChart'), to: '/progress-tracking/progress-chart' },
  { label: t('progressTracking.sidebar.adherencePlan'), to: '/progress-tracking/adherence-plan' },
  { label: t('progressTracking.sidebar.weeklyWeight'), to: '/progress-tracking/update-weekly-weight' },
  { label: t('progressTracking.sidebar.physicalActivity'), to: '/progress-tracking/activity-record' },
])
</script>

<template>
  <aside class="pt-sidebar" :aria-label="t('progressTracking.sidebar.moduleNavigation')">
    <img src="../../../assets/logo.png" alt="BioTrack" class="pt-sidebar__brand-logo" />
    <p class="pt-sidebar__menu-label">{{ t('progressTracking.sidebar.menu') }}</p>
    <nav class="pt-sidebar__nav" :aria-label="t('app.mainNavigation')">
      <RouterLink
        v-for="item in navItems"
        v-show="isVisible(item)"
        :key="item.to"
        :to="item.to"
        class="pt-sidebar__link"
        :class="{ 'pt-sidebar__link--active': item.to.includes('/progress-tracking') && isProgressSectionActive() }"
      >
        <i :class="item.icon" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <section
      v-if="isProgressSectionActive()"
      class="pt-sidebar__section"
      :aria-label="t('progressTracking.sidebar.progressSections')"
    >
      <p class="pt-sidebar__section-title">{{ t('navigation.myProgress') }}</p>
      <RouterLink
        v-for="item in progressModuleLinks"
        :key="item.to"
        :to="item.to"
        class="pt-sidebar__sublink"
        :class="{ 'pt-sidebar__sublink--active': route.path === item.to }"
      >
        {{ item.label }}
      </RouterLink>
    </section>

    <div class="pt-sidebar__footer">
      <div class="pt-sidebar__user">
        <span class="pt-sidebar__avatar" aria-hidden="true">{{ sessionUser.initials }}</span>
        <div class="pt-sidebar__user-text">
          <strong>{{ sessionUser.fullName }}</strong>
          <span>{{ sessionUser.role }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>
