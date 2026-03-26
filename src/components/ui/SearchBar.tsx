'use client';

import { useState, useRef, useEffect } from 'react';
import { useCityStore } from '@/store/cityStore';

export default function SearchBar() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchUser = useCityStore((s) => s.searchUser);
  const isLoading = useCityStore((s) => s.isLoading);
  const error = useCityStore((s) => s.error);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      searchUser(input.trim());
      setInput('');
    }
  };

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className={`search-input-wrapper ${isFocused ? 'focused' : ''}`}>
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Search GitHub username... (press "/")'
            className="search-input"
            disabled={isLoading}
            id="search-input"
          />
          {isLoading && <div className="search-spinner" />}
          {!isLoading && input && (
            <kbd className="search-kbd">↵</kbd>
          )}
        </div>
      </form>
      {error && (
        <div className="search-error">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
}
