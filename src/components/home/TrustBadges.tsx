"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { Truck, RotateCcw, ShieldCheck, Clock } from "lucide-react";

const BADGES = [
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "On orders above ৳1000",
    color: "from-pink-50  to-pink-100",
    iconBg: "bg-primary",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    desc: "7-day return policy",
    color: "from-purple-50 to-purple-100",
    iconBg: "bg-purple-500",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "SSL + bKash + Nagad",
    color: "from-blue-50   to-blue-100",
    iconBg: "bg-blue-500",
  },
  {
    icon: Clock,
    title: "48hr Delivery",
    desc: "Inside Dhaka",
    color: "from-green-50  to-green-100",
    iconBg: "bg-green-500",
  },
];

export function TrustBadges() {
  return (
    <section className="container-elite py-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {BADGES.map((badge, i) => (
          <AnimatedSection key={badge.title} delay={i * 0.1}>
            <motion.div
              whileHover={{
                y: -4,
                boxShadow: "0 8px 30px rgba(255,62,155,0.12)",
              }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`bg-linear-to-br ${badge.color}
                         rounded-2xl p-4 flex items-center gap-3
                         border border-white/60 cursor-default`}
            >
              <div
                className={`w-11 h-11 rounded-xl ${badge.iconBg}
                               flex items-center justify-center
                               shrink-0 shadow-sm`}
              >
                <badge.icon size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {badge.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
              </div>
            </motion.div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
