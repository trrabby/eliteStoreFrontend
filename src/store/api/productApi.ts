/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("authorization", token);
      return headers;
    },
  }),
  tagTypes: ["Product", "Category", "Brand"],
  endpoints: (builder) => ({
    getProducts: builder.query<any, Record<string, any>>({
      query: (params) => ({ url: "products", params }),
      providesTags: ["Product"],
    }),
    getProductBySlug: builder.query<any, string>({
      query: (slug) => `products/slug/${slug}`,
      providesTags: ["Product"],
    }),
    getCategoryTree: builder.query<any, void>({
      query: () => "categories/tree",
      providesTags: ["Category"],
    }),
    getFeaturedBrands: builder.query<any, void>({
      query: () => "brands/featured",
      providesTags: ["Brand"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductBySlugQuery,
  useGetCategoryTreeQuery,
  useGetFeaturedBrandsQuery,
} = productApi;
