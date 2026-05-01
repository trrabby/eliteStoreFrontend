/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { fetchWithAuth, fetchPublic, buildQuery } from "./helpers";

// get product reviews — public, SSR
export const getProductReviews = async (
  productId: number,
  params: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: string;
  },
) => {
  try {
    return await fetchPublic(
      `/reviews/product/${productId}${buildQuery(params)}`,
      {},
      0, // no cache — reviews update in real-time
    );
  } catch (error: any) {
    return Error(error);
  }
};

// get single review — public
export const getReviewById = async (id: number) => {
  try {
    return await fetchPublic(`/reviews/${id}`, {}, 0);
  } catch (error: any) {
    return Error(error);
  }
};

// my reviews — customer
export const getMyReviews = async (params: {
  page?: number;
  limit?: number;
}) => {
  try {
    return await fetchWithAuth(`/reviews/my/reviews${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

// create review — customer (verified purchase)
export const createReview = async (formData: FormData) => {
  try {
    return await fetchWithAuth("/reviews", {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// update review
export const updateReview = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/reviews/${id}`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// delete review
export const deleteReview = async (id: number) => {
  try {
    return await fetchWithAuth(`/reviews/${id}`, { method: "DELETE" });
  } catch (error: any) {
    return Error(error);
  }
};

// vote on review — helpful/not
export const voteReview = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/reviews/${id}/vote`, {
      method: "POST",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};

// ─── Admin ────────────────────────────────

export const getReviewStats = async () => {
  try {
    return await fetchWithAuth("/reviews/stats/overview");
  } catch (error: any) {
    return Error(error);
  }
};

export const getAllReviews = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  productId?: number;
  rating?: number;
  search?: string;
}) => {
  try {
    return await fetchWithAuth(`/reviews${buildQuery(params)}`);
  } catch (error: any) {
    return Error(error);
  }
};

export const moderateReview = async (id: number, formData: FormData) => {
  try {
    return await fetchWithAuth(`/reviews/${id}/moderate`, {
      method: "PATCH",
      headers: {},
      body: formData,
    });
  } catch (error: any) {
    return Error(error);
  }
};
