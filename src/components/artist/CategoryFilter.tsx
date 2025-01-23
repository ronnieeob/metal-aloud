import React from 'react';
import { Tag } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { id: 'clothing', label: 'Clothing' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'vinyl', label: 'Vinyl' },
  { id: 'cd', label: 'CDs' },
  { id: 'other', label: 'Other' }
];

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <Tag className="w-4 h-4 text-red-400" />
      <div className="flex space-x-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3 py-1 rounded-full text-sm transition ${
            selectedCategory === null
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
          }`}
        >
          All
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedCategory === category.id
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
}