// components/product/create/BrandSelector.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { Brand, useBrands } from "@/lib/hooks/useBrands";
import Image from "next/image";

interface BrandSelectorProps {
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
  onClearBrand: () => void;
}

export const BrandSelector = ({
  selectedBrand,
  onSelectBrand,
  onClearBrand,
}: BrandSelectorProps) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { filterBrands, loading } = useBrands();
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

  const filteredBrands = filterBrands(search);

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Brand
      </label>

      {selectedBrand && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
            {selectedBrand.logo && (
              <Image
                src={selectedBrand.logo}
                alt=""
                className="w-3 h-3 object-contain"
                height={12}
                width={12}
              />
            )}
            {selectedBrand.name}
            <button
              type="button"
              onClick={onClearBrand}
              className="hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
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
            placeholder="Search brands..."
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
                Loading brands...
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No brands found
              </div>
            ) : (
              filteredBrands.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onSelectBrand(brand);
                    setSearch("");
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {selectedBrand?.id === brand.id && (
                    <Check size={14} className="text-primary" />
                  )}
                  {brand.logo && (
                    <Image
                      src={brand.logo}
                      alt=""
                      className="w-5 h-5 object-contain"
                      height={20}
                      width={20}
                    />
                  )}
                  <span className="text-sm">{brand.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
