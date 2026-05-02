"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useState, useRef } from "react";
import { formatBDT, discountPercent } from "@/lib/utils/currency";
import { useFlyToCart } from "@/components/shared/FlyToCart";
import { useCart } from "@/lib/hooks/useCart";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { toggleWishlistItem } from "@/store/slices/wishlistSlice";
import { toggleWishlist } from "@/services/wishlist.service";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

export type ProductCardData = {
  id: number;
  publicId: string;
  name: string;
  slug: string;
  averageRating: number;
  reviewCount: number;
  images: { url: string; altText: string | null }[];
  variants: {
    price: number;
    comparePrice: number | null;
    stock: number;
  }[];
  brand?: { name: string; slug: string } | null;
};

type ProductCardProps = {
  product: ProductCardData;
  index?: number;
  className?: string;
};

export function ProductCard({
  product,
  index = 0,
  className,
}: ProductCardProps) {
  const dispatch = useDispatch();
  const { flyToCart } = useFlyToCart();
  const { addToCart } = useCart();

  const wishlistIds = useSelector((s: RootState) => s.wishlist.productIds);
  const isWishlisted = wishlistIds.includes(product.id);

  const [isAdding, setIsAdding] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const image = product.images?.[0];
  const variant = product.variants?.[0];
  const price = variant?.price ?? 0;
  const comparePrice = variant?.comparePrice ?? null;
  const stock = variant?.stock ?? 0;
  const discount = discountPercent(price, comparePrice ?? 0);
  const outOfStock = stock === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock || isAdding || !variant) return;

    setIsAdding(true);

    // trigger fly animation
    if (imgRef.current && image?.url) {
      flyToCart(image.url, imgRef.current);
    }

    const success = await addToCart({
      productId: product.id,
      variantId: 0, // default variant — adjust when full variant data available
      quantity: 1,
      productName: product.name,
      variantName: "",
      sku: "",
      price,
      comparePrice,
      image: image?.url ?? "",
      stock,
    });

    if (success) {
      toast.success("Added to cart!", {
        icon: "🛍️",
      });
    }

    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dispatch(toggleWishlistItem(product.id));

    const formData = new FormData();
    formData.append("data", JSON.stringify({ productId: product.id }));
    const result = await toggleWishlist(formData);

    if (!result?.success) {
      dispatch(toggleWishlistItem(product.id)); // rollback
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("group", className)}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="card overflow-hidden bg-white">
          {/* Image container */}
          <div
            ref={imgRef}
            className="relative aspect-4/5 overflow-hidden bg-primary-pale"
          >
            {image?.url ? (
              <Image
                src={image.url}
                alt={image.altText ?? product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  "object-cover transition-transform duration-700",
                  "group-hover:scale-110",
                  imgLoaded ? "opacity-100" : "opacity-0",
                )}
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-pale" />
            )}

            {/* Skeleton shimmer while loading */}
            {!imgLoaded && <div className="absolute inset-0 skeleton" />}

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="badge-discount text-xs">-{discount}%</span>
              )}
              {outOfStock && (
                <span
                  className="bg-gray-700 text-white text-xs font-semibold
                                 px-2 py-0.5 rounded-full"
                >
                  Sold Out
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <motion.button
              onClick={handleWishlist}
              whileTap={{ scale: 0.85 }}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full
                         bg-white/90 backdrop-blur-sm flex items-center
                         justify-center shadow-sm opacity-0
                         group-hover:opacity-100 transition-opacity
                         duration-200 hover:bg-primary-pale z-10"
              aria-label="Toggle wishlist"
            >
              <Heart
                size={15}
                className={cn(
                  "transition-all duration-200",
                  isWishlisted ? "fill-primary text-primary" : "text-gray-600",
                )}
              />
            </motion.button>

            {/* Quick add to cart — bottom overlay */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-2
                         translate-y-full group-hover:translate-y-0
                         transition-transform duration-300"
            >
              <motion.button
                onClick={handleAddToCart}
                disabled={outOfStock || isAdding}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "w-full py-2.5 rounded-xl text-white text-sm font-semibold",
                  "flex items-center justify-center gap-2",
                  "transition-all duration-200",
                  outOfStock
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-primary hover:brightness-105 shadow-pink",
                )}
              >
                {isAdding ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white/30
                                 border-t-white rounded-full"
                    />
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={15} />
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* Product info */}
          <div className="p-3">
            {product.brand && (
              <p
                className="text-xs text-primary font-medium mb-1 uppercase
                            tracking-wide"
              >
                {product.brand.name}
              </p>
            )}

            <h3
              className="text-sm font-semibold text-gray-800
                           line-clamp-2 leading-snug mb-2 group-hover:text-primary
                           transition-colors"
            >
              {product.name}
            </h3>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={cn(
                        i < Math.round(product.averageRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200 fill-gray-200",
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  ({product.reviewCount})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-primary">
                {formatBDT(price)}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-xs text-gray-400 line-through">
                  {formatBDT(comparePrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
