import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WishlistItem = {
  variantId: number;
  productId: number;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  image: string;
  stock: number;
  addedAt: number; // timestamp for sorting/filtering
};

type WishlistState = {
  items: WishlistItem[];
  totalItems: number;
  totalValue: number;
};

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
  totalValue: 0,
};

const recalculateWishlist = (items: WishlistItem[]) => {
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  return { totalItems, totalValue };
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      const { totalItems, totalValue } = recalculateWishlist(action.payload);
      state.totalItems = totalItems;
      state.totalValue = totalValue;
    },

    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const existing = state.items.find(
        (item) => item.variantId === action.payload.variantId,
      );

      if (!existing) {
        // Add timestamp if not provided
        const newItem = {
          ...action.payload,
          addedAt: action.payload.addedAt || Date.now(),
        };
        state.items.push(newItem);

        const { totalItems, totalValue } = recalculateWishlist(state.items);
        state.totalItems = totalItems;
        state.totalValue = totalValue;
      }
    },

    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(
        (item) => item.variantId !== action.payload,
      );

      const { totalItems, totalValue } = recalculateWishlist(state.items);
      state.totalItems = totalItems;
      state.totalValue = totalValue;
    },

    removeMultipleFromWishlist: (state, action: PayloadAction<number[]>) => {
      const variantIdsToRemove = new Set(action.payload);
      state.items = state.items.filter(
        (item) => !variantIdsToRemove.has(item.variantId),
      );

      const { totalItems, totalValue } = recalculateWishlist(state.items);
      state.totalItems = totalItems;
      state.totalValue = totalValue;
    },

    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalValue = 0;
    },

    moveToCart: (
      state,
      action: PayloadAction<{ variantId: number; quantity?: number }>,
    ) => {
      // This just removes from wishlist, the cart action should be dispatched separately
      state.items = state.items.filter(
        (item) => item.variantId !== action.payload.variantId,
      );

      const { totalItems, totalValue } = recalculateWishlist(state.items);
      state.totalItems = totalItems;
      state.totalValue = totalValue;
    },

    moveAllToCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalValue = 0;
    },
  },
});

// Actions
export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  removeMultipleFromWishlist,
  clearWishlist,
  moveToCart,
  moveAllToCart,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.items;

export const selectWishlistTotalItems = (state: { wishlist: WishlistState }) =>
  state.wishlist.totalItems;

export const selectWishlistTotalValue = (state: { wishlist: WishlistState }) =>
  state.wishlist.totalValue;

export const selectIsInWishlist = (
  state: { wishlist: WishlistState },
  variantId: number,
) => state.wishlist.items.some((item) => item.variantId === variantId);

export const selectWishlistItemByVariantId = (
  state: { wishlist: WishlistState },
  variantId: number,
) => state.wishlist.items.find((item) => item.variantId === variantId);
