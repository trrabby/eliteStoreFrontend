/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { motion } from "framer-motion"; // used in client component below
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Truck,
  RefreshCw,
  Star,
  Users,
  Store,
  Award,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Elite Store",
  description:
    "Bangladesh's premier multi-vendor e-commerce platform. Feel the elegance.",
};

const STATS = [
  { value: "10,000+", label: "Happy Customers", icon: Users },
  { value: "500+", label: "Verified Vendors", icon: Store },
  { value: "50,000+", label: "Products Listed", icon: Award },
  { value: "4.8★", label: "Average Rating", icon: Star },
];

const VALUES = [
  {
    icon: Shield,
    title: "বিশ্বস্ততা / Trust",
    titleEn: "Trust & Security",
    desc: "আমরা আমাদের গ্রাহকদের নিরাপত্তা ও বিশ্বস্ততাকে সর্বোচ্চ অগ্রাধিকার দিই।",
    descEn:
      "We prioritize the safety and trust of our customers above everything else.",
  },
  {
    icon: Truck,
    title: "দ্রুত ডেলিভারি",
    titleEn: "Fast Delivery",
    desc: "ঢাকায় ১-২ দিন এবং সারা বাংলাদেশে ৩-৫ দিনের মধ্যে ডেলিভারি।",
    descEn:
      "1-2 days in Dhaka, 3-5 days nationwide delivery across Bangladesh.",
  },
  {
    icon: RefreshCw,
    title: "সহজ রিটার্ন",
    titleEn: "Easy Returns",
    desc: "পণ্য পেয়ে সন্তুষ্ট না হলে ৭ দিনের মধ্যে ফেরত দিন, কোনো প্রশ্ন নেই।",
    descEn: "Not satisfied? Return within 7 days, no questions asked.",
  },
  {
    icon: Heart,
    title: "গ্রাহক সেবা",
    titleEn: "Customer Care",
    desc: "আমাদের সাপোর্ট টিম সপ্তাহের ৭ দিন, ২৪ ঘণ্টা আপনার সেবায় নিয়োজিত।",
    descEn: "Our support team is available 7 days a week, 24 hours a day.",
  },
];

const TEAM = [
  { name: "Towfiq Ahmed", role: "Founder & CEO", initials: "TA" },
  { name: "Rafiul Islam", role: "Head of Operations", initials: "RI" },
  { name: "Sabrina Khatun", role: "Customer Experience", initials: "SK" },
  { name: "Masum Billah", role: "Tech Lead", initials: "MB" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-white to-primary/5 py-20 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="container-elite relative text-center max-w-3xl mx-auto">
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-4 py-1.5 rounded-full">
            আমাদের সম্পর্কে • About Us
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 mb-5">
            Feel the <span className="text-primary">Elegance</span>
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed mb-3">
            Elite Store is Bangladesh's premier multi-vendor e-commerce
            destination, connecting thousands of buyers with verified sellers
            across the country.
          </p>
          <p className="text-gray-500 font-hind leading-relaxed">
            এলিট স্টোর বাংলাদেশের একটি প্রিমিয়াম মাল্টি-ভেন্ডর ই-কমার্স
            প্ল্যাটফর্ম যেখানে হাজার হাজার ক্রেতা ও যাচাইকৃত বিক্রেতারা একত্রিত
            হন।
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container-elite grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-primary" />
              </div>
              <p className="font-display text-3xl font-bold text-gray-900">
                {value}
              </p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="container-elite max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We believe every Bangladeshi deserves access to quality products
                at fair prices, with a shopping experience that's elegant, safe,
                and enjoyable.
              </p>
              <p className="text-gray-500 font-hind leading-relaxed">
                আমরা বিশ্বাস করি প্রতিটি বাংলাদেশী ন্যায্য মূল্যে মানসম্পন্ন
                পণ্য পাওয়ার অধিকার রাখেন। আমাদের লক্ষ্য হল একটি নিরাপদ, মার্জিত
                এবং আনন্দদায়ক কেনাকাটার অভিজ্ঞতা প্রদান করা।
              </p>
              <Link
                href="/products"
                className="btn-primary inline-flex items-center gap-2 mt-6 px-6 py-3"
              >
                Shop Now
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {VALUES.map(({ icon: Icon, title, titleEn, desc, descEn }) => (
                <div key={title} className="card p-4">
                  <div className="w-9 h-9 rounded-xl bg-primary-pale flex items-center justify-center mb-3">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {titleEn}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 font-hind">
                    {title}
                  </p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed hidden sm:block">
                    {descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container-elite max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Our Team
            </h2>
            <p className="text-gray-500">আমাদের দলের পরিচয়</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="card p-5 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">
                  {member.initials}
                </div>
                <p className="font-semibold text-gray-900 text-sm">
                  {member.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-primary text-white text-center">
        <div className="container-elite max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-3">
            Join Elite Store Today
          </h2>
          <p className="text-white/80 mb-6 font-hind">
            আজই এলিট স্টোরে যোগ দিন এবং শ্রেষ্ঠ কেনাকাটার অভিজ্ঞতা নিন।
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white text-primary font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/become-seller"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              Become a Seller
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
