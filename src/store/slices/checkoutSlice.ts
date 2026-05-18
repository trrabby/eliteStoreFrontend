import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "..";

type CheckoutState = {
  selectedAddressId: number | null;
  paymentMethod: string | null;
  couponCode: string | null;
  couponDiscount: number;
  couponId: number | null;
  notes: string;
  orderId: number | null;
  orderPublicId: string | null;
  orderNumber: string | null;
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
        couponId: number;
      }>,
    ) => {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
      state.couponId = action.payload.couponId;
    },
    removeCoupon: (state) => {
      state.couponCode = null;
      state.couponDiscount = 0;
      state.couponId = null;
    },
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },
    setPlacedOrder: (
      state,
      action: PayloadAction<{
        orderId: number;
        orderPublicId: string;
        orderNumber: string;
      }>,
    ) => {
      state.orderId = action.payload.orderId;
      state.orderPublicId = action.payload.orderPublicId;
      state.orderNumber = action.payload.orderNumber;
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
  resetCheckout,
} = checkoutSlice.actions;

export const selectCheckout = (state: RootState) => state.checkout;
