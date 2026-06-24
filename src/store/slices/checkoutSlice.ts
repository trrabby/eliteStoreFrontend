import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

type PlacedOrder = {
  id: number;
  publicId: string;
  orderNumber: string;
};

type CheckoutState = {
  selectedAddressId: number | null;
  paymentMethod: string | null;
  couponCode: string | null;
  couponDiscount: number;
  couponId: number | null;
  notes: string;
  // Primary order (first vendor / backward compat)
  orderId: number | null;
  orderPublicId: string | null;
  orderNumber: string | null;
  // All vendor orders (multi-vendor support)
  orderIds: number[];
  orderPublicIds: string[];
  orderNumbers: string[];
};

const initialState: CheckoutState = {
  selectedAddressId: null,
  paymentMethod: null,
  couponCode: null,
  couponDiscount: 0,
  couponId: null,
  notes: "",
  orderId: null,
  orderPublicId: null,
  orderNumber: null,
  orderIds: [],
  orderPublicIds: [],
  orderNumbers: [],
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setAddress: (state, action: PayloadAction<number>) => {
      state.selectedAddressId = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<string>) => {
      state.paymentMethod = action.payload;
    },
    applyCouponSuccess: (
      state,
      action: PayloadAction<{
        code: string;
        discount: number;
        couponId?: number;
      }>,
    ) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
      state.couponId = action.payload.couponId ?? null;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.couponDiscount = 0;
      state.couponId = null;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    /* ── Legacy single-order (kept for backward compat) ── */
    setPlacedOrder: (state, action: PayloadAction<PlacedOrder>) => {
      state.orderId = action.payload.id;
      state.orderPublicId = action.payload.publicId;
      state.orderNumber = action.payload.orderNumber;
      state.orderIds = [action.payload.id];
      state.orderPublicIds = [action.payload.publicId];
      state.orderNumbers = [action.payload.orderNumber];
    },

    /* ── Multi-vendor orders ── */
    setPlacedOrders: (
      state,
      action: PayloadAction<{ orders: PlacedOrder[] }>,
    ) => {
      const { orders } = action.payload;
      state.orderIds = orders.map((o) => o.id);
      state.orderPublicIds = orders.map((o) => o.publicId);
      state.orderNumbers = orders.map((o) => o.orderNumber);
      // Primary = first order
      if (orders.length > 0) {
        state.orderId = orders[0].id;
        state.orderPublicId = orders[0].publicId;
        state.orderNumber = orders[0].orderNumber;
      }
    },

    resetCheckout: () => initialState,
  },
});

export const {
  setAddress,
  setPaymentMethod,
  applyCouponSuccess,
  removeCoupon,
  setNotes,
  setPlacedOrder,
  setPlacedOrders,
  resetCheckout,
} = checkoutSlice.actions;

export const selectCheckout = (state: RootState) => state.checkout;
