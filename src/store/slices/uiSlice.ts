import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  locale: "en" | "bn";
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isCartOpen: boolean;
};

const initialState: UIState = {
  locale: "en",
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isCartOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<"en" | "bn">) => {
      state.locale = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    toggleSearch: (state) => {
      state.isSearchOpen = !state.isSearchOpen;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    closeAll: (state) => {
      state.isMobileMenuOpen = false;
      state.isSearchOpen = false;
      state.isCartOpen = false;
    },
  },
});

export const {
  setLocale,
  toggleMobileMenu,
  toggleSearch,
  toggleCart,
  closeAll,
} = uiSlice.actions;
