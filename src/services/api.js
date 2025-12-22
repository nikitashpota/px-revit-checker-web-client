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
  },
  getClashesReport: async (id) => {
    const res = await api.get(`/directories/${id}/clashes-report`)
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
  getLevelsReport: async (id) => {
    const res = await api.get(`/models/${id}/levels-report`)
    return res.data
  },
  getCheckHistory: async (id) => {
    const res = await api.get(`/models/${id}/check-history`)
    return res.data
  }
}

export const clashesAPI = {
  getDirectoryReport: async (directoryId) => {
    const res = await api.get(`/directories/${directoryId}/clashes-report`)
    return res.data
  },
  getHistory: async (directoryId, params = {}) => {
    const res = await api.get(`/directories/${directoryId}/clashes-history`, { params })
    return res.data
  },
  getTestsList: async (directoryId, params = {}) => {
    const res = await api.get(`/directories/${directoryId}/clash-tests-list`, { params })
    return res.data
  },
  getFileTests: async (fileId) => {
    const res = await api.get(`/navisworks-files/${fileId}/clash-tests`)
    return res.data
  },
  getTestResults: async (testId, params = {}) => {
    const res = await api.get(`/clash-tests/${testId}/results`, { params })
    return res.data
  },
  getResultImage: (resultId) => {
    return `${API_BASE_URL}/clash-results/${resultId}/image`
  },
  deleteFile: async (fileId, authHeaders) => {
    const res = await api.delete(`/navisworks-files/${fileId}`, { headers: authHeaders })
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