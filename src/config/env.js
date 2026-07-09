const DEFAULT_API_BASE_URL = 'https://biotrack-platform.onrender.com/api/v1'
const DEFAULT_API_TIMEOUT = 8000
const DEFAULT_APP_ENV = 'development'
const TRUE_VALUES = ['true', '1', 'yes']
const PRODUCTION_API_HOST = 'biotrack-platform.onrender.com'
const FRONTEND_HOSTS = new Set([
  'biotrack-frontend-blkn.onrender.com',
  'biotrack-app-nextech.web.app',
])

function resolveApiBaseUrl() {
  const configuredUrl = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl)
      if (FRONTEND_HOSTS.has(url.hostname)) return DEFAULT_API_BASE_URL
      if (url.hostname === PRODUCTION_API_HOST) {
        url.pathname = '/api/v1'
        url.search = ''
        url.hash = ''
        return url.toString().replace(/\/$/, '')
      }
      return configuredUrl.replace(/\/$/, '')
    } catch {
      return DEFAULT_API_BASE_URL
    }
  }
  return DEFAULT_API_BASE_URL
}

function normalizeNumber(value, fallback) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const appEnvironment = Object.freeze({
  appEnv: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || DEFAULT_APP_ENV,
  apiBaseUrl: resolveApiBaseUrl(),
  apiTimeout: normalizeNumber(import.meta.env.VITE_API_TIMEOUT, DEFAULT_API_TIMEOUT),
  githubPagesBasePath: import.meta.env.BASE_URL,
  enableApiDebug: TRUE_VALUES.includes(String(import.meta.env.VITE_ENABLE_API_DEBUG).toLowerCase()),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
})

export function getEnvironmentSummary() {
  return {
    appEnv: appEnvironment.appEnv,
    apiBaseUrl: appEnvironment.apiBaseUrl,
    apiTimeout: appEnvironment.apiTimeout,
    githubPagesBasePath: appEnvironment.githubPagesBasePath,
  }
}
