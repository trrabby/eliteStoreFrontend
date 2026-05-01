"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setLocale } from "@/store/slices/uiSlice";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useSelector((s: RootState) => s.ui.locale);

  const toggle = () => {
    const next = locale === "en" ? "bn" : "en";
    dispatch(setLocale(next));
    localStorage.setItem("locale", next);
    // router refresh for server components to pick up locale
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                 text-sm font-medium text-gray-600 hover:bg-primary-pale
                 hover:text-primary transition-all duration-200 border border-gray-200"
    >
      <span className="text-base">{locale === "en" ? "🇧🇩" : "🇬🇧"}</span>
      <span>{locale === "en" ? "বাংলা" : "English"}</span>
    </button>
  );
}
