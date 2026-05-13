import { configureStore, combineReducers } from "@reduxjs/toolkit";

import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";

import storage from "./storage";

// reducers
import authReducer from "./slices/authSlice";
import { cartSlice } from "./slices/cartSlice";
import { wishlistSlice } from "./slices/wishlistSlice";
import { notificationSlice } from "./slices/notificationSlice";
import { uiSlice } from "./slices/uiSlice";

// ========================
// Persist Configs
// ========================

const authPersistConfig: PersistConfig<ReturnType<typeof authReducer>> = {
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

// ========================
// Persisted Reducers
// ========================

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const persistedCartReducer = persistReducer(
  cartPersistConfig,
  cartSlice.reducer,
);

const persistedWishlistReducer = persistReducer(
  wishlistPersistConfig,
  wishlistSlice.reducer,
);

// ========================
// Root Reducer
// ========================

const rootReducer = combineReducers({
  auth: persistedAuthReducer,
  cart: persistedCartReducer,
  wishlist: persistedWishlistReducer,
  notification: notificationSlice.reducer,
  ui: uiSlice.reducer,
});

// ========================
// Store
// ========================

export const store = configureStore({
  reducer: rootReducer,

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

export const persistor = persistStore(store);

// ========================
// Types
// ========================

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
