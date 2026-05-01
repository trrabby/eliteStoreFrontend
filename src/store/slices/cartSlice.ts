import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  variantId: number;
  productId: number;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  comparePrice: number | null;
  image: string;
  quantity: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  subtotal: number;
  savings: number;
};

const initialState: CartState = {
  items: [],
  subtotal: 0,
  savings: 0,
};

const recalculate = (items: CartItem[]) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => {
    if (i.comparePrice && i.comparePrice > i.price) {
      return sum + (i.comparePrice - i.price) * i.quantity;
    }
    return sum;
  }, 0);
  return { subtotal, savings };
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      const { subtotal, savings } = recalculate(action.payload);
      state.subtotal = subtotal;
      state.savings = savings;
    },
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
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ variantId: number; quantity: number }>,
    ) => {
      const item = state.items.find(
        (i) => i.variantId === action.payload.variantId,
      );
      if (item) item.quantity = action.payload.quantity;
      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.savings = 0;
    },
  },
});

export const { setCart, addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;
