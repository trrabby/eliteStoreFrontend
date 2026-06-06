// components/product/create/CategorySelector.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { Category, useCategories } from "@/lib/hooks/useCategories";

interface CategorySelectorProps {
  selectedCategories: Category[];
  onAddCategory: (category: Category) => void;
  onRemoveCategory: (categoryId: number, categoryName: string) => void;
  error?: string;
}

export const CategorySelector = ({
  selectedCategories,
  onAddCategory,
  onRemoveCategory,
  error,
}: CategorySelectorProps) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { loading, filterCategories } = useCategories();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = filterCategories(search);

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Categories <span className="text-red-500">*</span>
      </label>

      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full"
            >
              {cat.name}
              <button
                type="button"
                onClick={() => onRemoveCategory(cat.id, cat.name)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search categories..."
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No categories found
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onAddCategory(cat);
                    setSearch("");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                  style={{ paddingLeft: `${12 + cat.level * 16}px` }}
                >
                  {selectedCategories.find((c) => c.id === cat.id) && (
                    <Check size={14} className="text-primary" />
                  )}
                  <span className="text-sm">{cat.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};
