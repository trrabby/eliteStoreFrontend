"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/shared/SectionHeader";

type Brand = {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
};

export function BrandSection({ brands }: { brands: Brand[] }) {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
    },
  };

  return (
    <section className="py-12 bg-gradient-pale">
      <div className="container-elite">
        <SectionHeader
          title="Top Brands"
          href="/products"
          linkLabel="All Brands"
          centered
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5
                     lg:grid-cols-6 xl:grid-cols-8 gap-4"
        >
          {brands.map((brand) => (
            <motion.div key={brand.id} variants={itemVariants}>
              <Link href={`/brand/${brand.slug}`}>
                <motion.div
                  whileHover={{
                    y: -4,
                    boxShadow: "0 8px 25px rgba(255,62,155,0.15)",
                    borderColor: "#FF3E9B",
                  }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-2xl p-3 flex items-center
                             justify-center aspect-square border-2
                             border-transparent transition-colors
                             cursor-pointer shadow-card group"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      width={80}
                      height={80}
                      className="object-contain w-full h-full
                                 group-hover:scale-110 transition-transform
                                 duration-300"
                    />
                  ) : (
                    <span
                      className="text-xs font-bold text-gray-500
                                     text-center group-hover:text-primary
                                     transition-colors"
                    >
                      {brand.name}
                    </span>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
