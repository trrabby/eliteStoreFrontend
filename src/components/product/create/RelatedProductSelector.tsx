/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
// components/product/create/RelatedProductSelector.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X, Package, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { getAllProducts } from "@/services/product.service";

interface Product {
  id: number;
  name: string;
  price: number;
  thumbnail?: string;
  vendor?: {
    name: string;
  };
  category?: {
    name: string;
  };
  variants?: Array<{
    sku: string;
    name: string;
  }>;
}

interface RelatedProductSelectorProps {
  productId: number | null;
  selectedIds: number[];
  onAddProduct: (id: number) => void;
  onRemoveProduct: (id: number, name: string) => void;
  error?: string;
}

export function RelatedProductSelector({
  productId,
  selectedIds,
  onAddProduct,
  onRemoveProduct,
  error,
}: RelatedProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "category" | "variant">(
    "name",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch random products on mount
  useEffect(() => {
    fetchRandomProducts();
  }, []);

  // Search products when search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      searchProducts();
    } else {
      // Reset to random products when search is cleared
      fetchRandomProducts();
    }
  }, [searchTerm, searchType, currentPage]);

  const fetchRandomProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts({
        limit: itemsPerPage,
        page: currentPage,
        status: "ACTIVE",
        sortBy: "random",
      });

      if (response && response.success && response.data) {
        // Handle different response structures
        let productsArray = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          productsArray = response.data;
          total = response.data.length;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          productsArray = response.data.products;
          total = response.data.total || response.data.products.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsArray = response.data.data;
          total = response.data.total || response.data.data.length;
        } else {
          productsArray = [];
          total = 0;
        }

        // Filter out current product
        const filtered = productsArray.filter(
          (product: Product) => product.id !== productId,
        );
        setProducts(filtered);
        setFilteredProducts(filtered);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    try {
      let searchParams: any = {
        limit: itemsPerPage,
        page: currentPage,
        status: "ACTIVE",
      };

      // Build search query based on search type
      if (searchType === "name") {
        searchParams.search = searchTerm;
      } else if (searchType === "category") {
        searchParams.search = searchTerm;
      } else if (searchType === "variant") {
        searchParams.search = searchTerm;
      }

      const response = await getAllProducts(searchParams);

      if (response && response.success && response.data) {
        let productsArray = [];
        let total = 0;

        if (Array.isArray(response.data)) {
          productsArray = response.data;
          total = response.data.length;
        } else if (
          response.data.products &&
          Array.isArray(response.data.products)
        ) {
          productsArray = response.data.products;
          total = response.data.total || response.data.products.length;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          productsArray = response.data.data;
          total = response.data.total || response.data.data.length;
        } else {
          productsArray = [];
          total = 0;
        }

        const filtered = productsArray.filter(
          (product: Product) => product.id !== productId,
        );
        setFilteredProducts(filtered);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Failed to search products:", error);
      toast.error("Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setCurrentPage(1);
      searchProducts();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchRandomProducts();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Safe price formatter
  const formatPrice = (price: any): string => {
    if (typeof price === "number") {
      return `৳${price.toFixed(2)}`;
    }
    if (typeof price === "string") {
      const numPrice = parseFloat(price);
      if (!isNaN(numPrice)) {
        return `৳${numPrice.toFixed(2)}`;
      }
    }
    return "৳0.00";
  };

  return (
    <div className="space-y-6">
      {/* Search Section - Using div instead of form to avoid nesting */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Search Products</h3>

        <div className="space-y-4">
          {/* Search type selector */}
          <div className="flex gap-2">
            {(["name", "category", "variant"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSearchType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize
                  ${
                    searchType === type
                      ? "bg-primary text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search input - Changed from form to div to avoid nesting */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch(e);
                  }
                }}
                placeholder={`Search by ${searchType}...`}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 
                         focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium
                       hover:bg-primary-dark transition-colors"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Selected Products Section */}
      {selectedIds.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Selected Related Products ({selectedIds.length})
          </h3>
          <div className="space-y-2">
            {selectedIds.map((id) => {
              // Combine both product lists to find the selected product
              const allProducts = [...products, ...filteredProducts];
              const product = allProducts.find((p) => p.id === id);
              if (!product) return null;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                      {product.thumbnail ? (
                        <Image
                          src={product.thumbnail}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(product.price)}
                        {product.vendor && ` • ${product.vendor.name}`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveProduct(product.id, product.name)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Products Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {searchTerm ? "Search Results" : "Suggested Products"}
        </h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No products found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all
                      ${
                        isSelected
                          ? "bg-primary-pale border-primary"
                          : "bg-white border-gray-200 hover:border-primary"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {product.thumbnail ? (
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{formatPrice(product.price)}</span>
                          {product.vendor && (
                            <>
                              <span>•</span>
                              <span className="truncate">
                                {product.vendor.name}
                              </span>
                            </>
                          )}
                        </div>
                        {product.category && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Category: {product.category.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddProduct(product.id)}
                      disabled={isSelected}
                      className={`ml-3 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors
                        ${
                          isSelected
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-primary text-white hover:bg-primary-dark"
                        }
                      `}
                    >
                      {isSelected ? "Added" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} className="inline mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium
                           disabled:opacity-50 disabled:cursor-not-allowed
                           hover:bg-gray-50 transition-colors"
                >
                  Next
                  <ChevronRight size={16} className="inline ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Message */}
      {error && <div className="text-sm text-red-500 text-center">{error}</div>}
    </div>
  );
}
