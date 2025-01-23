import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortOption = 'name' | 'price' | 'stock' | 'newest';

interface SortProductsProps {
  sortBy: SortOption;
  onSort: (option: SortOption) => void;
}

export function SortProducts({ sortBy, onSort }: SortProductsProps) {
  const options: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown className="w-4 h-4 text-red-400" />
      <select
        value={sortBy}
        onChange={(e) => onSort(e.target.value as SortOption)}
        className="bg-zinc-800 text-sm rounded-lg border border-red-900/20 px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            Sort by {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}