import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={i} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast
                    ? "text-gray-900 font-medium truncate max-w-50"
                    : "text-gray-500",
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            )}
          </div>
        );
      })}
    </nav>
  );
}
