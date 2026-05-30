"use client";

import { useDispatch, useSelector } from "react-redux";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartRedux,
  setCart,
  CartItem,
} from "@/store/slices/cartSlice";
import {
  addToCart as addToCartAPI,
  removeCartItem,
  updateCartItem,
  clearCart as clearCartAPI,
  getCart,
} from "@/services/cart.service";

export function useCart() {
  const dispatch = useDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { items, subtotal, savings, itemCount, id } = useSelector(
    (s: RootState) => s.cart,
  );

  /* ── Fetch from server ── */
  const fetchCart = async () => {
    if (!user) return;
    const res = await getCart();
    if (res?.success && res.data) dispatch(setCart(res.data));
  };

  /* ── Add ── */
  const addToCart = async (
    variantId: number,
    quantity: number = 1,
    itemData?: {
      productId: number;
      product: CartItem["product"];
      variant: CartItem["variant"];
    },
  ) => {
    console.log(quantity);
    if (!user) {
      // ── Guest: local only (persisted by cartSlice to localStorage) ──
      if (!itemData)
        return { success: false, message: "Item data required for guest cart" };
      dispatch(
        addItem({
          id: Date.now(), // temp id
          cartId: 0, // 0 = guest marker
          productId: itemData.productId,
          variantId,
          quantity,
          addedAt: new Date().toISOString(),
          product: itemData.product,
          variant: itemData.variant,
        }),
      );
      return { success: true, guest: true };
    }

    // ── Authenticated: API call ──
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        productId: itemData?.productId,
        variantId,
        quantity,
      }),
    );
    const res = await addToCartAPI(fd);
    if (res?.success && res.data)
      dispatch(
        addItem({
          id: res.data.id,
          cartId: res.data.cartId,
          productId: res.data.productId,
          variantId: res.data.variantId,
          quantity: res.data.quantity,
          addedAt: res.data.addedAt,
          product: res.data.product,
          variant: res.data.variant,
        }),
      );
    console.log(res);
    return res;
  };

  /* ── Remove ── */
  const removeFromCart = async (variantId: number) => {
    // Optimistic local update first
    dispatch(removeItem(variantId));
    if (!user) return;
    await removeCartItem(variantId);
  };

  /* ── Update qty ── */
  const updateQty = async (variantId: number, quantity: number) => {
    dispatch(updateQuantity({ variantId, quantity }));
    if (!user) return;
    const fd = new FormData();
    fd.append("data", JSON.stringify({ quantity }));
    await updateCartItem(variantId, fd);
  };

  /* ── Clear ── */
  const clearCart = async () => {
    dispatch(clearCartRedux());
    if (!user) return;
    await clearCartAPI();
  };

  return {
    items,
    subtotal,
    savings,
    itemCount,
    cartId: id,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };
}
