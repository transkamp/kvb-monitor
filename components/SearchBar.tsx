"use client";

import { useState, useRef, useEffect, useId, KeyboardEvent } from "react";
import { Stop } from "@/lib/types";
import { searchStops } from "@/lib/api";

interface SearchBarProps {
  onSelect: (stop: Stop) => void;
  placeholder?: string;
}

export default function SearchBar({ onSelect, placeholder = "Haltestelle suchen..." }: SearchBarProps) {
  const reactId = useId();
  const inputId = `stop-search-${reactId}`;
  const listboxId = `stop-search-listbox-${reactId}`;
  const optionId = (i: number) => `stop-search-option-${reactId}-${i}`;
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

  const expanded = showResults && results.length > 0;

  return (
    <div className="relative w-full">
      <label htmlFor={inputId} className="sr-only">
        Haltestelle suchen
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-activedescendant={
            expanded && selectedIndex >= 0 ? optionId(selectedIndex) : undefined
          }
          aria-busy={isSearching}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-primary placeholder:text-secondary focus:border-accent transition-colors"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden="true">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {expanded && (
        <div
          ref={resultsRef}
          id={listboxId}
          role="listbox"
          aria-label="Haltestellen-Vorschläge"
          className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {results.map((stop, index) => (
            <button
              key={stop.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
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