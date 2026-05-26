/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartVariant = {
  id: number;
  name: string;
  sku: string;
  price: string;
  comparePrice: string | null;
  stock: number;
  isActive: boolean;
};

type CartProduct = {
  id: number;
  name: string;
  slug: string;
  status: string;
  publicId: string;
  images: {
    url: string;
    altText: string;
  }[];
};

export type CartItem = {
  id: number;
  cartId: number;
  productId: number;
  variantId: number;
  quantity: number;
  addedAt: string;
  product: CartProduct;
  variant: CartVariant;
};

type CartState = {
  id: number | null;
  itemCount: number;
  items: CartItem[];
  subtotal: number;
  savings: number;
  isSyncing: boolean;
};

// Helper: Load cart from localStorage
const loadFromLocalStorage = (): Partial<CartState> | null => {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem("guest_cart");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.items && Array.isArray(parsed.items)) {
        return {
          id: parsed.id,
          items: parsed.items,
          itemCount: parsed.items.length,
        };
      }
    }
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
  }
  return null;
};

// Helper: Save cart to localStorage
const saveToLocalStorage = (state: Partial<CartState>) => {
  if (typeof window === "undefined") return;
  try {
    const toSave = {
      id: state.id,
      items: state.items,
      itemCount: state.itemCount,
    };
    localStorage.setItem("guest_cart", JSON.stringify(toSave));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Helper: Clear localStorage
const clearLocalStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("guest_cart");
  } catch (error) {
    console.error("Failed to clear guest cart:", error);
  }
};

// Helper: Recalculate totals
const recalculate = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => {
    return sum + Number(i.variant.price) * i.quantity;
  }, 0);

  const savings = items.reduce((sum, i) => {
    const price = Number(i.variant.price);
    const compare = i.variant.comparePrice ? Number(i.variant.comparePrice) : 0;

    if (compare > price) {
      return sum + (compare - price) * i.quantity;
    }
    return sum;
  }, 0);

  return { subtotal, savings };
};

// Initial state with localStorage data
const savedCart = loadFromLocalStorage();
const initialState: CartState = {
  id: savedCart?.id ?? null,
  itemCount: savedCart?.itemCount ?? 0,
  items: savedCart?.items ?? [],
  subtotal: 0,
  savings: 0,
  isSyncing: false,
};

// Recalculate initial totals
const { subtotal, savings } = recalculate(initialState.items);
initialState.subtotal = subtotal;
initialState.savings = savings;

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Set entire cart (from server)
    setCart: (state, action: PayloadAction<any>) => {
      const cart = action.payload;

      if (cart.items && Array.isArray(cart.items)) {
        state.items = cart.items;
        state.id = cart.id;

        const { subtotal, savings } = recalculate(state.items);
        state.subtotal = subtotal;
        state.savings = savings;
        state.itemCount = state.items.length;

        // Clear guest cart from localStorage since we're now using server cart
        clearLocalStorage();
      }
    },

    // Sync guest cart with server (after login) - merges server cart with existing guest items
    syncCartWithServer: (state, action: PayloadAction<any>) => {
      const serverCart = action.payload;

      if (serverCart.items && Array.isArray(serverCart.items)) {
        // Merge: server items first, then add guest items that don't exist
        const mergedItems = [...serverCart.items];

        state.items.forEach((guestItem) => {
          const exists = mergedItems.find(
            (item) => item.variantId === guestItem.variantId,
          );
          if (!exists) {
            mergedItems.push(guestItem);
          }
        });

        state.items = mergedItems;
        state.id = serverCart.id;

        const { subtotal, savings } = recalculate(state.items);
        state.subtotal = subtotal;
        state.savings = savings;
        state.itemCount = state.items.length;
      }

      state.isSyncing = false;
      clearLocalStorage();
    },

    // Clear guest items after successful sync
    clearGuestItems: (state) => {
      state.isSyncing = false;
      clearLocalStorage();
    },

    // Add item to cart
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );

      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;
      state.itemCount = state.items.length;

      // Save to localStorage for guest users
      saveToLocalStorage({
        id: state.id,
        items: state.items,
        itemCount: state.itemCount,
      });
    },

    // Update item quantity
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );

      if (item) {
        item.quantity = action.payload.quantity;
      }

      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;

      saveToLocalStorage({
        id: state.id,
        items: state.items,
        itemCount: state.itemCount,
      });
    },

    // Remove item from cart
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);

      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;
      state.itemCount = state.items.length;

      saveToLocalStorage({
        id: state.id,
        items: state.items,
        itemCount: state.itemCount,
      });
    },

    // Clear entire cart
    clearCart: (state) => {
      state.id = null;
      state.items = [];
      state.itemCount = 0;
      state.subtotal = 0;
      state.savings = 0;
      state.isSyncing = false;
      clearLocalStorage();
    },

    // Sync state management
    startSync: (state) => {
      state.isSyncing = true;
    },

    syncError: (state) => {
      state.isSyncing = false;
    },
  },
});

// Export all actions
export const {
  setCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  syncCartWithServer,
  clearGuestItems, // ✅ Now exported
  startSync,
  syncError,
} = cartSlice.actions;

export default cartSlice.reducer;
