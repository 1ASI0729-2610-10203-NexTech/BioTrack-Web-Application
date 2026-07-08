<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import { corporateRegisterApiService } from '../../infrastructure/corporate-register-api.service'

const { t } = useI18n()

const form = ref({
  name: '',
  ruc: '',
  sector: '',
  country: '',
  city: '',
})

const submitted = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await corporateRegisterApiService.registerCompany(form.value)
    submitted.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="bt-corporate-dashboard">
    <header class="bt-dashboard-heading">
      <div>
        <p class="microcopy">{{ t('corporate.register.eyebrow') }}</p>
        <h1>{{ t('corporate.register.title') }}</h1>
        <p class="text-muted">{{ t('corporate.register.subtitle') }}</p>
      </div>
      <div
          class="bt-kpi-card"
          style="min-height: auto; padding: 12px 20px; border-radius: 999px; text-align: center; width: max-content;"
          :style="submitted
          ? 'background: var(--bt-success-soft); border-color: var(--bt-success);'
          : 'background: var(--bt-surface); border-color: var(--bt-border);'"
      >
        <span :style="submitted ? 'color: var(--bt-success-dark);' : 'color: var(--bt-text-muted);'">
          {{ submitted ? t('corporate.register.createdStatus') : t('corporate.register.pendingStatus') }}
        </span>
      </div>
    </header>

    <div
        v-if="submitted"
        class="bt-panel-note"
        style="border-radius: 8px; padding: 12px 16px; background: var(--bt-success-soft); border-color: var(--bt-success);"
    >
      {{ t('corporate.register.successMessage') }}
    </div>

    <div class="bt-form-with-side">
      <article class="bt-dashboard-panel" style="align-content: start;">
        <div class="bt-two-col-form">
          <label>
            {{ t('corporate.register.legalName') }}
            <input
                v-model="form.name"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.name }"
                placeholder="TechCorp S.A.C."
                :disabled="submitted"
            />
          </label>
          <label>
            {{ t('corporate.register.ruc') }}
            <input
                v-model="form.ruc"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.ruc }"
                placeholder="20601234567"
                :disabled="submitted"
            />
          </label>
          <label>
            {{ t('corporate.register.sector') }}
            <input
                v-model="form.sector"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.sector }"
                :placeholder="t('corporate.register.sectorPlaceholder')"
                :disabled="submitted"
            />
          </label>
          <label>
            {{ t('corporate.register.country') }}
            <input
                v-model="form.country"
                class="p-inputtext"
                :class="{ 'bt-input-success': form.country }"
                :placeholder="t('corporate.register.countryPlaceholder')"
                :disabled="submitted"
            />
          </label>
        </div>

        <label>
          {{ t('corporate.register.city') }}
          <input
              v-model="form.city"
              class="p-inputtext"
              :class="{ 'bt-input-success': form.city }"
              placeholder="Lima"
              :disabled="submitted"
          />
        </label>

        <p class="text-muted bt-small" style="margin: 0; padding: 12px 16px; background: var(--bt-primary-soft); border-radius: var(--radius-md);">
          {{ t('corporate.register.nextStep') }}
        </p>

        <div v-if="!submitted">
          <Button
              :label="loading ? t('corporate.register.registering') : t('corporate.register.registerCompany')"
              :disabled="loading"
              class="bt-dashboard-export"
              @click="handleSubmit"
          />
        </div>
      </article>

      <div style="display: grid; gap: 14px; align-content: start;">
        <article class="bt-kpi-card bt-kpi-card--primary" style="min-height: auto;">
          <span>{{ t('corporate.register.status') }}</span>
          <strong>{{ t('corporate.register.pendingVerification') }}</strong>
        </article>

        <article class="bt-dashboard-panel" style="padding: 24px;">
          <h3 style="margin: 0 0 16px;">{{ t('corporate.register.nextSteps') }}</h3>
          <ul class="bt-steps-list">
            <li>
              <strong>{{ t('corporate.register.companyRegistered') }}</strong>
              <span>{{ submitted ? t('common.completed') : t('corporate.register.pendingStatus') }}</span>
            </li>
            <li>
              <strong>{{ t('corporate.register.validateRuc') }}</strong>
              <span>{{ t('corporate.register.pendingStatus') }}</span>
            </li>
            <li>
              <strong>{{ t('corporate.register.uploadCollaborators') }}</strong>
              <span>{{ t('corporate.register.pendingStatus') }}</span>
            </li>
          </ul>

          <Button
              :label="t('corporate.register.validateRucButton')"
              :disabled="!submitted"
              class="bt-dashboard-export"
              style="width: 100%; margin-top: 20px;"
          />
        </article>
      </div>
    </div>
  </section>
</template>
