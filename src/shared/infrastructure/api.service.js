import axios from 'axios'
import { appEnvironment, getEnvironmentSummary } from '../../config/env'

class ApiService {
  constructor() {
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
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const normalizedError = {
          message: error.response?.data?.message || error.message || 'API request failed',
          status: error.response?.status ?? null,
          url: error.config?.url ?? '',
          method: error.config?.method ?? '',
          details: error.response?.data ?? null,
        }

        if (appEnvironment.enableApiDebug) {
          console.error('[BioTrack API]', normalizedError)
        }

        return Promise.reject(normalizedError)
      },
    )
  }

  logEnvironment() {
    if (appEnvironment.enableApiDebug) {
      console.info('[BioTrack Environment]', getEnvironmentSummary())
    }
  }

  restoreTokenFromSession() {
    try {
      const stored = JSON.parse(localStorage.getItem('biotrack.mock-session') ?? 'null')
      if (stored?.token) this.setAccessToken(stored.token)
    } catch {
      // no stored session
    }
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

  patch(url, payload, config) {
    return this.client.patch(url, payload, config).then(({ data }) => data)
  }
}

export const apiService = new ApiService()
apiService.restoreTokenFromSession()
