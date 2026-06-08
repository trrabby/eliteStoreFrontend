/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */

// app/vendor/products/create/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Layers, Tag, Link2, Image } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { Step, StepIndicator } from "@/components/product/create/StepIndicator";
import { Category } from "@/lib/hooks/useCategories";
import { Brand } from "@/lib/hooks/useBrands";
import { useProductCreation, Variant } from "@/lib/hooks/useProductCreation";
import { BasicInfoStep } from "@/components/product/create/BasicInfoStep";
import { VariantsStep } from "@/components/product/create/VariantsStep";
import { RelatedProductSelector } from "@/components/product/create/RelatedProductSelector";
import { NavigationButtons } from "@/components/product/create/NavigationButtons";
import { AttributeManager } from "@/components/product/create/AttributeManager";
import { ProductImageUploader } from "@/components/product/create/ProductImageUploader";
import { ProductImage } from "@/lib/hooks/useProductImages";

type StepKey = "basic" | "variants" | "attributes" | "images" | "related";

const steps: Step[] = [
  { key: "basic", label: "Basic Info", icon: <Package size={16} /> },
  { key: "variants", label: "Variants", icon: <Layers size={16} /> },
  { key: "attributes", label: "Attributes", icon: <Tag size={16} /> },
  { key: "images", label: "Images", icon: <Image size={16} /> },
  { key: "related", label: "Related Products", icon: <Link2 size={16} /> },
];

// Storage key for persisting product creation state
const STORAGE_KEY = "product_creation_draft";

interface StoredProductState {
  productId: number | null;
  basicInfo: any;
  selectedCategories: Category[];
  selectedBrand: Brand | null;
  variants: Variant[];
  attributes: { name: string; value: string }[];
  relatedProductIds: number[];
  completedSteps: string[];
  savedBasicInfo?: any;
  savedSelectedCategories?: Category[];
  savedSelectedBrand?: Brand | null;
  savedVariants?: Variant[];
  savedAttributes?: { name: string; value: string }[];
  savedRelatedProductIds?: number[];
}

