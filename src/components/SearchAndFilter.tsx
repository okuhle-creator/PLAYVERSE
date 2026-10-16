import React from 'react';
import { Search, X } from 'lucide-react';
import { GameCategory } from '../app/types';
import { CATEGORIES } from '../services/gamesRegistry';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: GameCategory;
  onCategoryChange: (cat: GameCategory) => void;
  resultsCount: number;
}

export const SearchAndFilter: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  resultsCount,
}) => {
  return (
    <div id="catalog-section" className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" role="tablist" aria-label="Game categories">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              role="tab"
              aria-selected={isSelected}
              className={`px-3.5 py-1.5 rounded-[var(--radius-xs)] text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[var(--color-accent)] text-white shadow-sm'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Search Input Field */}
      <div className="relative min-w-[240px] md:w-72">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
          <Search size={15} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search games or genre..."
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] focus:border-[var(--color-accent)] text-xs font-mono rounded-[var(--radius-sm)] pl-9 pr-8 py-2 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-colors"
          aria-label="Search games"
        />
        {searchQuery ? (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            aria-label="Clear search query"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[10px] font-mono text-[var(--text-muted)] pointer-events-none">
            {resultsCount}
          </span>
        )}
      </div>
    </div>
  );
};
