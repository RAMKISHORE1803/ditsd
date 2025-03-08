// components/map/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Radio, School, Building2, X } from 'lucide-react';
import { searchLocations } from '@/lib/api';

// Type for search result
interface SearchResultData {
  id: string;
  name: string;
  description: string;
  type: 'district' | 'tower' | 'school' | 'hospital' | string;
  coordinates?: [number, number]; // [latitude, longitude]
}

// Type for search result component props
interface SearchResultProps {
  result: SearchResultData;
  onSelect: (coordinates: [number, number]) => void;
  onClose: () => void;
}

const SearchResult = ({ result, onSelect, onClose }: SearchResultProps) => {
  // Get icon based on result type
  const getIcon = () => {
    switch (result.type) {
      case 'district':
        return <MapPin size={16} className="text-indigo-400" />;
      case 'tower':
        return <Radio size={16} className="text-yellow-400" />;
      case 'school':
        return <School size={16} className="text-blue-400" />;
      case 'hospital':
        return <Building2 size={16} className="text-red-400" />;
      default:
        return <MapPin size={16} className="text-gray-400" />;
    }
  };
  
  return (
    <button
      onClick={() => {
        if (result.coordinates) {
          onSelect(result.coordinates);
          onClose();
        }
      }}
      className="flex items-center gap-3 px-3 py-2 w-full hover:bg-white/5 rounded-md transition-colors text-left"
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm text-white font-medium truncate">{result.name}</p>
        <p className="text-xs text-white/60 truncate">{result.description}</p>
      </div>
    </button>
  );
};

// Type for search bar component props
interface SearchBarProps {
  onSelect: (coordinates: [number, number]) => void;
}

const SearchBar = ({ onSelect }: SearchBarProps) => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultData[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  
  // Handle click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle search
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }
      
      setIsSearching(true);
      
      try {
        const searchResults = await searchLocations(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search
    
    return () => clearTimeout(searchTimer);
  }, [query]);
  
  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search size={18} className="text-white/50" />
            </motion.div>
          ) : (
            <Search size={18} className="text-white/50" />
          )}
        </div>
        
        <input
          type="text"
          placeholder="Search for locations, infrastructure..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            }
          }}
          className="bg-slate-700/50 border border-white/10 text-white placeholder-white/50 rounded-md py-2 pl-10 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        {query && (
          <button 
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
          >
            <X size={18} className="text-white/50 hover:text-white/80" />
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute mt-2 w-full bg-slate-800/95 backdrop-blur-md border border-white/10 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto custom-scrollbar"
          >
            {results.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-white/60">No results found</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result) => (
                  <SearchResult
                    key={`${result.type}-${result.id}`}
                    result={result}
                    onSelect={onSelect}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;