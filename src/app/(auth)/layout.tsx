import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { Suspense } from "react";

// Decorative SVG blobs for background
function AuthBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Top-right blob */}
      <svg
        className="absolute -top-40 -right-40 w-125 h-125
                   opacity-30 animate-[float_8s_ease-in-out_infinite]"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FF3E9B"
          d="M45.3,-62.4C58.1,-54.7,67.8,-41.4,71.9,-26.5C76,-11.7,74.5,4.7,68.7,19.1C62.9,33.5,52.8,46,40.1,54.9C27.4,63.8,12.1,69.1,-2.8,72.7C-17.7,76.3,-35.3,78.3,-48.8,70.7C-62.2,63.1,-71.4,45.8,-74.6,28C-77.8,10.2,-75,-8.2,-67.4,-23.8C-59.8,-39.4,-47.5,-52.3,-34,-60.5C-20.5,-68.7,-5.8,-72.2,8.3,-72.5C22.4,-72.8,32.5,-70.1,45.3,-62.4Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Bottom-left blob */}
      <svg
        className="absolute -bottom-40 -left-40 w-100 h-100
                   opacity-20 animate-[float_10s_ease-in-out_infinite_reverse]"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FF88BA"
          d="M39.5,-54.1C52.3,-45.8,64.5,-36.1,69.1,-23.3C73.7,-10.5,70.7,5.4,64.7,19.2C58.7,33.1,49.8,44.9,38.3,53C26.7,61.2,12.5,65.7,-1.5,67.5C-15.5,69.4,-30.9,68.5,-43.1,61C-55.3,53.4,-64.3,39.1,-68.1,23.7C-71.9,8.3,-70.5,-8.2,-64.4,-22.5C-58.3,-36.8,-47.5,-48.9,-34.8,-57.3C-22.1,-65.7,-7.5,-70.3,5.2,-76.8C17.9,-83.3,26.8,-62.4,39.5,-54.1Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#FF3E9B 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
    </div>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-gradient-pale flex flex-col
                    relative overflow-hidden"
    >
      <AuthBackground />

      {/* Header */}
      <header className="w-full px-6 py-5 relative z-10">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>
      </header>

      {/* Content */}
      <main
        className="flex-1 flex items-center justify-center
                       px-4 py-8 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Suspense wraps useSearchParams in page components */}
          <Suspense>{children}</Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-5 text-xs text-gray-400">
        © {new Date().getFullYear()} Elite Store. All rights reserved.
      </footer>
    </div>
  );
}
