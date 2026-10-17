'use client'

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selected === cat
              ? 'bg-pink-600 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
