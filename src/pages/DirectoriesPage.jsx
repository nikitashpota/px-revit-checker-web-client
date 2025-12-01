import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { directoriesAPI, statsAPI } from '../services/api'

export default function DirectoriesPage() {
  const [directories, setDirectories] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(12)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [dirs, st] = await Promise.all([
        directoriesAPI.getAll(),
        statsAPI.getOverall()
      ])
      setDirectories(dirs)
      setStats(st)
    } catch (err) {
      console.error('Load error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...directories]
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      result = result.filter(d => d.name.toLowerCase().includes(searchLower))
    }
    result.sort((a, b) => {
      let compareA, compareB
      switch (sortBy) {
        case 'name':
          compareA = a.name.toLowerCase()
          compareB = b.name.toLowerCase()
          break
        case 'date':
          compareA = new Date(a.created_at)
          compareB = new Date(b.created_at)
          break
        case 'models':
          compareA = a.total_models
          compareB = b.total_models
          break
        case 'errors':
          compareA = (a.axis_error_models || 0) + (a.level_error_models || 0)
          compareB = (b.axis_error_models || 0) + (b.level_error_models || 0)
          break
        default:
          return 0
      }
      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [directories, search, sortBy, sortOrder])

  const totalPages = Math.ceil(filteredAndSorted.length / perPage)
  const paginatedDirs = filteredAndSorted.slice((page - 1) * perPage, page * perPage)

  useEffect(() => {
    setPage(1)
  }, [search, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        Ошибка загрузки: {error}
      </div>
    )
  }

  const totalAxisErrors = stats?.axis_total_errors || 0
  const totalLevelErrors = stats?.level_total_errors || 0
  const totalErrors = totalAxisErrors + totalLevelErrors

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Директории</h1>
      
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.total_directories}</div>
            <div className="text-sm text-gray-500">Директорий</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total_models}</div>
            <div className="text-sm text-gray-500">Моделей</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">
              {(stats.axis_models_with_errors || 0) + (stats.level_models_with_errors || 0)}
            </div>
            <div className="text-sm text-gray-500">С ошибками</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{totalErrors}</div>
            <div className="text-sm text-gray-500">Всего ошибок</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="name">По названию</option>
              <option value="date">По дате</option>
              <option value="models">По кол-ву моделей</option>
              <option value="errors">По ошибкам</option>
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
        {search && (
          <div className="mt-2 text-sm text-gray-500">
            Найдено: {filteredAndSorted.length} из {directories.length}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedDirs.map(dir => {
          const hasAxisErrors = (dir.axis_error_models || 0) > 0
          const hasLevelErrors = (dir.level_error_models || 0) > 0
          const hasErrors = hasAxisErrors || hasLevelErrors
          const totalDirErrors = (dir.axis_error_models || 0) + (dir.level_error_models || 0)
          const errorPercent = dir.total_models > 0 ? Math.round((totalDirErrors / dir.total_models) * 100) : 0
          
          return (
            <div key={dir.id} onClick={() => navigate(`/directory/${dir.id}`)} className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 truncate flex-1">{dir.name}</h3>
                <span className={`ml-2 w-3 h-3 rounded-full flex-shrink-0 ${hasErrors ? 'bg-yellow-400' : 'bg-green-400'}`}></span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Создана:</span>
                  <span className="text-gray-700">{new Date(dir.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Моделей:</span>
                  <span className="text-gray-700">{dir.total_models}</span>
                </div>
                
                {/* Оси */}
                <div className="border-t pt-2 mt-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Оси</div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">С ошибками:</span>
                    <span className={hasAxisErrors ? 'text-red-600 font-medium' : 'text-green-600'}>{dir.axis_error_models || 0}</span>
                  </div>
                  {(dir.axis_total_errors || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Всего ошибок:</span>
                      <span className="text-red-600">{dir.axis_total_errors}</span>
                    </div>
                  )}
                </div>

                {/* Уровни */}
                <div className="border-t pt-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Уровни</div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">С ошибками:</span>
                    <span className={hasLevelErrors ? 'text-red-600 font-medium' : 'text-green-600'}>{dir.level_error_models || 0}</span>
                  </div>
                  {(dir.level_total_errors || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Всего ошибок:</span>
                      <span className="text-red-600">{dir.level_total_errors}</span>
                    </div>
                  )}
                </div>

                {/* Площадки - заглушка */}
                <div className="border-t pt-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Площадки</div>
                  <div className="text-gray-400 text-xs">Скоро</div>
                </div>
              </div>

              {hasErrors && (
                <div className="mt-3 pt-3 border-t">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${Math.min(errorPercent, 100)}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{errorPercent}% моделей с ошибками</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {search ? 'Ничего не найдено' : 'Директории не найдены'}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="text-sm text-gray-500">Страница {page} из {totalPages}</div>
          <div className="flex gap-2">
            <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">«</button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">Назад</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">Вперед</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50">»</button>
          </div>
        </div>
      )}
    </div>
  )
}
