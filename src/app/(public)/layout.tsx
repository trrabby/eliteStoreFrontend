/* eslint-disable @typescript-eslint/no-explicit-any */
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { getCategoryTree } from "@/services/category.service";
import { CategoryBar } from "@/components/layout/CategoryBar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // fetch categories server-side — SSG, revalidate 10min
  const categoriesRes = await getCategoryTree();
  const allCategories = categoriesRes?.data;

  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <CategoryBar categories={allCategories} />
        <main className="flex-1 pb-16 lg:pb-0">{children}</main>
        <Footer />
        <MobileNav />
        <NotificationToast />
      </div>
    </SocketProvider>
  );
}
