import React from 'react';
import { Filter, Tag, DollarSign } from 'lucide-react';

interface MerchFiltersProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

const categories = [
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'vinyl', name: 'Vinyl' },
  { id: 'cd', name: 'CDs' },
  { id: 'patches', name: 'Patches' },
  { id: 'posters', name: 'Posters' },
  { id: 'digital', name: 'Digital Downloads' }
];

export function MerchFilters({
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange
}: MerchFiltersProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold mb-2 flex items-center">
          <Tag className="w-5 h-5 mr-2 text-red-400" />
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
              selectedCategory === null
                ? 'bg-red-600 text-white'
                : 'hover:bg-zinc-700/50'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full text-left px-2 py-1.5 rounded text-sm transition ${
                selectedCategory === category.id
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-zinc-700/50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold mb-2 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-red-400" />
          Price Range
        </h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
              className="w-20 bg-zinc-700 border border-red-900/20 rounded px-2 py-1 text-sm"
            />
            <span>to</span>
            <input
              type="number"
              min={priceRange[0]}
              value={priceRange[1]}
              onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
              className="w-20 bg-zinc-700 border border-red-900/20 rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}