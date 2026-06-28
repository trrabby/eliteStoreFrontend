import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./SearchPageClient";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string }>; // 👈 note: it's a Promise
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `"${q}" — Search | Elite Store` : "Search | Elite Store",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;

  return (
    <Suspense>
      <SearchPageClient query={q} />
    </Suspense>
  );
}
