/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Heart, Zap } from "lucide-react";
import { VariantSelector } from "./VariantSelector";
import { QuantitySelector } from "./QuantitySelector";
import { MagneticButton } from "@/components/shared/MagneticButton";
import { useFlyToCart } from "@/components/shared/FlyToCart";
import { useCart } from "@/lib/hooks/useCart";
import { useDispatch, useSelector } from "react-redux";
import {
  selectWishitems,
  toggleWishlistItem,
} from "@/store/slices/wishlistSlice";
import { toggleWishlist } from "@/services/wishlist.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatBDT } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";

type AddToCartSectionProps = {
  product: any;
  defaultVariant: any;
  flashOffer: any | null;
};

export function AddToCartSection({
  product,
  defaultVariant,
  flashOffer,
}: AddToCartSectionProps) {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const { addToCart } = useCart();
  const { flyToCart } = useFlyToCart();

  const wishlistIds = useSelector(selectWishitems);
  const isWishlisted = wishlistIds.includes(product.id);

  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [addingCart, setAddingCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const price = flashOffer
    ? Number(flashOffer.salePrice)
    : Number(selectedVariant?.price ?? 0);

  const stock = selectedVariant?.stock ?? 0;
  const outOfStock = stock === 0;
  const maxQty = Math.min(stock, 10);

  // Sticky mobile bar ref for cart icon
  const { registerCartRef } = useFlyToCart();

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (outOfStock || addingCart || !selectedVariant) return;

    setAddingCart(true);

    // fly animation from product image
    const imgEl = document.querySelector(
      "[data-product-main-image]",
    ) as HTMLElement;
    if (imgEl) flyToCart(product.images?.[0]?.url ?? "", imgEl);

    const success = await addToCart({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      productName: product.name,
      variantName: selectedVariant.name ?? "",
      sku: selectedVariant.sku,
      price,
      comparePrice: selectedVariant.comparePrice
        ? Number(selectedVariant.comparePrice)
        : null,
      image: product.images?.[0]?.url ?? "",
      stock,
    });

    if (success) toast.success(`${quantity} item(s) added to cart! 🛍️`);
    setTimeout(() => setAddingCart(false), 1000);
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setBuyingNow(true);
    await handleAddToCart();
    router.push("/checkout");
  };

  const handleWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    dispatch(toggleWishlistItem(product.id));
    const fd = new FormData();
    fd.append("data", JSON.stringify({ productId: product.id }));
    await toggleWishlist(fd);
  };

  return (
    <div className="space-y-5">
      {/* Variant selector */}
      {product.variants?.length > 0 && (
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onSelect={setSelectedVariant}
        />
      )}

      {/* Stock status */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            stock > 10
              ? "bg-green-500"
              : stock > 0
                ? "bg-amber-500"
                : "bg-red-500",
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            stock > 10
              ? "text-green-600"
              : stock > 0
                ? "text-amber-600"
                : "text-red-600",
          )}
        >
          {outOfStock
            ? "Out of stock"
            : stock <= 10
              ? `Only ${stock} left!`
              : "In stock"}
        </span>
      </div>

      {/* Quantity */}
      {!outOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Quantity:</span>
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            max={maxQty}
          />
          <span className="text-xs text-gray-400">Max {maxQty} per order</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <MagneticButton
          onClick={handleAddToCart}
          disabled={outOfStock || addingCart}
          strength={0.3}
          className={cn(
            "flex-1 flex items-center justify-center gap-2",
            "py-3.5 rounded-xl text-sm font-semibold",
            "transition-all duration-200",
            outOfStock
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "btn-primary",
          )}
        >
          {addingCart ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/30
                           border-t-white rounded-full"
              />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </MagneticButton>

        {/* Buy now */}
        {!outOfStock && (
          <MagneticButton
            onClick={handleBuyNow}
            disabled={buyingNow}
            strength={0.3}
            className="flex-1 flex items-center justify-center gap-2
                       py-3.5 rounded-xl text-sm font-semibold
                       bg-gray-900 text-white hover:bg-gray-800
                       transition-all duration-200 disabled:opacity-60"
          >
            <Zap size={16} />
            Buy Now
          </MagneticButton>
        )}

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleWishlist}
          className={cn(
            "w-12 h-12 rounded-xl border-2 flex items-center justify-center",
            "transition-all duration-200",
            isWishlisted
              ? "border-primary bg-primary-pale text-primary"
              : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary",
          )}
        >
          <Heart size={18} className={isWishlisted ? "fill-primary" : ""} />
        </motion.button>
      </div>

      {/* Total price display */}
      {quantity > 1 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-gray-500"
        >
          Total:{" "}
          <span className="font-bold text-primary text-base">
            {formatBDT(price * quantity)}
          </span>
        </motion.div>
      )}

      {/* Mobile sticky bar */}
      <div
        className="lg:hidden fixed bottom-16 left-0 right-0 z-30
                      bg-white/95 backdrop-blur-md border-t border-gray-100
                      px-4 py-3 flex items-center gap-3 shadow-lg"
      >
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-primary text-lg">
            {formatBDT(price)}
          </p>
          <p className="text-xs text-gray-500 truncate">{product.name}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || addingCart}
          ref={(el) => registerCartRef(el)}
          className="btn-primary px-6 py-3 flex items-center gap-2
                     text-sm disabled:opacity-60"
        >
          <ShoppingCart size={15} />
          {outOfStock ? "Sold Out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
