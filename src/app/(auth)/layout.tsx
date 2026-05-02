import { Logo } from "@/components/shared/Logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-pale flex flex-col">
      {/* Auth header */}
      <header
        className="w-full px-6 py-4 flex items-center
                         justify-between"
      >
        <Link href="/">
          <Logo />
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Footer note */}
      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Elite Store. All rights reserved.
      </footer>
    </div>
  );
}
