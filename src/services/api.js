import axios from 'axios'

const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:3001/api'

const api = axios.create({ baseURL: API_BASE_URL })

export const authAPI = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    return res.data
  },
  verify: async (credentials) => {
    const res = await api.post('/auth/verify', {}, {
      headers: { Authorization: `Basic ${credentials}` }
    })
    return res.data
  }
}

export const directoriesAPI = {
  getAll: async () => {
    const res = await api.get('/directories')
    return res.data
  },
  getById: async (id) => {
    const res = await api.get('/directories')
    const dirs = res.data
    return dirs.find(d => d.id === parseInt(id))
  },
  getModels: async (id) => {
    const res = await api.get(`/directories/${id}/models`)
    return res.data
  },
  getReferenceAxes: async (id) => {
    const res = await api.get(`/directories/${id}/reference-axes`)
    return res.data
  }
}

export const modelsAPI = {
  getById: async (id) => {
    const res = await api.get(`/models/${id}/check-report`)
    return res.data
  },
  delete: async (id, authHeaders) => {
    const res = await api.delete(`/models/${id}`, { headers: authHeaders })
    return res.data
  },
  getAxisReport: async (id) => {
    const res = await api.get(`/models/${id}/check-report`)
    return res.data
  },
  getCheckHistory: async (id) => {
    const res = await api.get(`/models/${id}/check-history`)
    return res.data
  }
}

export const statsAPI = {
  getOverall: async () => {
    const res = await api.get('/stats/overall')
    return res.data
  }
}

export const checkResultsAPI = {
  delete: async (id, authHeaders) => {
    const res = await api.delete(`/check-results/${id}`, { headers: authHeaders })
    return res.data
  }
}