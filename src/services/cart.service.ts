/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth } from "./helpers";

// get cart
export const getCart = async () => {
  try {
    return await fetchWithAuth("/cart");
  } catch (error: any) {
    return Error(error);
  }
};

// validate cart before checkout
export const validateCart = async () => {
  try {
    return await fetchWithAuth("/cart/validate");
  } catch (error: any) {
    return Error(error);
  }
};

// add item to cart
export const addToCart = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/cart/items", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update cart item quantity
export const updateCartItem = async (variantId: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/cart/items/${variantId}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// remove single item
export const removeCartItem = async (variantId: number) => {
  try {
    return await fetchWithAuth(`/cart/items/${variantId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// clear entire cart
export const clearCart = async () => {
  try {
    return await fetchWithAuth("/cart", { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
