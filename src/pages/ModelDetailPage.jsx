import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { modelsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import AxisReportSection from '../components/AxisReportSection'
import PlaceholderSection from '../components/PlaceholderSection'

const SECTIONS = [
  { id: 'axes', name: 'Оси', icon: 'M4 6h16M4 12h16M4 18h16' },
  { id: 'levels', name: 'Уровни', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'sites', name: 'Площадки', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'clashes', name: 'Коллизии', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
]

export default function ModelDetailPage() {
  const { id: dirId, modelId, section = 'axes' } = useParams()
  const navigate = useNavigate()
  const { isAdmin, getAuthHeaders } = useAuth()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModel()
  }, [modelId])

const loadModel = async () => {
  console.log('Loading model:', modelId)
  try {
    const data = await modelsAPI.getById(modelId)
    console.log('Model data:', data)
    setModel(data)
  } catch (err) {
    console.error('Error loading model:', err)
  } finally {
    setLoading(false)
  }
}

const handleDelete = async () => {
  if (!confirm('Удалить модель? Все результаты проверок будут удалены.')) return
  try {
    await modelsAPI.delete(modelId, getAuthHeaders())
    navigate(`/directory/${model.directory_id || dirId}`)
  } catch (err) {
    alert('Ошибка удаления: ' + err.message)
  }
}

const changeSection = (newSection) => {
  navigate(`/directory/${model.directory_id || dirId}/model/${modelId}/${newSection}`)
}

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Ссылка скопирована!')
  }



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!model) {
    return <div className="text-center py-12 text-gray-500">Модель не найдена</div>
  }

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/" className="hover:text-blue-600">Все директории</Link>
        <span>/</span>
        <Link to={`/directory/${model.directory_id || dirId}`} className="hover:text-blue-600">
  {model.directory_name || model.directory_code}
</Link><span>/</span>
        <span className="text-gray-900">{model.model_name}</span>
      </nav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{model.model_name}</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={handleDelete} className="px-3 py-2 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Удалить
            </button>
          )}
        </div>
      </div>
      <div className="flex gap-2 mb-6 border-b">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => changeSection(s.id)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-2 ${section === s.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
            </svg>
            {s.name}
          </button>
        ))}
      </div>
      {section === 'axes' && <AxisReportSection modelId={modelId} />}
      {section === 'levels' && <PlaceholderSection title="Уровни" description="Мониторинг уровней модели" icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
      {section === 'sites' && <PlaceholderSection title="Площадки" description="Мониторинг площадок проекта" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />}
      {section === 'clashes' && <PlaceholderSection title="Коллизии" description="Отчет о коллизиях между элементами" icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
    </div>
  )
}
