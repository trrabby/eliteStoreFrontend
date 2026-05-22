/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import {
  getWishlist,
  removeFromWishlist,
  moveToCart,
} from "@/services/wishlist.service";
import {
  setWishlist,
  removeFromWishlist as removeWishlistItem,
} from "@/store/slices/wishlistSlice";
import { formatBDT } from "@/lib/utils/currency";
import { toast } from "sonner";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getWishlist();
    if (res?.success) {
      setItems(res.data?.items ?? []);
      const ids = (res.data?.items ?? []).map((i: any) => i.productId);
      dispatch(setWishlist(ids));
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleRemove = async (productId: number) => {
    dispatch(removeWishlistItem(productId));
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    const res = await removeFromWishlist(productId);
    if (!res?.success) {
      toast.error("Failed to remove");
      load();
    } else {
      toast.success("Removed from wishlist");
    }
  };

  const handleMoveToCart = async (productId: number) => {
    const res = await moveToCart(productId);
    if (res?.success) {
      toast.success("Moved to cart!");
      handleRemove(productId);
    } else {
      toast.error(res?.message ?? "Failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-gray-900">
          Wishlist
          <span className="text-base font-normal text-gray-400 ml-2">
            ({items.length})
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-4/5 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <Heart size={48} className="text-gray-200" />
          <p className="text-gray-500">Your wishlist is empty.</p>
          <Link href="/products" className="btn-primary px-6 py-2.5 text-sm">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {items.map((item, i) => {
              const product = item.product;
              const variant = product?.variants?.[0];
              const price = variant?.price ?? 0;
              const compare = variant?.comparePrice;
              const image = product?.images?.[0]?.url;

              return (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ delay: i * 0.05 }}
                  className="card overflow-hidden group"
                >
                  {/* Image */}
                  <Link href={`/products/${product?.slug}`}>
                    <div className="relative aspect-4/5 overflow-hidden bg-primary-pale">
                      {image ? (
                        <Image
                          src={image}
                          alt={product?.name ?? ""}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-pale" />
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemove(item.productId);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 text-gray-500 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <Link href={`/products/${product?.slug}`}>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-primary transition-colors">
                        {product?.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5 mb-3">
                      <span className="text-sm font-bold text-primary">
                        {formatBDT(price)}
                      </span>
                      {compare && compare > price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatBDT(compare)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleMoveToCart(item.productId)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-pale text-primary text-xs font-semibold hover:bg-primary hover:text-white transition-all duration-200"
                    >
                      <ShoppingCart size={13} />
                      Move to Cart
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
