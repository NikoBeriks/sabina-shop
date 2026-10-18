'use client'

interface CategoryFilterProps {
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
        {categories.map((cat, index) => {
          const isSelected = selected === cat
          const indexNum = index === 0 ? 'ALL' : String(index).padStart(2, '0')

          return (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={`flex-shrink-0 snap-start flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 rounded-none border ${
                isSelected
                  ? 'bg-neutral-950 text-white border-neutral-950'
                  : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <span
                className={`font-mono text-[10px] tracking-widest ${
                  isSelected ? 'text-emerald-400 font-bold' : 'text-neutral-400'
                }`}
              >
                {indexNum}
              </span>
              <span>{cat}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

