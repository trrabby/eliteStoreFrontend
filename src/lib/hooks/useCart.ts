"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  addItem,
  removeItem,
  updateQuantity,
  clearCart as clearCartState,
  setCart,
  syncCartWithServer,
  startSync,
  syncError,
} from "@/store/slices/cartSlice";
import {
  addToCart as addToCartService,
  removeCartItem as removeCartItemService,
  updateCartItem as updateCartItemService,
  getCart as getCartService,
  clearCart as clearCartService,
} from "@/services/cart.service";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { toast } from "sonner";

// Helper to convert price to number
const toNumber = (price: string | number): number => {
  return typeof price === "string" ? parseFloat(price) : price;
};

export const useCart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((s: RootState) => s.cart);
  const user = useSelector(selectCurrentUser);
  const isLoggedIn = !!user;

  // Fetch cart from server (logged in users only)
  const fetchCart = async () => {
    if (!isLoggedIn) return null;

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

  // Sync guest cart with server when user logs in
  const syncGuestCart = async () => {
    if (!isLoggedIn) return;

    // If no items in guest cart, just fetch server cart
    if (cart.items.length === 0) {
      await fetchCart();
      return;
    }

    dispatch(startSync());

    try {
      // Add each guest item to server cart one by one
      let allSuccess = true;

      for (const guestItem of cart.items) {
        const formData = new FormData();
        formData.append(
          "data",
          JSON.stringify({
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          }),
        );

        const result = await addToCartService(formData);

        if (!result?.success) {
          console.error(
            `Failed to add item ${guestItem.variantId}:`,
            result?.message,
          );
          allSuccess = false;
        }
      }

      if (allSuccess) {
        // Fetch fresh cart from server
        const cartResult = await getCartService();
        if (cartResult?.success && cartResult.data) {
          dispatch(syncCartWithServer(cartResult.data));
          toast.success("Cart synced successfully!");
        }
      } else {
        dispatch(syncError());
        toast.warning("Some items couldn't be synced. Please check your cart.");
      }
    } catch (error) {
      console.error("Cart sync error:", error);
      dispatch(syncError());
      toast.error("Failed to sync cart");
    }
  };

  // Add to cart (handles both guest and logged in)
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
    // Create cart item
    const newCartItem = {
      id: Date.now(),
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

    // If guest user, we're done
    if (!isLoggedIn) {
      toast.success("Added to cart");
      return true;
    }

    // Logged in user - call API
    try {
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

      // Refresh cart from server
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
    const removedItem = cart.items.find((item) => item.variantId === variantId);

    // Optimistic update
    dispatch(removeItem(variantId));

    if (!isLoggedIn) {
      toast.success("Item removed");
      return true;
    }

    try {
      const result = await removeCartItemService(variantId);

      if (!result?.success) {
        if (removedItem) {
          dispatch(addItem(removedItem));
        }
        toast.error(result?.message ?? "Failed to remove item");
        return false;
      }

      await fetchCart();
      toast.success("Item removed");
      return true;
    } catch (error) {
      if (removedItem) {
        dispatch(addItem(removedItem));
      }
      toast.error("Failed to remove item");
      return false;
    }
  };

  // Update item quantity
  const updateQty = async (variantId: number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(variantId);
      return;
    }

    const oldItem = cart.items.find((item) => item.variantId === variantId);
    const oldQuantity = oldItem?.quantity || 1;

    // Optimistic update
    dispatch(updateQuantity({ variantId, quantity }));

    if (!isLoggedIn) {
      return true;
    }

    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify({ quantity }));
      const result = await updateCartItemService(variantId, formData);

      if (!result?.success) {
        dispatch(updateQuantity({ variantId, quantity: oldQuantity }));
        toast.error(result?.message ?? "Failed to update quantity");
        return false;
      }

      await fetchCart();
      return true;
    } catch (error) {
      dispatch(updateQuantity({ variantId, quantity: oldQuantity }));
      toast.error("Failed to update quantity");
      return false;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    const currentCart = { ...cart };

    // Optimistic update
    dispatch(clearCartState());

    if (!isLoggedIn) {
      toast.success("Cart cleared");
      return true;
    }

    try {
      const result = await clearCartService();

      if (!result?.success) {
        dispatch(setCart(currentCart));
        toast.error(result?.message ?? "Failed to clear cart");
        return false;
      }

      toast.success("Cart cleared");
      return true;
    } catch (error) {
      dispatch(setCart(currentCart));
      toast.error("Failed to clear cart");
      return false;
    }
  };

  // Get item price helper
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
    isSyncing: cart.isSyncing,
    isLoggedIn,

    // Helpers
    getItemPrice,
    getItemComparePrice,

    // Actions
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    fetchCart,
    syncGuestCart,
  };
};
