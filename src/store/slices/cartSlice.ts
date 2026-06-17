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

    /* sync itmes with db and local storage */
    setItemsFromDB: (
      state,
      action: PayloadAction<
        { variantId: number; productId: number; quantity: number }[]
      >,
    ) => {
      // Merge incoming items with existing items
      const incoming = action.payload;
      // Create a map of existing items by variantId
      const existingMap = new Map<number, CartMinimalItem>();
      for (const item of state.items) {
        existingMap.set(item.variantId, item);
      }
      for (const item of incoming) {
        const existing = existingMap.get(item.variantId);
        if (existing) {
          // Sum quantities
          existing.quantity += item.quantity;
        } else {
          // Add new item
          const newItem: CartMinimalItem = {
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
          };
          existingMap.set(item.variantId, newItem);
        }
      }
      // Convert map back to array
      state.items = Array.from(existingMap.values());
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
