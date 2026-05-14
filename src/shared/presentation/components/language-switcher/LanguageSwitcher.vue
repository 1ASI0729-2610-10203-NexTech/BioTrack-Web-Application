<script setup>
import { computed } from 'vue'
import SelectButton from 'primevue/selectbutton'
import { useI18n } from 'vue-i18n'
import { localeStorageKey, supportedLocales } from '../../../../locales'

const { locale, t } = useI18n()

const currentLocale = computed({
  get: () => locale.value,
  set: (value) => {
    locale.value = value
    localStorage.setItem(localeStorageKey, value)
    document.documentElement.lang = value
  },
})
</script>

<template>
  <div class="bt-language-switcher" role="group" :aria-label="t('app.languageSelector')">
    <span class="bt-language-switcher__label">{{ t('app.language') }}</span>
    <SelectButton
      v-model="currentLocale"
      :options="supportedLocales"
      option-label="shortLabel"
      option-value="code"
      :allow-empty="false"
      :aria-label="t('app.languageSelector')"
      class="bt-language-switcher__control"
    >
      <template #option="{ option }">
        <span :aria-label="option.ariaLabel">{{ option.shortLabel }}</span>
      </template>
    </SelectButton>
  </div>
</template>
