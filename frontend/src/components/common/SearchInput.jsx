import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder = 'Search...' }) => {
  const [localValue, setLocalValue] = useState(value);
  const isFirstRender = useRef(true);

  // Sync internal value with external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the change callback
  useEffect(() => {
    // Avoid running on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [localValue]); // Removed onChange to avoid double fires if parent recreates it inline

  return (
    <div className="relative rounded-lg shadow-sm w-full max-w-xs">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Search className="h-4.5 w-4.5" />
      </div>
      <input
        type="text"
        value={localValue || ''}
        onChange={(e) => setLocalValue(e.target.value)}
        className="border border-slate-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white text-slate-850 placeholder-slate-400"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchInput;
