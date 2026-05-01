/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth } from "./helpers";

// get wishlist
export const getWishlist = async () => {
  try {
    return await fetchWithAuth("/wishlist");
  } catch (error: any) {
    return Error(error);
  }
};

// check if product is wishlisted
export const checkWishlisted = async (productId: number) => {
  try {
    return await fetchWithAuth(`/wishlist/check/${productId}`);
  } catch (error: any) {
    return Error(error);
  }
};

// add to wishlist
export const addToWishlist = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/wishlist", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// toggle wishlist — for heart button
export const toggleWishlist = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/wishlist/toggle", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// move to cart
export const moveToCart = async (productId: number) => {
  try {
    return await fetchWithAuth(`/wishlist/${productId}/move-to-cart`, {
      method: "POST",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// remove from wishlist
export const removeFromWishlist = async (productId: number) => {
  try {
    return await fetchWithAuth(`/wishlist/${productId}`, {
      method: "DELETE",
    });
  } catch (error: any) {
    return Error(error);
  }
};

// clear wishlist
export const clearWishlist = async () => {
  try {
    return await fetchWithAuth("/wishlist", { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};
