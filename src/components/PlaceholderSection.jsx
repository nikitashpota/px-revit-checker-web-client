export default function PlaceholderSection({ title, description, icon }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Скоро будет доступно</span>
      <div className="mt-8 space-y-3">
        <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  )
}
