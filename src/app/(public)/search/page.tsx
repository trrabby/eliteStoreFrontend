import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchPageClient } from "./SearchPageClient";

export const dynamic = "force-dynamic";

type Props = { searchParams: { q?: string } };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const q = searchParams.q ?? "";
  return {
    title: q ? `"${q}" — Search | Elite Store` : "Search | Elite Store",
  };
}

export default function SearchPage({ searchParams }: Props) {
  return (
    <Suspense>
      <SearchPageClient query={searchParams.q ?? ""} />
    </Suspense>
  );
}
