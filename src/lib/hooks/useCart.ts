"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartState,
} from "@/store/slices/cartSlice";
import {
  addToCart as addToCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
  clearCart as clearCartService,
} from "@/services/cart.service";
import { toast } from "sonner";

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((s: RootState) => s.cart);

  // optimistic add to cart
  const addToCart = async (payload: {
    productId: number;
    variantId: number;
    quantity: number;
    productName: string;
    variantName: string;
    sku: string;
    price: number;
    comparePrice: number | null;
    image: string;
    stock: number;
  }) => {
    // optimistic update
    dispatch(
      addItem({
        variantId: payload.variantId,
        productId: payload.productId,
        productName: payload.productName,
        variantName: payload.variantName,
        sku: payload.sku,
        price: payload.price,
        comparePrice: payload.comparePrice,
        image: payload.image,
        quantity: payload.quantity,
        stock: payload.stock,
      }),
    );

    // formdata for backend
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity,
      }),
    );

    const result = await addToCartService(formData);

    if (!result?.success) {
      // rollback
      dispatch(removeItem(payload.variantId));
      toast.error(result?.message ?? "Failed to add to cart");
      return false;
    }

    return true;
  };

  const removeFromCart = async (variantId: number) => {
    dispatch(removeItem(variantId));
    const result = await removeCartItemService(variantId);
    if (!result?.success) {
      toast.error("Failed to remove item");
    }
  };

  const updateQty = async (variantId: number, quantity: number) => {
    dispatch(updateQuantity({ variantId, quantity }));
    const formData = new FormData();
    formData.append("data", JSON.stringify({ quantity }));
    const result = await updateCartItemService(variantId, formData);
    if (!result?.success) {
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    dispatch(clearCartState());
    await clearCartService();
  };

  return {
    items: cart.items,
    subtotal: cart.subtotal,
    savings: cart.savings,
    itemCount: cart.items.reduce((s, i) => s + i.quantity, 0),
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
  };
};
