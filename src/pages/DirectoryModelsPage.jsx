import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { directoriesAPI, modelsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function DirectoryModelsPage() {
  const params = useParams()
  const id = params.id
  const navigate = useNavigate()
  const { isAdmin, getAuthHeaders } = useAuth()
  const [directory, setDirectory] = useState(null)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [dir, mods] = await Promise.all([
        directoriesAPI.getById(id),
        directoriesAPI.getModels(id)
      ])
      setDirectory(dir)
      setModels(mods)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (modelId, e) => {
    e.stopPropagation()
    if (!confirm('Удалить модель? Все результаты проверок будут удалены.')) return
    try {
      await modelsAPI.delete(modelId, getAuthHeaders())
      setModels(models.filter(m => m.id !== modelId))
    } catch (err) {
      alert('Ошибка удаления: ' + err.message)
    }
  }

  const getStatusColor = (hasAxisErrors, hasLevelErrors) => {
    if (hasAxisErrors || hasLevelErrors) return 'bg-red-400'
    return 'bg-green-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-600">Все директории</Link>
        <span>/</span>
        <span className="text-gray-900">{directory?.name}</span>
      </nav>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Модели в директории</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map(model => {
          const hasAxisErrors = model.axis_error_count > 0
          const hasLevelErrors = model.level_error_count > 0
          const axisTotal = model.total_axes_in_model || 0
          const levelTotal = model.total_levels_in_model || 0
          const axisSuccessRate = axisTotal > 0 ? Math.round((model.axis_success_count / axisTotal) * 100) : 0
          const levelSuccessRate = levelTotal > 0 ? Math.round((model.level_success_count / levelTotal) * 100) : 0
          const latestCheck = model.axis_check_date || model.level_check_date
          
          return (
            <div key={model.id} onClick={() => navigate(`/directory/${id}/model/${model.id}`)} className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow relative">
              {isAdmin && (
                <button onClick={(e) => handleDelete(model.id, e)} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1 pr-6">{model.model_name}</h3>
                <span className={`w-3 h-3 rounded-full ${getStatusColor(hasAxisErrors, hasLevelErrors)}`}></span>
              </div>
              
              {latestCheck && (
                <div className="text-sm text-gray-500 mb-3">
                  Проверка: {new Date(latestCheck).toLocaleString('ru-RU')}
                </div>
              )}

              <div className="space-y-3">
                {/* Оси */}
                <div className="border-t pt-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Оси</div>
                  {axisTotal > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className={`h-1.5 rounded-full ${hasAxisErrors ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${axisSuccessRate}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">{model.axis_success_count} ок</span>
                        <span className="text-red-600">{model.axis_error_count} ошибок</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">Нет данных</div>
                  )}
                </div>

                {/* Уровни */}
                <div className="border-t pt-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Уровни</div>
                  {levelTotal > 0 ? (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div className={`h-1.5 rounded-full ${hasLevelErrors ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${levelSuccessRate}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">{model.level_success_count} ок</span>
                        <span className="text-red-600">{model.level_error_count} ошибок</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">Нет данных</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {models.length === 0 && (
        <div className="text-center py-12 text-gray-500">Модели не найдены</div>
      )}
    </div>
  )
}
