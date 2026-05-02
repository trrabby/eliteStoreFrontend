"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { SectionHeader } from "@/components/shared/SectionHeader";

type Category = {
  id: number;
  name: string;
  slug: string;
  image: string | null;
  icon: string | null;
};

export function CategoryScroll({ categories }: { categories: Category[] }) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="py-10 overflow-hidden">
      <div className="container-elite mb-4">
        <SectionHeader
          title="Shop by Category"
          href="/products"
          linkLabel="All Categories"
        />
      </div>

      <div ref={emblaRef} className="overflow-hidden">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex gap-4 pl-4 md:pl-[max(1rem,calc((100vw-80rem)/2))]
                     pr-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              variants={itemVariants}
              className="flex-[0_0_auto]"
            >
              <Link href={`/category/${cat.slug}`}>
                <motion.div
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-2 group w-20 md:w-24"
                >
                  {/* Circle image */}
                  <div
                    className="relative w-16 h-16 md:w-20 md:h-20
                                  rounded-full overflow-hidden bg-primary-pale
                                  ring-2 ring-transparent
                                  group-hover:ring-primary group-hover:ring-offset-2
                                  transition-all duration-300 shadow-card"
                  >
                    {cat.image ? (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-110
                                   transition-transform duration-500"
                        sizes="80px"
                      />
                    ) : (
                      <div
                        className="w-full h-full bg-gradient-pale
                                      flex items-center justify-center
                                      text-2xl"
                      >
                        {cat.icon ?? "🛍️"}
                      </div>
                    )}
                  </div>

                  <span
                    className="text-xs font-medium text-gray-700
                                   text-center leading-tight
                                   group-hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
