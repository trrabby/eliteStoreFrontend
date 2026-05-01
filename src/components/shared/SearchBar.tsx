"use client";

import { Search, X } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function SearchBar({ autoFocus = false }: { autoFocus?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full flex items-center bg-gray-100 rounded-xl
                 focus-within:ring-2 focus-within:ring-primary/30
                 focus-within:bg-white transition-all duration-200"
    >
      <Search size={18} className="ml-4 text-gray-400 flex-shrink-0" />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products, brands, categories..."
        className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-900
                   placeholder:text-gray-400 outline-none"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="m-1.5 px-4 py-2 bg-gradient-primary text-white
                   text-sm font-medium rounded-lg hover:brightness-105
                   transition-all duration-200"
      >
        Search
      </button>
    </form>
  );
}
