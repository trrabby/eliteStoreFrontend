/* eslint-disable @typescript-eslint/no-explicit-any */
import { configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "./storage";

// Slices
import { authSlice } from "./slices/authSlice";
import { cartSlice } from "./slices/cartSlice";
import { wishlistSlice } from "./slices/wishlistSlice";
import { notificationSlice } from "./slices/notificationSlice";
import { uiSlice } from "./slices/uiSlice";

// Persist configs
const authPersistConfig = {
  key: "auth",
  storage,
};

const cartPersistConfig = {
  key: "cart",
  storage,
  whitelist: ["items"],
};

const wishlistPersistConfig = {
  key: "wishlist",
  storage,
  whitelist: ["items"],
};

const persistedAuth = persistReducer(authPersistConfig, authSlice.reducer);
const persistedCart = persistReducer(cartPersistConfig, cartSlice.reducer);
const persistedWishlist = persistReducer(
  wishlistPersistConfig,
  wishlistSlice.reducer,
);

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: persistedAuth,
      cart: persistedCart,
      wishlist: persistedWishlist,
      notification: notificationSlice.reducer,
      ui: uiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [
            FLUSH,
            REHYDRATE,
            PAUSE,
            PERSIST,
            PURGE,
            REGISTER,
            "notification/pushNotification",
          ],
        },
      }),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// Create and export persistor
export const store = makeStore();
export const persistor = persistStore(store);
