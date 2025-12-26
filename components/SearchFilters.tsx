import React from 'react';
import { Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterGenerator: boolean;
  setFilterGenerator: (active: boolean) => void;
}

const SearchFilters = ({ 
  searchQuery, 
  setSearchQuery, 
  filterGenerator, 
  setFilterGenerator 
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
      
      {/* Search Input - Clean style */}
      <div className="relative w-full md:w-96 group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-brand-dark/40 group-focus-within:text-brand-orange transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search cafes..."
          className="block w-full pl-11 pr-4 py-3 bg-white border border-transparent rounded-xl text-brand-dark placeholder-brand-dark/30 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/50 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Toggles */}
      <div className="flex items-center gap-2 w-full md:w-auto">
        <button
          onClick={() => setFilterGenerator(!filterGenerator)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 border shadow-sm",
            filterGenerator
              ? "bg-brand-dark text-white border-brand-dark" 
              : "bg-white text-brand-dark/70 border-transparent hover:bg-white/80"
          )}
        >
          <Zap size={16} className={filterGenerator ? "fill-brand-orange text-brand-orange" : ""} />
          {filterGenerator ? "Generator Only" : "Has Generator?"}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters;