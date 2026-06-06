/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Save,
  Image as ImgIcon,
  Package,
  Layers,
  Plus,
  X,
  Minus,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getProductById,
  addProductImages,
  deleteProductImage,
  updateStock,
  getProductAttributes,
  getProductRelated,
  getAllProducts,
} from "@/services/product.service";
import { FormInput } from "@/components/shared/FormInput";
import { formatBDT } from "@/lib/utils/currency";
import { useProductCreation } from "@/lib/hooks/useProductCreation";
import { CategorySelector } from "@/components/product/create/CategorySelector";
import { BrandSelector } from "@/components/product/create/BrandSelector";
import { Category } from "@/lib/hooks/useCategories";
import { Brand } from "@/lib/hooks/useBrands";
import Image from "next/image";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    updateBasicInfo,
    saveProductAttributes,
    saveRelatedProducts,
    showSuccessDialog,
    showErrorDialog,
    showConfirmDialog,
    setSaving: setHookSaving,
    saving: hookSaving,
  } = useProductCreation();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSearch, setShowProductSearch] = useState(false);

  // Basic Info State
  const [basicInfoData, setBasicInfoData] = useState({
    name: "",
    shortDescription: "",
    description: "",
    tags: "",
    status: "DRAFT",
    isFeatured: false,
    metaTitle: "",
    metaDesc: "",
    metaKeywords: "",
  });

  // Selected categories and brand
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Attributes State
  const [attributes, setAttributes] = useState<any[]>([]);
  const [attributesLoading, setAttributesLoading] = useState(false);

  // Related Products State
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Track if data has been loaded
  const [basicInfoLoaded, setBasicInfoLoaded] = useState(false);
  const [attributesLoaded, setAttributesLoaded] = useState(false);
  const [relatedLoaded, setRelatedLoaded] = useState(false);

  // Track changes for save button
  const [hasBasicInfoChanges, setHasBasicInfoChanges] = useState(false);
  const [hasAttributesChanges, setHasAttributesChanges] = useState(false);
  const [hasRelatedChanges, setHasRelatedChanges] = useState(false);

  // Store original data for comparison
  const [originalBasicInfo, setOriginalBasicInfo] = useState<any>(null);
  const [originalAttributes, setOriginalAttributes] = useState<any[]>([]);
  const [originalRelatedIds, setOriginalRelatedIds] = useState<number[]>([]);

  // Stock update modal state
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [stockChange, setStockChange] = useState(0);
  const [stockReason, setStockReason] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);

  // Image preview modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const productImages = product?.images || [];

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await getProductById(Number(id));
        if (res?.success) {
          const p = res.data;
          console.log({ product: p });
          setProduct(p);

          // Set basic info
          const basicInfo = {
            name: p.name ?? "",
            shortDescription: p.shortDescription ?? "",
            description: p.description ?? "",
            tags: p.tags?.join(", ") ?? "",
            status: p.status ?? "DRAFT",
            isFeatured: p.isFeatured ?? false,
            metaTitle: p.metaTitle ?? "",
            metaDesc: p.metaDesc ?? "",
            metaKeywords: p.metaKeywords ?? "",
          };

          setBasicInfoData(basicInfo);
          setOriginalBasicInfo({
            ...basicInfo,
            categoryIds:
              p.categories?.map((c: any) => c.category?.id || c.id) ?? [],
            brandId: p.brand?.id ?? null,
          });

          // Set categories
          if (p.categories) {
            const cats = p.categories.map((c: any) => ({
              id: c.category?.id || c.id,
              name: c.category?.name || c.name,
              slug: c.category?.slug || c.slug,
            }));
            setSelectedCategories(cats);
          }

          // Set brand
          if (p.brand) {
            setSelectedBrand({
              id: p.brand.id,
              name: p.brand.name,
              slug: p.brand.slug,
            });
          }

          setBasicInfoLoaded(true);
        } else {
          toast.error("Failed to load product");
        }
      } catch (error) {
        console.error("Error loading product:", error);
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Load all products for related products
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const res = await getAllProducts({ page: 1, limit: 100 });
        if (res?.success && res.data) {
          setAllProducts(res.data.products || res.data || []);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadAllProducts();
  }, []);

  // Load attributes separately
  useEffect(() => {
    const loadAttributes = async () => {
      if (!id || attributesLoaded) return;

      setAttributesLoading(true);
      try {
        const res = await getProductAttributes(Number(id));
        if (res?.success && res.data) {
          const formattedAttributes = res.data.map((attr: any) => ({
            id: attr.id,
            name: attr.name,
            value: attr.value,
          }));
          setAttributes(formattedAttributes);
          setOriginalAttributes(
            JSON.parse(JSON.stringify(formattedAttributes)),
          );
        }
      } catch (error) {
        console.error("Error loading attributes:", error);
      } finally {
        setAttributesLoading(false);
        setAttributesLoaded(true);
      }
    };

    loadAttributes();
  }, [id, attributesLoaded]);

  // Load related products separately
  useEffect(() => {
    const loadRelated = async () => {
      if (!id || relatedLoaded) return;

      setRelatedLoading(true);
      try {
        const res = await getProductRelated(Number(id));
        if (res?.success && res.data) {
          const relatedData = res.data.map((related: any) => ({
            id: related.relatedId,
            name: related?.related?.name || `Product #${related.relatedId}`,
            img: related?.related?.images?.[0]?.url || null,
          }));
          console.log(relatedData);
          setRelatedProducts(relatedData);
          const ids = relatedData.map((r: any) => r.id);
          setOriginalRelatedIds(ids);
        }
      } catch (error) {
        console.error("Error loading related products:", error);
      } finally {
        setRelatedLoading(false);
        setRelatedLoaded(true);
      }
    };

    loadRelated();
  }, [id, relatedLoaded]);

  // Check for changes
  useEffect(() => {
    if (originalBasicInfo) {
      const currentCategoryIds = selectedCategories.map((c) => c.id).sort();
      const originalCategoryIds = originalBasicInfo.categoryIds?.sort() || [];

      const hasChanges =
        JSON.stringify(basicInfoData) !== JSON.stringify(originalBasicInfo) ||
        JSON.stringify(currentCategoryIds) !==
          JSON.stringify(originalCategoryIds) ||
        selectedBrand?.id !== originalBasicInfo?.brandId;
      setHasBasicInfoChanges(hasChanges);
    }
  }, [basicInfoData, selectedCategories, selectedBrand, originalBasicInfo]);

  useEffect(() => {
    if (originalAttributes.length > 0 || attributes.length > 0) {
      const hasChanges =
        JSON.stringify(attributes) !== JSON.stringify(originalAttributes);
      setHasAttributesChanges(hasChanges);
    }
  }, [attributes, originalAttributes]);

  useEffect(() => {
    if (originalRelatedIds.length > 0 || relatedProducts.length > 0) {
      const currentIds = relatedProducts.map((r) => r.id).sort();
      const hasChanges =
        JSON.stringify(currentIds) !==
        JSON.stringify(originalRelatedIds.sort());
      setHasRelatedChanges(hasChanges);
    }
  }, [relatedProducts, originalRelatedIds]);

  const handleBasicInfoChange = (updates: Partial<typeof basicInfoData>) => {
    setBasicInfoData((prev) => ({ ...prev, ...updates }));
  };

  const handleAddCategory = (category: Category) => {
    setSelectedCategories((prev) => [...prev, category]);
  };

  const handleRemoveCategory = (categoryId: number) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const handleClearBrand = () => {
    setSelectedBrand(null);
  };

  const handleSaveBasicInfo = async () => {
    setHookSaving(true);
    try {
      await updateBasicInfo(Number(id), {
        name: basicInfoData.name,
        shortDescription: basicInfoData.shortDescription,
        description: basicInfoData.description,
        categoryIds: selectedCategories.map((c) => c.id),
        brandId: selectedBrand?.id,
        tags: basicInfoData.tags,
        status: basicInfoData.status,
        isFeatured: basicInfoData.isFeatured,
        metaTitle: basicInfoData.metaTitle,
        metaDesc: basicInfoData.metaDesc,
        metaKeywords: basicInfoData.metaKeywords,
      });

      // Update original data
      setOriginalBasicInfo({
        ...basicInfoData,
        categoryIds: selectedCategories.map((c) => c.id),
        brandId: selectedBrand?.id,
      });
      setHasBasicInfoChanges(false);

      await showSuccessDialog(
        "Success",
        "Product basic info updated successfully!",
      );
    } catch (error: any) {
      await showErrorDialog(
        "Error",
        error.message || "Failed to update product",
      );
    } finally {
      setHookSaving(false);
    }
  };

  const handleSaveAttributes = async () => {
    setHookSaving(true);
    try {
      await saveProductAttributes(Number(id), attributes);
      setOriginalAttributes(JSON.parse(JSON.stringify(attributes)));
      setHasAttributesChanges(false);
      await showSuccessDialog(
        "Success",
        "Product attributes updated successfully!",
      );
    } catch (error: any) {
      await showErrorDialog(
        "Error",
        error.message || "Failed to update attributes",
      );
    } finally {
      setHookSaving(false);
    }
  };

  const handleSaveRelated = async () => {
    setHookSaving(true);
    try {
      const relatedIds = relatedProducts.map((r) => r.id);
      await saveRelatedProducts(Number(id), relatedIds);
      setOriginalRelatedIds([...relatedIds]);
      setHasRelatedChanges(false);
      await showSuccessDialog(
        "Success",
        "Related products updated successfully!",
      );
    } catch (error: any) {
      await showErrorDialog(
        "Error",
        error.message || "Failed to update related products",
      );
    } finally {
      setHookSaving(false);
    }
  };

  const handleAddRelatedProduct = (product: any) => {
    if (!relatedProducts.find((rp) => rp.id === product.id)) {
      setRelatedProducts([
        ...relatedProducts,
        { id: product.id, name: product.name },
      ]);
    }
    setShowProductSearch(false);
    setSearchTerm("");
  };

  const handleRemoveRelatedProduct = (productId: number) => {
    setRelatedProducts(relatedProducts.filter((rp) => rp.id !== productId));
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await addProductImages(Number(id), fd);

      if (res?.success) {
        toast.success("Images uploaded successfully!");
        const refreshed = await getProductById(Number(id));
        if (refreshed?.success) setProduct(refreshed.data);
      } else {
        toast.error("Upload failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    const confirmed = await showConfirmDialog(
      "Delete Image",
      "Are you sure you want to delete this image?",
    );
    if (!confirmed) return;

    const res = await deleteProductImage(Number(id), imageId);
    if (res?.success) {
      toast.success("Image deleted");
      setProduct((prev: any) => ({
        ...prev,
        images: prev.images.filter((img: any) => img.id !== imageId),
      }));
    } else {
      toast.error("Failed to delete image");
    }
  };

  const handleStockUpdate = async () => {
    if (stockChange === 0) {
      toast.error("Please enter a stock change value");
      return;
    }

    try {
      const fd = new FormData();
      fd.append(
        "data",
        JSON.stringify({
          change: stockChange,
          reason: stockReason || "MANUAL_ADJUSTMENT",
        }),
      );
      const res = await updateStock(Number(id), selectedVariant.id, fd);

      if (res?.success) {
        toast.success(
          `Stock ${stockChange > 0 ? "increased" : "decreased"} by ${Math.abs(
            stockChange,
          )}`,
        );
        setProduct((prev: any) => ({
          ...prev,
          variants: prev.variants.map((v: any) =>
            v.id === selectedVariant.id
              ? { ...v, stock: v.stock + stockChange }
              : v,
          ),
        }));
        setShowStockModal(false);
        setStockChange(0);
        setStockReason("");
      } else {
        toast.error(res?.message ?? "Failed to update stock");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const handleUpdateAttribute = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleRemoveAttribute = (index: number) => {
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);
  };

  // Image preview handlers
  const handleOpenPreview = (imageUrl: string, index: number) => {
    setPreviewImage(imageUrl);
    setPreviewImageIndex(index);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsFullscreen(false);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setIsFullscreen(false);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleNextImage = () => {
    if (productImages.length > 0) {
      const nextIndex = (previewImageIndex + 1) % productImages.length;
      setPreviewImageIndex(nextIndex);
      setPreviewImage(productImages[nextIndex].url);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handlePrevImage = () => {
    if (productImages.length > 0) {
      const prevIndex =
        (previewImageIndex - 1 + productImages.length) % productImages.length;
      setPreviewImageIndex(prevIndex);
      setPreviewImage(productImages[prevIndex].url);
      setZoomLevel(1);
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setImagePosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      p.id !== Number(id),
  );

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-48 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="card p-12 text-center max-w-2xl mx-auto">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">
          Product not found or has been deleted.
        </p>
        <button
          onClick={() => router.back()}
          className="btn-primary px-6 py-2.5 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-4 px-1">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-display text-xl font-bold text-gray-900 truncate">
          Edit Product
        </h2>
        <span
          className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
            product.status === "ACTIVE"
              ? "bg-green-50 text-green-600 ring-1 ring-green-600/20"
              : product.status === "ARCHIVED"
              ? "bg-gray-100 text-gray-500 ring-1 ring-gray-500/20"
              : "bg-amber-50 text-amber-600 ring-1 ring-amber-600/20"
          }`}
        >
          {product.status}
        </span>
      </div>

      {/* Images Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <ImgIcon size={18} className="text-primary" />
            Product Images
          </h3>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-60"
          >
            {uploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full"
              />
            ) : (
              <Upload size={16} />
            )}
            Upload Images
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUploadImages}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {productImages.map((img: any, index: number) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 transition-all hover:shadow-md cursor-pointer"
              style={{ borderColor: img.isPrimary ? "#7C3AED" : "#E5E7EB" }}
              onClick={() => handleOpenPreview(img.url, index)}
            >
              <Image
                src={img.url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                height={300}
                width={300}
              />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full z-10">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPreview(img.url, index);
                  }}
                  className="p-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Preview"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(img.id);
                  }}
                  className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {(productImages.length === 0 || !productImages) && (
            <div
              onClick={() => fileRef.current?.click()}
              className="col-span-full aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary text-gray-400 hover:text-primary transition-all"
            >
              <Upload size={32} />
              <span className="text-sm">Click to upload images</span>
              <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Close button */}
            <button
              onClick={handleClosePreview}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
              <X size={24} />
            </button>

            {/* Navigation buttons */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-4 py-2">
              <button
                onClick={handleZoomOut}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white disabled:opacity-50"
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-white text-sm min-w-[60px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white disabled:opacity-50"
                disabled={zoomLevel >= 3}
              >
                <ZoomIn size={18} />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white text-xs px-3"
              >
                Reset
              </button>
              <button
                onClick={handleToggleFullscreen}
                className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>

            {/* Image counter */}
            {productImages.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 backdrop-blur-md rounded-full px-3 py-1 text-white text-sm">
                {previewImageIndex + 1} / {productImages.length}
              </div>
            )}

            {/* Image container */}
            <div
              ref={imageContainerRef}
              className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              style={{ cursor: zoomLevel > 1 ? "grab" : "default" }}
              onMouseDown={handleMouseDown}
            >
              <motion.div
                animate={{
                  scale: zoomLevel,
                  x: imagePosition.x,
                  y: imagePosition.y,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative"
                style={{
                  cursor: zoomLevel > 1 ? "grab" : "default",
                }}
              >
                <Image
                  src={previewImage}
                  alt="Product preview"
                  width={1200}
                  height={1200}
                  className="max-h-[90vh] w-auto h-auto object-contain select-none"
                  draggable={false}
                  priority
                />
              </motion.div>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/50 text-xs whitespace-nowrap">
              {zoomLevel > 1 ? "Drag to pan • " : ""}
              Ctrl + Scroll to zoom • Click outside to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Basic Info Section */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          {hasBasicInfoChanges && (
            <button
              onClick={handleSaveBasicInfo}
              disabled={hookSaving}
              className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {hookSaving ? (
                <div className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Changes
            </button>
          )}
        </div>

        {basicInfoLoaded && !hasBasicInfoChanges && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            ✓ Product information is up to date
          </div>
        )}

        {hasBasicInfoChanges && (
          <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
            ⚡ You have unsaved changes. Click "Save Changes" to update.
          </div>
        )}

        <FormInput
          label="Product Name"
          placeholder="e.g. Premium Cotton T-Shirt"
          value={basicInfoData.name}
          onChange={(e) => handleBasicInfoChange({ name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Short Description
          </label>
          <textarea
            value={basicInfoData.shortDescription}
            onChange={(e) =>
              handleBasicInfoChange({ shortDescription: e.target.value })
            }
            rows={2}
            placeholder="Brief summary shown on product cards..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Full Description
          </label>
          <textarea
            value={basicInfoData.description}
            onChange={(e) =>
              handleBasicInfoChange({ description: e.target.value })
            }
            rows={5}
            placeholder="Detailed product description (supports HTML)..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        <CategorySelector
          selectedCategories={selectedCategories}
          onAddCategory={handleAddCategory}
          onRemoveCategory={handleRemoveCategory}
        />

        <BrandSelector
          selectedBrand={selectedBrand}
          onSelectBrand={handleSelectBrand}
          onClearBrand={handleClearBrand}
        />

        <FormInput
          label="Tags (comma-separated)"
          placeholder="cotton, summer, casual"
          value={basicInfoData.tags}
          onChange={(e) => handleBasicInfoChange({ tags: e.target.value })}
        />

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Status
            </label>
            <select
              value={basicInfoData.status}
              onChange={(e) =>
                handleBasicInfoChange({ status: e.target.value })
              }
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary cursor-pointer"
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="DISCONTINUED">Discontinued</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <label className="flex items-center gap-2 mt-5 cursor-pointer">
            <input
              type="checkbox"
              checked={basicInfoData.isFeatured}
              onChange={(e) =>
                handleBasicInfoChange({ isFeatured: e.target.checked })
              }
              className="accent-primary w-4 h-4 cursor-pointer"
            />
            <span className="text-sm text-gray-700">Featured product</span>
          </label>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-2">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            SEO Information (Optional)
          </h4>
          <FormInput
            label="Meta Title"
            placeholder="SEO title for search engines"
            value={basicInfoData.metaTitle}
            onChange={(e) =>
              handleBasicInfoChange({ metaTitle: e.target.value })
            }
          />
          <FormInput
            label="Meta Description"
            placeholder="SEO description"
            value={basicInfoData.metaDesc}
            onChange={(e) =>
              handleBasicInfoChange({ metaDesc: e.target.value })
            }
          />
          <FormInput
            label="Meta Keywords"
            placeholder="keyword1, keyword2, keyword3"
            value={basicInfoData.metaKeywords}
            onChange={(e) =>
              handleBasicInfoChange({ metaKeywords: e.target.value })
            }
          />
        </div>
      </div>

      {/* Attributes Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            Product Attributes
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handleAddAttribute}
              className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              Add Attribute
            </button>
            {hasAttributesChanges && (
              <button
                onClick={handleSaveAttributes}
                disabled={hookSaving}
                className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {hookSaving ? (
                  <div className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save
              </button>
            )}
          </div>
        </div>

        {attributesLoaded && attributes.length > 0 && !hasAttributesChanges && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
            ✓ Attributes are up to date
          </div>
        )}

        {hasAttributesChanges && (
          <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
            ⚡ You have unsaved attribute changes.
          </div>
        )}

        {attributesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {attributes.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Layers className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No attributes added yet</p>
                <p className="text-xs mt-1">
                  Click "Add Attribute" to get started
                </p>
              </div>
            )}
            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <FormInput
                    label="Attribute Name"
                    placeholder="e.g., Color, Size, Material"
                    value={attr.name}
                    onChange={(e) =>
                      handleUpdateAttribute(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="flex-1">
                  <FormInput
                    label="Value"
                    placeholder="e.g., Red, Large, Cotton"
                    value={attr.value}
                    onChange={(e) =>
                      handleUpdateAttribute(index, "value", e.target.value)
                    }
                  />
                </div>
                <button
                  onClick={() => handleRemoveAttribute(index)}
                  className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Package size={18} className="text-primary" />
            Related Products
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowProductSearch(!showProductSearch)}
              className="btn-secondary px-3 py-1.5 text-sm flex items-center gap-1"
            >
              <Plus size={14} />
              Add Product
            </button>
            {hasRelatedChanges && (
              <button
                onClick={handleSaveRelated}
                disabled={hookSaving || relatedLoading}
                className="px-3 py-1.5 bg-yellow-50 text-yellow-700 text-sm rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {hookSaving ? (
                  <div className="w-4 h-4 border-2 border-yellow-700/30 border-t-yellow-700 rounded-full animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save Related
              </button>
            )}
          </div>
        </div>

        {relatedLoaded && relatedProducts.length > 0 && !hasRelatedChanges && (
          <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
            ✓ Related products are up to date
          </div>
        )}

        {hasRelatedChanges && (
          <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 mb-4">
            ⚡ You have unsaved related products changes.
          </div>
        )}

        {/* Product Search Dropdown */}
        {showProductSearch && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                autoFocus
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-48 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleAddRelatedProduct(p)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-white transition-all"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-gray-100 shrink-0">
                        <Image
                          fill
                          src={p.images?.[0]?.url || "/placeholder.png"}
                          alt={p.name}
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {p.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          Product ID #{p.id}
                        </p>
                      </div>

                      <Plus size={18} className="text-primary shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {relatedLoading ? (
          <div className="skeleton h-32 rounded-xl" />
        ) : (
          <div>
            {relatedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No related products added</p>
                <p className="text-xs mt-1">
                  Click "Add Product" to add related products
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((rp) => (
                    <div
                      key={rp.id}
                      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-primary/30 hover:shadow-lg"
                    >
                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveRelatedProduct(rp.id)}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={15} />
                      </button>

                      {/* Image */}
                      <div className="relative aspect-square bg-gray-100">
                        <Image
                          fill
                          src={rp.img || "/placeholder.png"}
                          alt={rp.name}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="line-clamp-2 min-h-[40px] text-sm font-semibold text-gray-900">
                          {rp.name}
                        </h4>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="rounded-lg bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
                            Related
                          </span>

                          <span className="text-xs text-gray-400">
                            #{rp.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Variants Section */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Package size={18} className="text-primary" />
          Variants & Inventory
        </h3>

        {product.variants?.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No variants created yet</p>
            <p className="text-xs mt-1">
              Use the product creation flow to add variants
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {product.variants?.map((v: any) => (
              <div
                key={v.id}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {v.name ?? "Default Variant"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      SKU: {v.sku}
                    </p>
                    {v.options && v.options.length > 0 && (
                      <div className="flex gap-2 mt-1.5">
                        {v.options.map((opt: any, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 border border-gray-200"
                          >
                            {opt.optionName}: {opt.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatBDT(v.price)}
                    </p>
                    {v.comparePrice && v.comparePrice > v.price && (
                      <p className="text-xs text-gray-400 line-through">
                        {formatBDT(v.comparePrice)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center bg-white rounded-xl px-3 py-2 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Stock</p>
                      <span
                        className={`text-sm font-bold min-w-8 text-center ${
                          v.stock === 0
                            ? "text-red-500"
                            : v.stock < 10
                            ? "text-amber-500"
                            : "text-green-600"
                        }`}
                      >
                        {v.stock}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedVariant(v);
                        setShowStockModal(true);
                      }}
                      className="btn-secondary px-3 py-2 text-sm"
                    >
                      Update Stock
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedVariant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Stock - {selectedVariant.name || "Default Variant"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Current Stock
                </label>
                <p className="text-2xl font-bold text-primary">
                  {selectedVariant.stock}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Stock Change
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStockChange((prev) => prev - 1)}
                    className="p-2 border border-gray-200 rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={stockChange}
                    onChange={(e) =>
                      setStockChange(parseInt(e.target.value) || 0)
                    }
                    className="flex-1 text-center border border-gray-200 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Enter change amount"
                  />
                  <button
                    onClick={() => setStockChange((prev) => prev + 1)}
                    className="p-2 border border-gray-200 rounded-lg hover:border-green-300 hover:text-green-500 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Positive = Add stock | Negative = Remove stock
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="e.g., Restock, Return, Damage, Sale"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setStockChange(0);
                    setStockReason("");
                  }}
                  className="flex-1 btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStockUpdate}
                  className="flex-1 btn-primary px-4 py-2"
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
