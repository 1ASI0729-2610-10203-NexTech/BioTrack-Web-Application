import axios from 'axios'

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
      timeout: 8000,
    })
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