export default function CreateProductForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<StepKey>("basic");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState<Record<StepKey, boolean>>({
    basic: false,
    variants: false,
    attributes: false,
    images: false,
    related: false,
  });
  const isInitialMount = useRef(true);

  // Basic info state
  const [basicInfo, setBasicInfo] = useState({
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
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [basicErrors, setBasicErrors] = useState<Record<string, string>>({});

  // Saved states for comparison
  const [savedBasicInfo, setSavedBasicInfo] = useState<any>(null);
  const [savedSelectedCategories, setSavedSelectedCategories] = useState<
    Category[]
  >([]);
  const [savedSelectedBrand, setSavedSelectedBrand] = useState<Brand | null>(
    null,
  );
  const [savedVariants, setSavedVariants] = useState<Variant[]>([]);
  const [savedAttributes, setSavedAttributes] = useState<
    { name: string; value: string }[]
  >([]);
  const [savedRelatedProductIds, setSavedRelatedProductIds] = useState<
    number[]
  >([]);

  // Variants state
  const [variants, setVariants] = useState<Variant[]>([
    {
      sku: "",
      name: "",
      price: 0,
      comparePrice: undefined,
      costPrice: undefined,
      stock: 0,
      lowStockAlert: 5,
      weight: undefined,
      barcode: "",
      isDefault: true,
      isActive: true,
      options: [],
    },
  ]);

  // Attributes state
  const [attributes, setAttributes] = useState<
    { name: string; value: string }[]
  >([]);

  // Images state
  const [productImages, setProductImages] = useState<ProductImage[]>([]);

  // Related products state
  const [relatedProductIds, setRelatedProductIds] = useState<number[]>([]);
  const [relatedError, setRelatedError] = useState<string>("");

  const {
    saving,
    setSaving,
    productId,
    setProductId,
    createBasicInfo,
    updateBasicInfo,
    syncProductVariants,
    fetchExistingVariants,
    saveProductAttributes,
    saveRelatedProducts,
    showConfirmDialog,
  } = useProductCreation();

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed: StoredProductState = JSON.parse(savedState);
        if (parsed.productId) {
          setProductId(parsed.productId);
          setBasicInfo(parsed.basicInfo);
          setSelectedCategories(parsed.selectedCategories);
          setSelectedBrand(parsed.selectedBrand);
          setVariants(parsed.variants);
          setAttributes(parsed.attributes);
          setRelatedProductIds(parsed.relatedProductIds);
          setCompletedSteps(parsed.completedSteps);

          // Set saved states for comparison
          setSavedBasicInfo(parsed.savedBasicInfo || parsed.basicInfo);
          setSavedSelectedCategories(
            parsed.savedSelectedCategories || parsed.selectedCategories,
          );
          setSavedSelectedBrand(
            parsed.savedSelectedBrand || parsed.selectedBrand,
          );
          setSavedVariants(parsed.savedVariants || parsed.variants);
          setSavedAttributes(parsed.savedAttributes || parsed.attributes);
          setSavedRelatedProductIds(
            parsed.savedRelatedProductIds || parsed.relatedProductIds,
          );

          // If there are completed steps, navigate to the last completed step
          if (parsed.completedSteps.length > 0) {
            const lastCompleted =
              parsed.completedSteps[parsed.completedSteps.length - 1];
            const stepOrder: StepKey[] = [
              "basic",
              "variants",
              "attributes",
              "images",
              "related",
            ];
            const nextStepIndex =
              stepOrder.indexOf(lastCompleted as StepKey) + 1;
            if (nextStepIndex < stepOrder.length) {
              setCurrentStep(stepOrder[nextStepIndex]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load saved state:", error);
      }
    }
  }, []);

  // Add this useEffect after productId is set
  useEffect(() => {
    if (productId && !savedVariants.length) {
      // Load existing variants from server
      const loadExistingVariants = async () => {
        try {
          const variants = await fetchExistingVariants(productId);
          if (variants && variants.length > 0) {
            setVariants(variants);
            setSavedVariants(variants);
          }
        } catch (error) {
          console.error("Failed to load existing variants:", error);
        }
      };
      loadExistingVariants();
    }
  }, [productId]);

  // Detect changes in basic info
  useEffect(() => {
    if (savedBasicInfo && productId) {
      const hasBasicChanges =
        JSON.stringify(basicInfo) !== JSON.stringify(savedBasicInfo) ||
        JSON.stringify(selectedCategories) !==
          JSON.stringify(savedSelectedCategories) ||
        JSON.stringify(selectedBrand) !== JSON.stringify(savedSelectedBrand);
      setHasChanges((prev) => ({ ...prev, basic: hasBasicChanges }));
    }
  }, [
    basicInfo,
    selectedCategories,
    selectedBrand,
    savedBasicInfo,
    savedSelectedCategories,
    savedSelectedBrand,
    productId,
  ]);

  // Detect changes in variants
  useEffect(() => {
    if (
      savedVariants.length > 0 &&
      productId &&
      completedSteps.includes("variants")
    ) {
      const hasVariantChanges =
        JSON.stringify(variants) !== JSON.stringify(savedVariants);
      setHasChanges((prev) => ({ ...prev, variants: hasVariantChanges }));
    }
  }, [variants, savedVariants, productId, completedSteps]);

  // Detect changes in attributes
  useEffect(() => {
    if (
      savedAttributes.length > 0 &&
      productId &&
      completedSteps.includes("attributes")
    ) {
      const hasAttributeChanges =
        JSON.stringify(attributes) !== JSON.stringify(savedAttributes);
      setHasChanges((prev) => ({ ...prev, attributes: hasAttributeChanges }));
    }
  }, [attributes, savedAttributes, productId, completedSteps]);

  // Detect changes in related products
  useEffect(() => {
    if (
      savedRelatedProductIds.length > 0 &&
      productId &&
      completedSteps.includes("related")
    ) {
      const hasRelatedChanges =
        JSON.stringify(relatedProductIds) !==
        JSON.stringify(savedRelatedProductIds);
      setHasChanges((prev) => ({ ...prev, related: hasRelatedChanges }));
    }
  }, [relatedProductIds, savedRelatedProductIds, productId, completedSteps]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (productId) {
      const stateToSave: StoredProductState = {
        productId,
        basicInfo,
        selectedCategories,
        selectedBrand,
        variants,
        attributes,
        relatedProductIds,
        completedSteps,
        savedBasicInfo: savedBasicInfo || basicInfo,
        savedSelectedCategories: savedSelectedCategories.length
          ? savedSelectedCategories
          : selectedCategories,
        savedSelectedBrand:
          savedSelectedBrand !== undefined ? savedSelectedBrand : selectedBrand,
        savedVariants: savedVariants.length ? savedVariants : variants,
        savedAttributes: savedAttributes.length ? savedAttributes : attributes,
        savedRelatedProductIds: savedRelatedProductIds.length
          ? savedRelatedProductIds
          : relatedProductIds,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [
    productId,
    basicInfo,
    selectedCategories,
    selectedBrand,
    variants,
    attributes,
    relatedProductIds,
    completedSteps,
  ]);

  // Validate basic info
  const validateBasicInfo = () => {
    const errors: Record<string, string> = {};
    if (!basicInfo.name || basicInfo.name.length < 2) {
      errors.name = "Product name must be at least 2 characters";
    }
    if (selectedCategories.length === 0) {
      errors.categoryIds = "At least one category is required";
    }
    setBasicErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate related products
  const validateRelated = () => {
    if (relatedProductIds.length === 0) {
      setRelatedError("At least one related product is required");
      return false;
    }
    setRelatedError("");
    return true;
  };

  // Handle update functions
  const handleUpdateBasicInfo = async () => {
    if (!validateBasicInfo()) return;

    setSaving(true);
    const toastId = toast.loading("Updating product info...");

    try {
      await updateBasicInfo(productId!, {
        ...basicInfo,
        categoryIds: selectedCategories.map((c) => c.id),
        brandId: selectedBrand?.id,
      });
      setSavedBasicInfo(basicInfo);
      setSavedSelectedCategories(selectedCategories);
      setSavedSelectedBrand(selectedBrand);
      setHasChanges((prev) => ({ ...prev, basic: false }));
      toast.success("Product info updated!", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to update product", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Handle update variants
  const handleUpdateVariants = async () => {
    if (variants.length === 0) {
      toast.error("At least one variant is required");
      return;
    }

    if (!productId) {
      toast.error("Product not found. Please start over.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving variants...");

    try {
      // This will handle create, update, and delete intelligently
      const { results, updatedVariants } = await syncProductVariants(
        productId,
        variants,
      );

      // Use the updated variants which should have IDs populated
      const variantsWithIds = updatedVariants.map((v) => {
        // If variant still doesn't have an ID, try to find it from results
        if (!v.id) {
          const createdResult = results.find(
            (r) => r.action === "create" && r.variant.name === v.name,
          );
          if (createdResult?.newId) {
            return { ...v, id: createdResult.newId };
          }
        }
        return v;
      });

      setVariants(variantsWithIds);
      setSavedVariants(variantsWithIds);
      setHasChanges((prev) => ({ ...prev, variants: false }));

      const created = results.filter((r) => r.action === "create").length;
      const updated = results.filter((r) => r.action === "update").length;
      const deleted = results.filter((r) => r.action === "delete").length;

      let message = "Variants saved: ";
      if (created) message += `${created} created `;
      if (updated) message += `${updated} updated `;
      if (deleted) message += `${deleted} removed `;

      toast.success(message.trim(), { id: toastId });

      // Log to see if IDs are properly assigned
      console.log("Variants after save:", variantsWithIds);
    } catch (error: any) {
      toast.error(error.message || "Failed to save variants", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    if (currentStep === "basic") {
      if (!validateBasicInfo()) return;

      // If there are changes and step is already completed, update first
      if (completedSteps.includes("basic") && hasChanges.basic) {
        await handleUpdateBasicInfo();
      }

      // Only create product if it doesn't exist yet
      if (!productId) {
        setSaving(true);
        const toastId = toast.loading("Creating product...");

        try {
          const id = await createBasicInfo({
            ...basicInfo,
            categoryIds: selectedCategories.map((c) => c.id),
            brandId: selectedBrand?.id,
          });
          setProductId(id);
          setSavedBasicInfo(basicInfo);
          setSavedSelectedCategories(selectedCategories);
          setSavedSelectedBrand(selectedBrand);
          if (!completedSteps.includes("basic")) {
            setCompletedSteps([...completedSteps, "basic"]);
          }
          toast.success("Product created!", { id: toastId });
          setCurrentStep("variants");
        } catch (error: any) {
          toast.error(error.message || "Failed to create product", {
            id: toastId,
          });
        } finally {
          setSaving(false);
        }
      } else {
        // Product already exists, mark step as completed if not already
        if (!completedSteps.includes("basic")) {
          setCompletedSteps([...completedSteps, "basic"]);
        }
        setCurrentStep("variants");
      }
    } else if (currentStep === "variants") {
      // If there are changes and step is completed, update first
      if (completedSteps.includes("variants") && hasChanges.variants) {
        await handleUpdateVariants();
      }

      if (!completedSteps.includes("variants")) {
        if (variants.length === 0) {
          toast.error("At least one variant is required");
          return;
        }

        if (!productId) {
          toast.error("Product not found. Please start over.");
          return;
        }

        setSaving(true);
        const toastId = toast.loading("Creating variants...");

        try {
          const { results, updatedVariants } = await syncProductVariants(
            productId,
            variants,
          );

          // Update variants with IDs from created variants
          const variantsWithIds = updatedVariants.map((v) => {
            if (!v.id) {
              const createdResult = results.find(
                (r) => r.action === "create" && r.variant.name === v.name,
              );
              if (createdResult?.newId) {
                return { ...v, id: createdResult.newId };
              }
            }
            return v;
          });

          setVariants(variantsWithIds);
          setSavedVariants(variantsWithIds);
          setCompletedSteps([...completedSteps, "variants"]);

          const created = results.filter((r) => r.action === "create").length;
          toast.success(`${created} variant(s) created!`, { id: toastId });

          console.log("Created variants with IDs:", variantsWithIds);
        } catch (error: any) {
          toast.error(error.message || "Failed to create variants", {
            id: toastId,
          });
          return;
        } finally {
          setSaving(false);
        }
      }
      setCurrentStep("attributes");
    } else if (currentStep === "attributes") {
      // For attributes, always save (delete existing + add new)
      setSaving(true);
      const toastId = toast.loading("Saving attributes...");

      try {
        await saveProductAttributes(productId!, attributes);
        setSavedAttributes(attributes);
        if (!completedSteps.includes("attributes")) {
          setCompletedSteps([...completedSteps, "attributes"]);
        }
        toast.success("Attributes saved!", { id: toastId });
      } catch (error: any) {
        toast.error(error.message || "Failed to save attributes", {
          id: toastId,
        });
        return;
      } finally {
        setSaving(false);
      }
      setCurrentStep("images");
    } else if (currentStep === "images") {
      // Images step - just mark as completed (images are handled separately)
      if (!completedSteps.includes("images")) {
        setCompletedSteps([...completedSteps, "images"]);
      }
      setCurrentStep("related");
    }
  };

  // Handle complete
  const handleComplete = async () => {
    // For related products, always save (delete existing + add new)
    if (!validateRelated()) return;
    if (!productId) return;

    setSaving(true);
    const toastId = toast.loading("Saving related products...");

    try {
      await saveRelatedProducts(productId, relatedProductIds);
      setSavedRelatedProductIds(relatedProductIds);
      if (!completedSteps.includes("related")) {
        setCompletedSteps([...completedSteps, "related"]);
      }
      toast.success("Product created successfully!", { id: toastId });

      // Clear saved state from localStorage
      localStorage.removeItem(STORAGE_KEY);

      await Swal.fire({
        title: "Success!",
        text: "Product has been created successfully.",
        icon: "success",
        confirmButtonText: "Go to Products",
        confirmButtonColor: "#7C3AED",
        background: "#ffffff",
        customClass: {
          popup: "rounded-3xl",
          confirmButton:
            "bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition",
        },
        buttonsStyling: false,
      });

      router.push("/vendor/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to save related products", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const stepOrder: StepKey[] = [
      "basic",
      "variants",
      "attributes",
      "images",
      "related",
    ];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const addCategory = (category: Category) => {
    if (!selectedCategories.find((c) => c.id === category.id)) {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const removeCategory = async (categoryId: number, categoryName: string) => {
    const confirmed = await showConfirmDialog(
      "Remove category?",
      `Remove "${categoryName}" from product categories?`,
    );
    if (confirmed) {
      setSelectedCategories(
        selectedCategories.filter((c) => c.id !== categoryId),
      );
      toast.success("Category removed");
    }
  };

  const selectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const clearBrand = async () => {
    if (selectedBrand) {
      const confirmed = await showConfirmDialog(
        "Remove brand?",
        `Remove "${selectedBrand.name}" from product?`,
      );
      if (confirmed) {
        setSelectedBrand(null);
        toast.success("Brand removed");
      }
    }
  };

  const addRelatedProduct = (id: number) => {
    setRelatedProductIds([...relatedProductIds, id]);
    setRelatedError("");
  };

  const removeRelatedProduct = async (id: number, name: string) => {
    const confirmed = await showConfirmDialog(
      "Remove related product?",
      `Remove "${name}" from related products?`,
    );
    if (confirmed) {
      setRelatedProductIds(relatedProductIds.filter((pid) => pid !== id));
      toast.success("Related product removed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Create Product
        </h2>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        hasChanges={hasChanges}
        onStepClick={(step) => setCurrentStep(step as StepKey)}
      />

      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        {/* Step 1: Basic Information */}
        {currentStep === "basic" && (
          <BasicInfoStep
            data={basicInfo}
            onDataChange={(data) => setBasicInfo({ ...basicInfo, ...data })}
            selectedCategories={selectedCategories}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
            selectedBrand={selectedBrand}
            onSelectBrand={selectBrand}
            onClearBrand={clearBrand}
            errors={basicErrors}
            isCompleted={completedSteps.includes("basic")}
            onUpdate={handleUpdateBasicInfo}
            isUpdating={saving}
            hasChanges={hasChanges.basic}
          />
        )}

        {/* Step 2: Variants */}
        {currentStep === "variants" && (
          <VariantsStep
            variants={variants}
            onVariantsChange={setVariants}
            onNext={handleNext}
            onBack={handleBack}
            saving={saving}
            isCompleted={completedSteps.includes("variants")}
            onUpdate={handleUpdateVariants}
            hasChanges={hasChanges.variants}
          />
        )}

        {/* Step 3: Attributes */}
        {currentStep === "attributes" && (
          <AttributeManager
            attributes={attributes}
            onAttributesChange={setAttributes}
          />
        )}

        {/* Step 4: Images */}
        {currentStep === "images" && (
          <ProductImageUploader
            productId={productId}
            onImagesChange={setProductImages}
          />
        )}

        {/* Step 5: Related Products */}
        {currentStep === "related" && (
          <RelatedProductSelector
            productId={productId}
            selectedIds={relatedProductIds}
            onAddProduct={addRelatedProduct}
            onRemoveProduct={removeRelatedProduct}
            error={relatedError}
          />
        )}

        {/* Navigation Buttons */}
        <NavigationButtons
          onBack={currentStep !== "basic" ? handleBack : undefined}
          onNext={currentStep !== "related" ? handleNext : undefined}
          onComplete={currentStep === "related" ? handleComplete : undefined}
          isFirstStep={currentStep === "basic"}
          isLastStep={currentStep === "related"}
          saving={saving}
          showUpdateButton={
            (currentStep === "basic" || currentStep === "variants") &&
            completedSteps.includes(currentStep) &&
            hasChanges[currentStep]
          }
          onUpdate={() => {
            if (currentStep === "basic") handleUpdateBasicInfo();
            else if (currentStep === "variants") handleUpdateVariants();
          }}
        />
      </form>
    </div>
  );
}
