/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/hooks/useUserSync.ts
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { normalizeUser } from "@/lib/utils/normalizeUser";
import { getMyProfile } from "@/services/user.service";
import { getCart, addToCart } from "@/services/cart.service";
import { getWishlist } from "@/services/wishlist.service";
import { getMyNotifications } from "@/services/notification.service";
import { setNotifications } from "@/store/slices/notificationSlice";
import { setWishlist } from "@/store/slices/wishlistSlice";
import { clearCart, setItemsFromDB } from "@/store/slices/cartSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

export function useUserSync() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const localCartItems = useSelector((state: RootState) => state.cart.items);

  const syncUser = async (redirectTo?: string | null) => {
    try {
      // 1. Fetch user profile
      const profileResponse = await getMyProfile();
      if (!profileResponse?.success) {
        toast.error("Failed to retrieve user profile");
        return false;
      }

      const reduxUser = normalizeUser(profileResponse as any);
      dispatch(setUser({ user: reduxUser }));

      const toastId = toast.loading("Syncing your cart...");
      // 2. Sync local cart items to database (if any)
      if (localCartItems.length > 0) {
        const syncPromises = localCartItems.map((item) => {
          const formData = new FormData();
          const payload = {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          };
          formData.append("data", JSON.stringify(payload));
          return addToCart(formData);
        });

        try {
          await Promise.all(syncPromises);
          dispatch(clearCart());
        } catch (syncError) {
          console.error("Error syncing cart:", syncError);
          toast.warning(
            "Cart sync had issues, but we'll fetch your latest cart.",
            { id: toastId },
          );
        }
      }

      // 3. Fetch updated cart from database
      const cart = await getCart();
      if (cart?.success && Array.isArray(cart.data?.items)) {
        dispatch(clearCart());
        dispatch(setItemsFromDB(cart.data.items));
        toast.success("Cart synced successfully", { id: toastId });
      } else {
        dispatch(clearCart());
      }

      // 4. Fetch wishlist and notifications
      const wishlist: any = await getWishlist();
      const notifications = await getMyNotifications({});

      dispatch(setNotifications(notifications.data));
      const productIds = (wishlist.data?.items ?? []).map(
        (item: any) => item.productId,
      );
      dispatch(setWishlist(productIds));

      toast.success(
        `Welcome back, ${reduxUser.accountInfo?.firstName || "User"}! 👋`,
        { id: toastId },
      );

      // 5. Redirect
      const redirectPath =
        redirectTo &&
        redirectTo.startsWith("/") &&
        redirectTo !== "/login" &&
        redirectTo !== "/register"
          ? redirectTo
          : "/";
      //   console.log(redirectPath);
      router.push(redirectPath);
      router.refresh();
      return true;
    } catch (error) {
      console.error("User sync error:", error);
      toast.error("Failed to sync your data");
      return false;
    }
  };

  return { syncUser };
}
