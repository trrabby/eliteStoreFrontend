import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WishlistState = {
  productIds: number[];
};

const initialState: WishlistState = {
  productIds: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action: PayloadAction<number[]>) => {
      state.productIds = action.payload;
    },
    addToWishlist: (state, action: PayloadAction<number>) => {
      if (!state.productIds.includes(action.payload)) {
        state.productIds.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<number>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
    toggleWishlistItem: (state, action: PayloadAction<number>) => {
      const idx = state.productIds.indexOf(action.payload);
      if (idx === -1) {
        state.productIds.push(action.payload);
      } else {
        state.productIds.splice(idx, 1);
      }
    },
    clearWishlist: (state) => {
      state.productIds = [];
    },
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlistItem,
  clearWishlist,
} = wishlistSlice.actions;
