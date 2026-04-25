"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Stop } from "@/lib/types";
import { searchStops } from "@/lib/api";

interface SearchBarProps {
  onSelect: (stop: Stop) => void;
  placeholder?: string;
}

export default function SearchBar({ onSelect, placeholder = "Haltestelle suchen..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Stop[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length >= 2) {
      setIsSearching(true);
      debounceRef.current = setTimeout(async () => {
        const stops = await searchStops(query);
        setResults(stops);
        setIsSearching(false);
        setShowResults(true);
        setSelectedIndex(-1);
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (stop: Stop) => {
    onSelect(stop);
    setQuery(stop.name);
    setShowResults(false);
    setResults([]);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowResults(false), 200);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary placeholder:text-secondary focus:border-accent transition-colors"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {results.map((stop, index) => (
            <button
              key={stop.id}
              onClick={() => handleSelect(stop)}
              className={`w-full px-4 py-3 text-left transition-colors touch-optimized ${
                index === selectedIndex ? "bg-accent text-[var(--background)]" : "hover:bg-background"
              }`}
            >
              <div className="font-medium">{stop.name}</div>
              {stop.shortName && (
                <div className={`text-sm ${index === selectedIndex ? "text-[var(--background)]/80" : "text-secondary"}`}>
                  {stop.shortName}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}