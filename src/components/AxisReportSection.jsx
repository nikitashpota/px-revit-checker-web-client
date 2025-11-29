import { useState, useEffect } from 'react'
import { modelsAPI } from '../services/api'

export default function AxisReportSection({ modelId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  useEffect(() => {
    loadData()
  }, [modelId])

  const loadData = async () => {
    try {
      const res = await modelsAPI.getAxisReport(modelId)
      setData(res)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    if (!data?.errors?.length) return
    const BOM = '\uFEFF'
    const headers = ['ElementId', 'Имя оси', 'Типы ошибок', 'Смещение (мм)', 'Закреплена', 'Рабочий набор']
    const rows = data.errors.map(e => [
      e.element_id,
      e.axis_name,
      e.error_types || '',
      e.deviation_mm || '',
      e.is_pinned ? 'Да' : 'Нет',
      e.workset_name || ''
    ])
    const csv = BOM + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `axis-errors-${modelId}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data?.has_data) {
    return <div className="text-center py-8 text-gray-500">Данные проверки отсутствуют</div>
  }

  const errors = data.errors || []
  const totalPages = Math.ceil(errors.length / perPage)
  const paginatedErrors = perPage === 'all' ? errors : errors.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-gray-900">{data.total_axes_in_model}</div>
          <div className="text-sm text-gray-500">Всего осей</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{data.success_count}</div>
          <div className="text-sm text-gray-500">Без ошибок</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{data.error_count}</div>
          <div className="text-sm text-gray-500">С ошибками</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{data.total_reference_axes}</div>
          <div className="text-sm text-gray-500">Эталонных</div>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-4">Проверка: {new Date(data.check_date).toLocaleString('ru-RU')}</div>
      {errors.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Ошибки ({errors.length})</h3>
            <div className="flex items-center gap-4">
              <select value={perPage} onChange={(e) => { setPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value)); setPage(1) }} className="text-sm border rounded px-2 py-1">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">Все</option>
              </select>
              <button onClick={exportCSV} className="text-sm text-blue-600 hover:text-blue-800">Экспорт CSV</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">ElementId</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Имя оси</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Типы ошибок</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Смещение</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Закреплена</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Рабочий набор</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedErrors.map((e, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{e.element_id}</td>
                    <td className="px-4 py-3">{e.axis_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(e.error_types_array || []).map((t, j) => (
                          <span key={j} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">{e.deviation_mm ? `${e.deviation_mm.toFixed(1)} мм` : '-'}</td>
                    <td className="px-4 py-3">{e.is_pinned ? <span className="text-green-600">Да</span> : <span className="text-red-600">Нет</span>}</td>
                    <td className="px-4 py-3 text-gray-500">{e.workset_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {perPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-gray-500">Страница {page} из {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Назад</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded text-sm disabled:opacity-50">Вперед</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-green-700 font-medium">Все оси соответствуют эталону</div>
        </div>
      )}
    </div>
  )
}