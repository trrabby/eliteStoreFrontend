"use client";

// Global fly-to-cart animation system
// Products clone their image and fly as an arc to the cart icon

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type FlyItem = {
  id: string;
  src: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type FlyContextType = {
  registerCartRef: (el: HTMLElement | null) => void;
  flyToCart: (imgSrc: string, fromEl: HTMLElement) => void;
};

const FlyContext = createContext<FlyContextType>({
  registerCartRef: () => {},
  flyToCart: () => {},
});

export const useFlyToCart = () => useContext(FlyContext);

export function FlyToCartProvider({ children }: { children: ReactNode }) {
  const cartRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<FlyItem[]>([]);

  const registerCartRef = useCallback((el: HTMLElement | null) => {
    cartRef.current = el;
  }, []);

  const flyToCart = useCallback((imgSrc: string, fromEl: HTMLElement) => {
    if (!cartRef.current || typeof window === "undefined") return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = cartRef.current.getBoundingClientRect();

    const from = {
      x: fromRect.left + fromRect.width / 2,
      y: fromRect.top + fromRect.height / 2,
    };
    const to = {
      x: toRect.left + toRect.width / 2,
      y: toRect.top + toRect.height / 2,
    };

    const id = `fly-${Date.now()}-${Math.random()}`;
    setItems((prev) => [...prev, { id, src: imgSrc, from, to }]);

    // remove after animation
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 900);
  }, []);

  return (
    <FlyContext.Provider value={{ registerCartRef, flyToCart }}>
      {children}
      {/* Flying items rendered at root level */}
      <AnimatePresence>
        {items.map((item) => (
          <FlyingItem key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </FlyContext.Provider>
  );
}

function FlyingItem({ item }: { item: FlyItem }) {
  // arc midpoint — go up and curve
  const midX = (item.from.x + item.to.x) / 2;
  const midY = Math.min(item.from.y, item.to.y) - 120;

  return (
    <motion.div
      className="fixed pointer-events-none z-9999"
      style={{
        left: item.from.x - 30,
        top: item.from.y - 30,
      }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        left: [item.from.x - 30, midX - 30, item.to.x - 15],
        top: [item.from.y - 30, midY - 30, item.to.y - 15],
        scale: [1, 0.8, 0.3],
        opacity: [1, 1, 0],
        rotate: [0, 15, 0],
      }}
      transition={{
        duration: 0.85,
        ease: [0.4, 0, 0.2, 1],
        times: [0, 0.5, 1],
      }}
    >
      <Image
        src={item.src}
        alt=""
        fill
        className="w-[60px] h-[60px] rounded-xl object-cover
                   shadow-pink border-2 border-white"
      />
    </motion.div>
  );
}
