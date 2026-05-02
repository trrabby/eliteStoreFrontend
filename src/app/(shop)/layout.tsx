import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { Suspense } from "react";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header for checkout flow */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container-elite flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="pb-20 lg:pb-10">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  );
}
