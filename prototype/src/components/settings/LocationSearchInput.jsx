import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/api/integrations";

export default function LocationSearchInput({ value, onChange, placeholder }) {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await InvokeLLM({
        prompt: `Find 5 real locations that match "${query}". Include cities, states/provinces, and countries. Format as: City, State/Province, Country (if international). Return only location names, one per line.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            locations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const locationSuggestions = response.locations || [];
      setSuggestions(locationSuggestions.slice(0, 5));
      setShowSuggestions(locationSuggestions.length > 0);
    } catch (error) {
      console.error("Error searching locations:", error);
      // Fallback suggestions based on query
      const fallbackSuggestions = [
        `${query}, CA, USA`,
        `${query}, NY, USA`,
        `${query}, TX, USA`,
        `${query} City`,
        `${query} Beach`
      ].filter(suggestion => 
        suggestion.toLowerCase() !== query.toLowerCase()
      );
      setSuggestions(fallbackSuggestions.slice(0, 3));
      setShowSuggestions(fallbackSuggestions.length > 0);
    }
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
    onChange(newValue);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchLocations(newValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    onChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocations(searchQuery);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-900">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}