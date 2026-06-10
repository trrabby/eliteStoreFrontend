import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFlashSaleBySlug } from "@/services/flashSale.service";
import { FlashSalePageClient } from "./FlashSalePageClient";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getFlashSaleBySlug(slug);
  if (!res?.success) return { title: "Flash Sale" };
  return {
    title: `${res.data.title}`,
    description: `Limited time flash sale — huge discounts. Ends soon!`,
  };
}

export default async function FlashSalePage({ params }: Props) {
  const { slug } = await params;
  const res = await getFlashSaleBySlug(slug);
  if (!res?.success || !res.data) notFound();
  return <FlashSalePageClient sale={res.data} />;
}
