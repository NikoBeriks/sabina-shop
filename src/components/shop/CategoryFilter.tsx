'use client'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}

const CATEGORY_ICONS: Record<string, string> = {
  'Все': '🧺',
  'Фрукты и овощи': '🍏',
  'Молочные продукты': '🥛',
  'Мясо и рыба': '🥩',
  'Хлеб и выпечка': '🥖',
  'Напитки': '🧃',
  'Бакалея': '🍝',
  'Заморозка': '❄️',
  'Кондитерские': '🍫',
  'Готовая еда': '🍱',
  'Бытовая химия': '🧼',
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x snap-mandatory">
        {categories.map((cat) => {
          const isSelected = selected === cat
          const icon = CATEGORY_ICONS[cat] || '🏷️'

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex-shrink-0 snap-start flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-emerald shadow-md ring-2 ring-emerald-600/30 font-bold'
                  : 'bg-white text-neutral-700 hover:bg-neutral-50 hover:text-emerald-700 border border-neutral-200/80 shadow-xs'
              }`}
            >
              <span className="text-base leading-none select-none">{icon}</span>
              <span>{cat}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
