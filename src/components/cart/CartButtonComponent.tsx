"use client";

import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useFlyToCart } from "@/components/shared/FlyToCart";
import { useAppSelector } from "@/store/hook";
import { toggleCart } from "@/store/slices/uiSlice";

export function CartButton() {
  const dispatch = useDispatch();
  const { registerCartRef } = useFlyToCart();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const totalItems = useAppSelector((state) => state.cart.itemCount);

  // Register the cart ref when the component mounts and whenever it might change
  useEffect(() => {
    // Use a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      registerCartRef(buttonRef.current);
    }, 100);

    return () => clearTimeout(timer);
  }, [registerCartRef]);

  // Also re-register on window resize/scroll? Not necessary.

  return (
    <button
      ref={buttonRef}
      className="p-2 text-brand-600 hover:text-primary transition-colors relative"
      onClick={() => dispatch(toggleCart())}
      aria-label="Cart"
    >
      <ShoppingBag size={20} />

      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key={totalItems}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5
                       bg-primary text-white text-xs font-bold
                       rounded-full flex items-center justify-center"
          >
            {totalItems > 99 ? "99+" : totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
