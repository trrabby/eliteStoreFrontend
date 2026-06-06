// components/product/create/RelatedProductSelector.tsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useRelatedProducts } from "@/lib/hooks/useRelatedProducts";
import { motion } from "framer-motion";
import Image from "next/image";

interface RelatedProductSelectorProps {
  productId: number | null;
  selectedIds: number[];
  onAddProduct: (productId: number) => void;
  onRemoveProduct: (productId: number, productName: string) => void;
  error?: string;
}

export const RelatedProductSelector = ({
  productId,
  selectedIds,
  onAddProduct,
  onRemoveProduct,
  error,
}: RelatedProductSelectorProps) => {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { products, loading, filterProducts } = useRelatedProducts(productId);
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

  const filteredProducts = filterProducts(search, selectedIds);
  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="card p-6 space-y-4"
    >
      <h3 className="font-semibold text-gray-900">Related Products</h3>
      <p className="text-xs text-gray-500">
        Suggest products that customers may also like.{" "}
        <span className="text-red-500">*</span>
      </p>

      {selectedProducts.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Products
          </label>
          <div className="space-y-2">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  {product.images?.[0]?.url && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-8 h-8 rounded-lg object-cover"
                      height={32}
                      width={32}
                    />
                  )}
                  <span className="text-sm text-gray-900">{product.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveProduct(product.id, product.name)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div ref={containerRef}>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Related Products
        </label>
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
              placeholder="Search products..."
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
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-3 text-center text-sm text-gray-500">
                  No products found
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      onAddProduct(product.id);
                      setSearch("");
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    {product.images?.[0]?.url && (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-8 h-8 rounded-lg object-cover"
                        height={32}
                        width={32}
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {product.variants?.[0]?.sku}
                      </p>
                    </div>
                    <Plus size={14} className="text-primary" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </motion.div>
  );
};
