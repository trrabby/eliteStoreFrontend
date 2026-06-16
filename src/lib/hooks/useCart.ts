"use client";

import { useDispatch, useSelector } from "react-redux";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { RootState } from "@/store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartAction,
  setItemsFromDB,
} from "@/store/slices/cartSlice";
import {
  addToCart as addToCartAPI,
  removeCartItem,
  updateCartItem,
  clearCart as clearCartAPI,
  getCart,
} from "@/services/cart.service";
import { toast } from "sonner";

export function useCart() {
  const dispatch = useDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { items, itemCount, isSyncing } = useSelector((s: RootState) => s.cart);

  /* ─── Fetch cart from DB and sync local state ─── */
  const fetchCart = async () => {
    if (!user) return;
    const res = await getCart();
    console.log(res);
    if (res?.success && Array.isArray(res.data?.items)) {
      dispatch(setItemsFromDB(res.data.items));
    }
  };

  /* ─── Add to cart ─── */
  const addToCart = async (
    variantId: number,
    productId: number,
    quantity = 1,
  ) => {
    // Always update Redux immediately (persisted for guest + auth)
    dispatch(addItem({ variantId, productId, quantity }));

    if (!user) return { success: true, guest: true };

    // Auth: sync to DB
    const fd = new FormData();
    fd.append("data", JSON.stringify({ variantId, productId, quantity }));
    const res = await addToCartAPI(fd);

    if (!res?.success) {
      // Rollback local if API failed
      dispatch(removeItem(variantId));
      toast.error(res?.message ?? "Failed to add to cart");
    }
    return res;
  };

  /* ─── Remove from cart ─── */
  const removeFromCart = async (variantId: number) => {
    dispatch(removeItem(variantId));
    if (!user) return;

    const res = await removeCartItem(variantId);
    if (!res?.success) {
      toast.error("Failed to remove item");
    }
  };

  /* ─── Update quantity ─── */
  const updateQty = async (variantId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(variantId);
      return;
    }

    dispatch(updateQuantity({ variantId, quantity }));
    if (!user) return;

    const fd = new FormData();
    fd.append("data", JSON.stringify({ quantity }));
    const res = await updateCartItem(variantId, fd);

    if (!res?.success) {
      toast.error("Failed to update quantity");
    }
  };

  /* ─── Clear cart ─── */
  const clearCart = async () => {
    dispatch(clearCartAction());
    if (!user) return;
    await clearCartAPI();
  };

  return {
    items,
    itemCount,
    isSyncing,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };
}
