import axios from 'axios'
import { appEnvironment, getEnvironmentSummary } from '../../config/env'

class ApiService {
  constructor() {
    this.lastLoggedError = { fingerprint: '', timestamp: 0 }
    if (!appEnvironment.apiBaseUrl) {
      console.error(
        '[BioTrack Environment] Missing VITE_API_BASE_URL. Configure a public backend URL before deploying to production.',
      )
    }

    this.client = axios.create({
      baseURL: appEnvironment.apiBaseUrl,
      timeout: appEnvironment.apiTimeout,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    this.configureInterceptors()
    this.logEnvironment()
  }

  configureInterceptors() {
    this.client.interceptors.request.use((config) => {
      if (appEnvironment.enableApiDebug) {
        console.info('[BioTrack API Request]', {
          method: config.method?.toUpperCase(),
          url: `${config.baseURL ?? ''}${config.url ?? ''}`,
          params: config.params ?? null,
          payload: this.sanitizePayload(config.data),
        })
      }
      return config
    })

    this.client.interceptors.response.use(
      (response) => {
        if (appEnvironment.enableApiDebug) {
          console.info('[BioTrack API Response]', {
            method: response.config.method?.toUpperCase(),
            url: response.config.url,
            status: response.status,
            data: response.data,
          })
        }
        return response
      },
      (error) => {
        const normalizedError = {
          message:
            error.response?.data?.message ||
            error.response?.data?.detail ||
            error.response?.data?.title ||
            error.message ||
            'API request failed',
          status: error.response?.status ?? null,
          url: error.config?.url ?? '',
          method: error.config?.method ?? '',
          details: error.response?.data ?? null,
          payload: this.sanitizePayload(error.config?.data),
        }

        const fingerprint = `${normalizedError.method}:${normalizedError.url}:${normalizedError.status}:${normalizedError.message}`
        const now = Date.now()
        const isRepeated =
          fingerprint === this.lastLoggedError.fingerprint &&
          now - this.lastLoggedError.timestamp < 5000

        if (appEnvironment.enableApiDebug && !error.config?.suppressErrorLog && !isRepeated) {
          console.error('[BioTrack API]', normalizedError)
          this.lastLoggedError = { fingerprint, timestamp: now }
        }

        return Promise.reject(normalizedError)
      },
    )
  }

  sanitizePayload(payload) {
    if (!payload) return payload ?? null
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : payload
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          key.toLowerCase().includes('password') ? '[REDACTED]' : value,
        ]),
      )
    } catch {
      return '[unavailable]'
    }
  }

  logEnvironment() {
    if (appEnvironment.enableApiDebug) {
      console.info('[BioTrack Environment]', getEnvironmentSummary())
    }
  }

  restoreTokenFromSession() {
    const token = localStorage.getItem('biotrack.access-token')
    if (token) this.setAccessToken(token)
  }

  setAccessToken(token) {
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`
      return
    }

    delete this.client.defaults.headers.common.Authorization
  }

  get(url, config) {
    return this.client.get(url, config).then(({ data }) => data)
  }

  post(url, payload, config) {
    return this.client.post(url, payload, config).then(({ data }) => data)
  }

  put(url, payload, config) {
    return this.client.put(url, payload, config).then(({ data }) => data)
  }

  patch(url, payload, config) {
    return this.client.patch(url, payload, config).then(({ data }) => data)
  }
}

export const apiService = new ApiService()
apiService.restoreTokenFromSession()
