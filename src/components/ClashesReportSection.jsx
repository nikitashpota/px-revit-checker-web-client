import { useState, useEffect, useMemo } from 'react'
import { clashesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Конвертация футов в мм
const feetToMm = (feet) => {
  if (!feet && feet !== 0) return null
  return feet * 304.8
}

// Копирование в буфер
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
}

// Компонент для копируемого ID
function CopyableId({ label, id }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = () => {
    if (!id) return
    copyToClipboard(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  
  if (!id) return null
  
  return (
    <div 
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 hover:bg-blue-100 rounded text-xs font-mono cursor-pointer transition-colors"
      title="Нажмите чтобы скопировать"
    >
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-700">{id}</span>
      {copied ? (
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </div>
  )
}

// Карточка результата коллизии с изображением
function ClashResultCard({ clash }) {
  const [showImage, setShowImage] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imageUrl = clashesAPI.getResultImage(clash.id)
  
  // Конвертируем distance из футов в мм
  const distanceMm = feetToMm(clash.distance)

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            clash.status === 'New' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {clash.status === 'New' ? 'Новая' : 'Активная'}
          </span>
          <span className="font-medium">{clash.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {distanceMm !== null && (
            <span className="text-sm text-gray-500">{distanceMm.toFixed(1)} мм</span>
          )}
          <button
            onClick={() => setShowImage(!showImage)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title={showImage ? 'Скрыть изображение' : 'Показать изображение'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
      
      {clash.grid_location && (
        <div className="text-sm text-gray-500 mb-2">Расположение: {clash.grid_location}</div>
      )}

      {/* Изображение коллизии */}
      {showImage && (
        <div className="mb-3 bg-gray-100 rounded-lg overflow-hidden">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={`Коллизия ${clash.name}`}
              className="w-full h-auto max-h-96 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="text-sm">Изображение недоступно</div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-400 uppercase">Элемент 1</div>
            <CopyableId label="ID" id={clash.item1_id} />
          </div>
          <div className="text-sm font-medium">{clash.item1_name || '-'}</div>
          <div className="text-xs text-gray-500">{clash.item1_type}</div>
          <div className="text-xs text-gray-400 mt-1">{clash.item1_source_file}</div>
        </div>
        <div className="bg-gray-50 rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-400 uppercase">Элемент 2</div>
            <CopyableId label="ID" id={clash.item2_id} />
          </div>
          <div className="text-sm font-medium">{clash.item2_name || '-'}</div>
          <div className="text-xs text-gray-500">{clash.item2_type}</div>
          <div className="text-xs text-gray-400 mt-1">{clash.item2_source_file}</div>
        </div>
      </div>
    </div>
  )
}

// Мультиселект с поиском
function TestMultiSelect({ tests, selectedIds, onChange, sort, onSortChange }) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const filteredTests = useMemo(() => {
    if (!search.trim()) return tests
    const s = search.toLowerCase()
    return tests.filter(t => t.name.toLowerCase().includes(s))
  }, [tests, search])

  const toggleTest = (id) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  const selectAll = () => onChange(filteredTests.map(t => t.id))
  const clearAll = () => onChange([])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border rounded-lg text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="text-sm">
          {selectedIds.length === 0 
            ? 'Все проверки (общая сумма)' 
            : `Выбрано: ${selectedIds.length} из ${tests.length}`}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-96 overflow-hidden">
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Поиск проверок..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-2 border-b bg-gray-50 flex gap-2">
            <select 
              value={sort.by} 
              onChange={(e) => onSortChange({ ...sort, by: e.target.value })}
              className="flex-1 px-2 py-1 border rounded text-xs"
            >
              <option value="name">По имени</option>
              <option value="total">По всего</option>
              <option value="active">По активным</option>
              <option value="new">По новым</option>
            </select>
            <button 
              onClick={() => onSortChange({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' })}
              className="px-2 py-1 border rounded text-xs hover:bg-gray-100"
            >
              {sort.order === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="p-2 border-b flex gap-2">
            <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Выбрать все</button>
            <button onClick={clearAll} className="text-xs text-gray-500 hover:underline">Сбросить</button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredTests.map(test => {
              const isSelected = selectedIds.includes(test.id)
              const activeCount = test.summary_new + test.summary_active
              return (
                <label
                  key={test.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTest(test.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{test.name}</div>
                    <div className="text-xs text-gray-400 truncate">{test.filename}</div>
                  </div>
                  <div className="flex gap-2 text-xs flex-shrink-0">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded">{test.summary_total}</span>
                    {activeCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded">{activeCount}</span>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {filteredTests.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">Ничего не найдено</div>
          )}
        </div>
      )}
    </div>
  )
}

// Цвета для линий графика
const LINE_COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
  '#14b8a6', '#a855f7', '#eab308', '#0ea5e9', '#d946ef'
]

export default function ClashesReportSection({ directoryId }) {
  const [data, setData] = useState(null)
  const [tests, setTests] = useState([])
  const [history, setHistory] = useState([])
  const [testLines, setTestLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTestIds, setSelectedTestIds] = useState([])
  const [sort, setSort] = useState({ by: 'name', order: 'asc' })
  const [days, setDays] = useState(30)
  const [chartMetric, setChartMetric] = useState('active')
  
  const [testsSearch, setTestsSearch] = useState('')
  const [testsSort, setTestsSort] = useState({ by: 'active', order: 'desc' })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileTests, setFileTests] = useState(null)
  const [selectedTest, setSelectedTest] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [resultsPage, setResultsPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [minDistance, setMinDistance] = useState(0)
  const [distanceStats, setDistanceStats] = useState(null)
  const { isAdmin, getAuthHeaders } = useAuth()

  useEffect(() => {
    loadData()
    loadTests()
  }, [directoryId])

  useEffect(() => {
    loadHistory()
  }, [directoryId, selectedTestIds, days])

  useEffect(() => {
    loadTests()
  }, [directoryId, sort])

  const loadData = async () => {
    try {
      const res = await clashesAPI.getDirectoryReport(directoryId)
      setData(res)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadTests = async () => {
    try {
      const res = await clashesAPI.getTestsList(directoryId, { sort: sort.by, order: sort.order })
      setTests(res)
    } catch (err) {
      console.error('Error loading tests:', err)
    }
  }

  const loadHistory = async () => {
    try {
      const params = { days }
      if (selectedTestIds.length > 0) {
        params.test_ids = selectedTestIds.join(',')
      }
      const res = await clashesAPI.getHistory(directoryId, params)
      setHistory(res.history || [])
      setTestLines(res.testLines || [])
    } catch (err) {
      console.error('Error loading history:', err)
    }
  }

  const loadFileTests = async (fileId) => {
    try {
      const res = await clashesAPI.getFileTests(fileId)
      setFileTests(res)
      setSelectedFile(fileId)
      setSelectedTest(null)
      setTestResults(null)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const loadTestResults = async (testId, page = 1, status = '', minDist = 0) => {
    try {
      const res = await clashesAPI.getTestResults(testId, { 
        page, 
        limit: 20, 
        status: status || undefined,
        min_distance: minDist || undefined
      })
      setTestResults(res)
      setDistanceStats(res.distanceStats)
      setSelectedTest(testId)
      setResultsPage(page)
      setStatusFilter(status)
      setMinDistance(minDist)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDeleteFile = async (fileId, e) => {
    e.stopPropagation()
    if (!confirm('Удалить файл Navisworks? Все тесты и результаты коллизий будут удалены.')) return
    try {
      await clashesAPI.deleteFile(fileId, getAuthHeaders())
      loadData()
      loadTests()
      if (selectedFile === fileId) {
        setSelectedFile(null)
        setFileTests(null)
        setSelectedTest(null)
        setTestResults(null)
      }
    } catch (err) {
      alert('Ошибка удаления: ' + err.message)
    }
  }

  const goBack = () => {
    if (testResults) {
      setTestResults(null)
      setSelectedTest(null)
      setMinDistance(0)
      setDistanceStats(null)
    } else if (fileTests) {
      setFileTests(null)
      setSelectedFile(null)
    }
  }

  // Подготовка данных для графика
  const chartData = useMemo(() => {
    // Если выбраны конкретные проверки - показываем их отдельными линиями
    if (selectedTestIds.length > 0 && testLines.length > 0) {
      // Собираем все даты
      const allDates = new Set()
      testLines.forEach(test => {
        test.data.forEach(d => allDates.add(d.date))
      })
      
      // Сортируем даты
      const sortedDates = Array.from(allDates).sort()
      
      // Строим данные с колонкой для каждой проверки
      return sortedDates.map(date => {
        const entry = {
          date,
          dateLabel: new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
        }
        testLines.forEach((test, idx) => {
          const testData = test.data.find(d => d.date === date)
          const key = `test_${test.test_id}`
          if (testData) {
            entry[key] = chartMetric === 'active' ? testData.activeSum 
              : chartMetric === 'total' ? testData.total
              : chartMetric === 'new' ? testData.new
              : testData.resolved
          }
        })
        return entry
      })
    }
    
    // Иначе показываем общую сумму
    return history.map(h => ({
      date: h.date,
      dateLabel: new Date(h.date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      total: h.total,
      active: h.new + h.active,
      new: h.new,
      reviewed: h.reviewed,
      resolved: h.resolved
    }))
  }, [history, testLines, selectedTestIds, chartMetric])

  // Фильтрованный список тестов
  const filteredTests = useMemo(() => {
    let result = [...tests]
    
    if (testsSearch.trim()) {
      const s = testsSearch.toLowerCase()
      result = result.filter(t => 
        t.name.toLowerCase().includes(s) || 
        t.filename.toLowerCase().includes(s)
      )
    }
    
    result.sort((a, b) => {
      let compareA, compareB
      switch (testsSort.by) {
        case 'name':
          compareA = a.name.toLowerCase()
          compareB = b.name.toLowerCase()
          break
        case 'total':
          compareA = a.summary_total
          compareB = b.summary_total
          break
        case 'active':
          compareA = a.summary_new + a.summary_active
          compareB = b.summary_new + b.summary_active
          break
        case 'new':
          compareA = a.summary_new
          compareB = b.summary_new
          break
        case 'resolved':
          compareA = a.summary_resolved
          compareB = b.summary_resolved
          break
        default:
          return 0
      }
      if (compareA < compareB) return testsSort.order === 'asc' ? -1 : 1
      if (compareA > compareB) return testsSort.order === 'asc' ? 1 : -1
      return 0
    })
    
    return result
  }, [tests, testsSearch, testsSort])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data?.has_data) {
    return <div className="text-center py-8 text-gray-500">Данные о коллизиях отсутствуют</div>
  }

  // Детали теста с результатами
  if (testResults) {
    const test = testResults.test
    const toleranceMm = feetToMm(test.tolerance)
    const lastUpdate = test.updated_at ? new Date(test.updated_at).toLocaleString('ru-RU') : '-'
    
    return (
      <div>
        <button onClick={goBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>

        <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
          <h3 className="font-semibold text-lg mb-2">{test.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm mb-3">
            <div><span className="text-gray-500">Тип:</span> {test.test_type || '-'}</div>
            <div><span className="text-gray-500">Допуск:</span> {toleranceMm ? `${toleranceMm.toFixed(1)} мм` : '-'}</div>
            <div><span className="text-gray-500">Всего:</span> <span className="font-medium">{test.summary_total}</span></div>
            <div><span className="text-gray-500">Новых:</span> <span className="text-red-600 font-medium">{test.summary_new}</span></div>
            <div><span className="text-gray-500">Активных:</span> <span className="text-yellow-600 font-medium">{test.summary_active}</span></div>
            <div><span className="text-gray-500">Решено:</span> <span className="text-green-600 font-medium">{test.summary_resolved}</span></div>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span>Последняя выгрузка: {lastUpdate}</span>
            {distanceStats && (
              <>
                <span>•</span>
                <span>Глубина: {distanceStats.min_distance_mm?.toFixed(1) || 0} – {distanceStats.max_distance_mm?.toFixed(1) || 0} мм</span>
                <span>•</span>
                <span>Средняя: {distanceStats.avg_distance_mm?.toFixed(1) || 0} мм</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <h4 className="font-medium">Результаты ({testResults.pagination.total})</h4>
          <div className="flex flex-wrap items-center gap-4">
            {/* Слайдер глубины */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">Глубина ≥</span>
              <input
                type="range"
                min="0"
                max="500"
                step="20"
                value={minDistance}
                onChange={(e) => {
                  const val = parseFloat(e.target.value)
                  loadTestResults(selectedTest, 1, statusFilter, val)
                }}
                className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium w-20">{minDistance.toFixed(0)} мм</span>
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => loadTestResults(selectedTest, 1, e.target.value, minDistance)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="">Все статусы</option>
              <option value="New">Новые</option>
              <option value="Active">Активные</option>
            </select>
          </div>
        </div>

        {/* Информация о фильтре */}
        {(minDistance > 0 || statusFilter) && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-500">Фильтры:</span>
            {minDistance > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                глубина ≥ {minDistance.toFixed(0)} мм
              </span>
            )}
            {statusFilter && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded">
                {statusFilter === 'New' ? 'Новые' : 'Активные'}
              </span>
            )}
            <button
              onClick={() => loadTestResults(selectedTest, 1, '', 0)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="space-y-2">
          {testResults.results.map(clash => (
            <ClashResultCard key={clash.id} clash={clash} />
          ))}
        </div>

        {testResults.results.length === 0 && (
          <div className="text-center py-8 text-gray-500">Нет результатов</div>
        )}

        {testResults.pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-lg shadow-sm border p-4">
            <div className="text-sm text-gray-500">
              Страница {testResults.pagination.page} из {testResults.pagination.pages}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => loadTestResults(selectedTest, resultsPage - 1, statusFilter, minDistance)} 
                disabled={resultsPage === 1} 
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Назад
              </button>
              <button 
                onClick={() => loadTestResults(selectedTest, resultsPage + 1, statusFilter, minDistance)} 
                disabled={resultsPage === testResults.pagination.pages} 
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Тесты файла
  if (fileTests) {
    return (
      <div>
        <button onClick={goBack} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Назад
        </button>

        <div className="bg-white rounded-lg p-4 shadow-sm border mb-4">
          <h3 className="font-semibold">{fileTests.file.filename}</h3>
          <div className="text-sm text-gray-500">Тестов: {fileTests.tests.length}</div>
        </div>

        <div className="space-y-2">
          {fileTests.tests.map(test => {
            const toleranceMm = feetToMm(test.tolerance)
            return (
              <div 
                key={test.id} 
                onClick={() => loadTestResults(test.id)}
                className="bg-white rounded-lg p-4 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{test.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    (test.summary_new + test.summary_active) > 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {test.summary_new + test.summary_active > 0 
                      ? `${test.summary_new + test.summary_active} активных` 
                      : 'Нет активных'}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-900">{test.summary_total}</div>
                    <div className="text-xs text-gray-500">Всего</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-lg font-bold text-red-600">{test.summary_new}</div>
                    <div className="text-xs text-gray-500">Новых</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{test.summary_active}</div>
                    <div className="text-xs text-gray-500">Активных</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{test.summary_reviewed}</div>
                    <div className="text-xs text-gray-500">На проверке</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{test.summary_approved}</div>
                    <div className="text-xs text-gray-500">Одобрено</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{test.summary_resolved}</div>
                    <div className="text-xs text-gray-500">Решено</div>
                  </div>
                </div>

                {test.test_type && (
                  <div className="mt-2 text-xs text-gray-400">
                    Тип: {test.test_type} {toleranceMm && `• Допуск: ${toleranceMm.toFixed(1)} мм`}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {fileTests.tests.length === 0 && (
          <div className="text-center py-8 text-gray-500">Тесты коллизий не найдены</div>
        )}
      </div>
    )
  }

  // Общий обзор с графиком
  return (
    <div>
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{data.files_count}</div>
          <div className="text-sm text-gray-500">NWF файлов</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{data.tests_count}</div>
          <div className="text-sm text-gray-500">Тестов</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{data.total_clashes}</div>
          <div className="text-sm text-gray-500">Всего коллизий</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{data.new_clashes + data.active_clashes}</div>
          <div className="text-sm text-gray-500">Активных</div>
        </div>
      </div>

      {/* График динамики */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Динамика коллизий</h3>
            <div className="flex gap-2 flex-wrap">
              <select 
                value={days} 
                onChange={(e) => setDays(Number(e.target.value))}
                className="px-3 py-1.5 border rounded text-sm"
              >
                <option value={7}>7 дней</option>
                <option value={14}>14 дней</option>
                <option value={30}>30 дней</option>
                <option value={60}>60 дней</option>
                <option value={90}>90 дней</option>
              </select>
              <select 
                value={chartMetric} 
                onChange={(e) => setChartMetric(e.target.value)}
                className="px-3 py-1.5 border rounded text-sm"
              >
                <option value="active">Активные (New + Active)</option>
                <option value="total">Всего</option>
                <option value="new">Только новые</option>
                <option value="resolved">Решённые</option>
              </select>
            </div>
          </div>
          <div className="lg:w-80">
            <div className="text-sm text-gray-500 mb-1">Фильтр проверок ({tests.length})</div>
            <TestMultiSelect
              tests={tests}
              selectedIds={selectedTestIds}
              onChange={setSelectedTestIds}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="dateLabel" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelFormatter={(label) => `Дата: ${label}`}
              />
              <Legend />
              
              {/* Если выбраны конкретные проверки - показываем их линии */}
              {selectedTestIds.length > 0 ? (
                testLines.map((test, idx) => (
                  <Line
                    key={test.test_id}
                    type="monotone"
                    dataKey={`test_${test.test_id}`}
                    name={test.test_name.length > 30 ? test.test_name.substring(0, 30) + '...' : test.test_name}
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: LINE_COLORS[idx % LINE_COLORS.length], strokeWidth: 2, r: 3 }}
                    connectNulls
                  />
                ))
              ) : (
                /* Иначе показываем общую линию */
                <>
                  {chartMetric === 'active' && (
                    <Line 
                      type="monotone" 
                      dataKey="active" 
                      name="Активных" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    />
                  )}
                  {chartMetric === 'total' && (
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Всего" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  )}
                  {chartMetric === 'new' && (
                    <Line 
                      type="monotone" 
                      dataKey="new" 
                      name="Новых" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                    />
                  )}
                  {chartMetric === 'resolved' && (
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      name="Решённых" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    />
                  )}
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            Нет данных для отображения
          </div>
        )}
      </div>

      {/* Статусы */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-red-600">{data.new_clashes}</div>
          <div className="text-xs text-gray-500">Новых</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-yellow-600">{data.active_clashes}</div>
          <div className="text-xs text-gray-500">Активных</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-600">{data.reviewed_clashes + data.approved_clashes}</div>
          <div className="text-xs text-gray-500">На проверке</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-600">{data.resolved_clashes}</div>
          <div className="text-xs text-gray-500">Решено</div>
        </div>
      </div>

      {/* Список всех тестов */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Все проверки ({tests.length})</h3>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Поиск по названию..."
                  value={testsSearch}
                  onChange={(e) => setTestsSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <select 
                value={testsSort.by} 
                onChange={(e) => setTestsSort({ ...testsSort, by: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="name">По имени</option>
                <option value="total">По всего</option>
                <option value="active">По активным</option>
                <option value="new">По новым</option>
                <option value="resolved">По решённым</option>
              </select>
              <button 
                onClick={() => setTestsSort({ ...testsSort, order: testsSort.order === 'asc' ? 'desc' : 'asc' })}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                {testsSort.order === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          {testsSearch && (
            <div className="mt-2 text-sm text-gray-500">
              Найдено: {filteredTests.length} из {tests.length}
            </div>
          )}
        </div>

        <div className="divide-y max-h-96 overflow-y-auto">
          {filteredTests.map(test => {
            const activeCount = test.summary_new + test.summary_active
            return (
              <div 
                key={test.id}
                onClick={() => loadTestResults(test.id)}
                className="p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{test.name}</div>
                    <div className="text-xs text-gray-400 truncate">{test.filename}</div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-gray-900">{test.summary_total}</div>
                      <div className="text-xs text-gray-400">всего</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm font-bold ${activeCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {activeCount}
                      </div>
                      <div className="text-xs text-gray-400">активн.</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{test.summary_resolved}</div>
                      <div className="text-xs text-gray-400">решено</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredTests.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {testsSearch ? 'Ничего не найдено' : 'Проверки не найдены'}
          </div>
        )}
      </div>
    </div>
  )
}