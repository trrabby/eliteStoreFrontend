"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartState,
  setCart,
} from "@/store/slices/cartSlice";
import {
  addToCart as addToCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
  getCart as getCartService,
  clearCart as clearCartService,
} from "@/services/cart.service";
import { toast } from "sonner";

// Helper to convert price to number
const toNumber = (price: string | number): number => {
  return typeof price === "string" ? parseFloat(price) : price;
};

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((s: RootState) => s.cart);

  // Fetch cart from server
  const fetchCart = async () => {
    try {
      const response = await getCartService();
      if (response?.success && response.data) {
        dispatch(setCart(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      return null;
    }
  };

  // Optimistic add to cart
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
    // Create cart item matching your slice structure
    const newCartItem = {
      id: Date.now(), // temporary id, will be replaced when fetching from server
      cartId: cart.id ?? 0,
      productId: payload.productId,
      variantId: payload.variantId,
      quantity: payload.quantity,
      addedAt: new Date().toISOString(),
      product: {
        id: payload.productId,
        name: payload.productName,
        slug: "",
        status: "active",
        publicId: "",
        images: [{ url: payload.image, altText: payload.productName }],
      },
      variant: {
        id: payload.variantId,
        name: payload.variantName,
        sku: payload.sku,
        price: payload.price.toString(),
        comparePrice: payload.comparePrice?.toString() ?? null,
        stock: payload.stock,
        isActive: true,
      },
    };

    // Optimistic update
    dispatch(addItem(newCartItem));

    try {
      // Prepare data for backend
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
        // Rollback on failure
        dispatch(removeItem(payload.variantId));
        toast.error(result?.message ?? "Failed to add to cart");
        return false;
      }

      // Refresh cart from server to get correct IDs and data
      await fetchCart();
      toast.success("Added to cart");
      return true;
    } catch (error) {
      // Rollback on error
      dispatch(removeItem(payload.variantId));
      toast.error("Failed to add to cart");
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = async (variantId: number) => {
    // Store the removed item for potential rollback
    const removedItem = cart.items.find((item) => item.variantId === variantId);

    // Optimistic update
    dispatch(removeItem(variantId));

    try {
      const result = await removeCartItemService(variantId);

      if (!result?.success) {
        // Rollback on failure
        if (removedItem) {
          dispatch(addItem(removedItem));
        }
        toast.error(result?.message ?? "Failed to remove item");
        return false;
      }

      toast.success("Item removed from cart");
      return true;
    } catch (error) {
      // Rollback on error
      if (removedItem) {
        dispatch(addItem(removedItem));
      }
      toast.error("Failed to remove item");
      return false;
    }
  };

  // Update item quantity
  const updateQty = async (variantId: number, quantity: number) => {
    // Validate quantity
    if (quantity < 1) {
      await removeFromCart(variantId);
      return;
    }

    // Store old item for rollback
    const oldItem = cart.items.find((item) => item.variantId === variantId);
    const oldQuantity = oldItem?.quantity || 1;

    // Optimistic update
    dispatch(updateQuantity({ variantId, quantity }));

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ quantity }));
      const result = await updateCartItemService(variantId, formData);

      if (!result?.success) {
        // Rollback on failure
        dispatch(updateQuantity({ variantId, quantity: oldQuantity }));
        toast.error(result?.message ?? "Failed to update quantity");
        return false;
      }

      // Refresh cart to ensure consistency
      await fetchCart();
      return true;
    } catch (error) {
      // Rollback on error
      dispatch(updateQuantity({ variantId, quantity: oldQuantity }));
      toast.error("Failed to update quantity");
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    // Store current cart for rollback
    const currentCart = { ...cart };

    // Optimistic update
    dispatch(clearCartState());

    try {
      const result = await clearCartService();

      if (!result?.success) {
        // Rollback on failure
        dispatch(setCart(currentCart));
        toast.error(result?.message ?? "Failed to clear cart");
        return false;
      }

      toast.success("Cart cleared");
      return true;
    } catch (error) {
      // Rollback on error
      dispatch(setCart(currentCart));
      toast.error("Failed to clear cart");
      return false;
    }
  };

  // Sync cart with server (useful after login)
  const syncCart = async () => {
    try {
      const serverCart = await fetchCart();
      return serverCart;
    } catch (error) {
      console.error("Failed to sync cart:", error);
      return null;
    }
  };

  // Calculate item count (already in slice, but providing for convenience)
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  // Helper to get formatted price for display
  const getItemPrice = (item: (typeof cart.items)[0]) => {
    return toNumber(item.variant.price);
  };

  const getItemComparePrice = (item: (typeof cart.items)[0]) => {
    return item.variant.comparePrice
      ? toNumber(item.variant.comparePrice)
      : null;
  };

  return {
    // State
    id: cart.id,
    items: cart.items,
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    savings: cart.savings,

    // Helpers
    getItemPrice,
    getItemComparePrice,

    // Actions
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    fetchCart,
    syncCart,
  };
};
