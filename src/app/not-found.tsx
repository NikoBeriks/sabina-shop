import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-8xl mb-4">🛍️</p>
        <h1 className="text-4xl font-black text-gray-800 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Страница не найдена</p>
        <Link
          href="/"
          className="bg-pink-600 text-white px-8 py-3 rounded-full font-medium hover:bg-pink-700 transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  )
}
