<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  eyebrowKey: {
    type: String,
    default: 'pages.placeholderEyebrow',
  },
  titleKey: {
    type: String,
    default: '',
  },
  descriptionKey: {
    type: String,
    default: 'pages.placeholderDescription',
  },
})

const { t } = useI18n()
const resolvedEyebrow = computed(() => props.eyebrow || t(props.eyebrowKey))
const resolvedTitle = computed(() => props.title || t(props.titleKey))
const resolvedDescription = computed(() => props.description || t(props.descriptionKey))
</script>

<template>
  <section class="context-panel">
    <p class="microcopy">{{ resolvedEyebrow }}</p>
    <h1>{{ resolvedTitle }}</h1>
    <p class="panel-copy">{{ resolvedDescription }}</p>
  </section>
</template>
