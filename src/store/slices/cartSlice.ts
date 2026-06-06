import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartMinimalItem = {
  variantId: number;
  productId: number;
  quantity: number;
};

type CartState = {
  items: CartMinimalItem[];
  itemCount: number;
  isSyncing: boolean;
};

const initialState: CartState = {
  items: [],
  itemCount: 0,
  isSyncing: false,
};

const countItems = (items: CartMinimalItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* Add or increment */
    addItem: (state, action: PayloadAction<CartMinimalItem>) => {
      const existing = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.itemCount = countItems(state.items);
    },

    /* Remove by variantId */
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
      state.itemCount = countItems(state.items);
    },

    /* Update qty */
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );
      if (item) item.quantity = action.payload.quantity;
      state.itemCount = countItems(state.items);
    },

    /* Replace with DB state — called after login sync or manual refresh */
    setItemsFromDB: (
      state,
      action: PayloadAction<
        { variantId: number; productId: number; quantity: number }[]
      >,
    ) => {
      state.items = action.payload.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        quantity: i.quantity,
      }));
      state.itemCount = countItems(state.items);
      state.isSyncing = false;
    },

    /* Clear everything */
    clearCart: (state) => {
      state.items = [];
      state.itemCount = 0;
      state.isSyncing = false;
    },

    startSync: (state) => {
      state.isSyncing = true;
    },
    syncDone: (state) => {
      state.isSyncing = false;
    },
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  setItemsFromDB,
  clearCart,
  startSync,
  syncDone,
} = cartSlice.actions;

export default cartSlice.reducer;
