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

type CartItem = {
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
};

const initialState: CartState = {
  id: null,
  itemCount: 0,
  items: [],
  subtotal: 0,
  savings: 0,
};

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

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<any>) => {
      const cart = action.payload;

      state.id = cart.id;
      state.itemCount = cart.itemCount;
      state.items = cart.items;

      const { subtotal, savings } = recalculate(cart.items);
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
      state.itemCount = state.items.length;
    },

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
    },

    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((i) => i.variantId !== action.payload);

      const { subtotal, savings } = recalculate(state.items);
      state.subtotal = subtotal;
      state.savings = savings;
      state.itemCount = state.items.length;
    },

    clearCart: (state) => {
      state.id = null;
      state.items = [];
      state.itemCount = 0;
      state.subtotal = 0;
      state.savings = 0;
    },
  },
});

export const { setCart, addItem, updateQuantity, removeItem, clearCart } =
  cartSlice.actions;
