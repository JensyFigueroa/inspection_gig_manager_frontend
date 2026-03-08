import { useState, useEffect, useRef } from 'react';
import { authAxios } from '../App';

export default function DescriptionAutocomplete({
  value,
  onChange,
  station,
  placeholder = "Enter description..."
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value, station]);

  const fetchSuggestions = async (query) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ query });
      if (station) params.append('station', station);
      
      const response = await authAxios.get(`/suggestions/gig-descriptions?${params}`);
      setSuggestions(response.data);
      setShowSuggestions(response.data.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (suggestion) => {
    onChange(suggestion.description);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <textarea
        className="input-field min-h-[100px] resize-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-slate-500 text-sm">Loading...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                <p className="text-sm text-slate-800 line-clamp-2">{suggestion.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {suggestion.station && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {suggestion.station}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Used {suggestion.usageCount} times
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
