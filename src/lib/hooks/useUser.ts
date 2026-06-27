/* eslint-disable react-hooks/exhaustive-deps */
// hooks/useBrands.ts
import { getCurrentUser } from "@/services/auth.service";
import { RootState } from "@/store";
import { useAppSelector } from "@/store/hook";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

export const useUsers = () => {
  const [userAndNoAccesstoken, setUserAndNoAccesstoken] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const isCartOpen = useSelector((s: RootState) => s.ui.isCartOpen);
  // console.log(isCartOpen);

  useEffect(() => {
    const chkUserAndAccesstoken = async () => {
      const currentUserTokenDecoded = await getCurrentUser();
      // console.log(currentUserTokenDecoded);
      if (user && !currentUserTokenDecoded) {
        setUserAndNoAccesstoken(true);
      }
    };
    chkUserAndAccesstoken();
  }, [isCartOpen]);
  // console.log(userAndNoAccesstoken);
  return {
    userAndNoAccesstoken,
  };
};
