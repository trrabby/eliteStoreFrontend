import type { Metadata } from "next";
import Link from "next/link";
import {
  Store,
  DollarSign,
  Users,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  Package,
  Globe,
  Headphones,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Seller | Elite Store",
  description:
    "Start selling on Elite Store — Bangladesh's premier e-commerce platform.",
};

const BENEFITS = [
  {
    icon: Users,
    title: "Huge Customer Base",
    desc: "Access 10,000+ active buyers across Bangladesh.",
  },
  {
    icon: DollarSign,
    title: "Zero Setup Fee",
    desc: "Register for free. No hidden charges to get started.",
  },
  {
    icon: BarChart3,
    title: "Powerful Dashboard",
    desc: "Real-time sales analytics, inventory management and more.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    desc: "Get paid safely via bKash, Nagad, bank transfer or wallet.",
  },
  {
    icon: Globe,
    title: "Nationwide Reach",
    desc: "Sell to all 64 districts of Bangladesh from day one.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    desc: "Vendor support team available 6 days a week.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Register",
    desc: "Create your seller account — it's free and takes 2 minutes.",
    icon: Store,
  },
  {
    step: "02",
    title: "Set Up Store",
    desc: "Add your store name, logo, and product listings.",
    icon: Package,
  },
  {
    step: "03",
    title: "Start Selling",
    desc: "Go live and start receiving orders from customers nationwide.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Get Paid",
    desc: "Withdraw earnings anytime via bKash, Nagad or bank transfer.",
    icon: DollarSign,
  },
];

const PLANS = [
  {
    name: "Starter",
    nameBn: "স্টার্টার",
    price: "Free",
    features: [
      "Up to 50 products",
      "Basic analytics",
      "Standard support",
      "5% platform commission",
    ],
    cta: "Get Started",
    primary: false,
  },
  {
    name: "Pro Vendor",
    nameBn: "প্রো ভেন্ডর",
    price: "৳999/mo",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Priority support",
      "3% platform commission",
      "Featured store badge",
      "Flash sale access",
    ],
    cta: "Start Pro Trial",
    primary: true,
  },
];

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-4">
        <div className="container-elite max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/20 px-4 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            বিক্রেতা হন • Become a Seller
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Sell on Elite Store &<br />
            <span className="text-primary">Grow Your Business</span>
          </h1>
          <p className="text-gray-400 text-lg mb-4">
            Join 500+ verified vendors already selling to thousands of customers
            across Bangladesh.
          </p>
          <p className="text-gray-500 font-hind mb-8">
            বাংলাদেশ জুড়ে হাজার হাজার গ্রাহকের কাছে আপনার পণ্য বিক্রি করুন।
          </p>
          <Link
            href="/register?role=vendor"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-4 rounded-xl hover:brightness-110 transition-all text-base"
          >
            Start Selling Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-white">
        <div className="container-elite max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Why Sell on Elite Store?
            </h2>
            <p className="text-gray-500 font-hind">
              কেন এলিট স্টোরে বিক্রি করবেন?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="card p-5 hover:shadow-md transition-shadow"
              >
                <div className="w-11 h-11 rounded-2xl bg-primary-pale flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container-elite max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-gray-500 font-hind">মাত্র ৪টি ধাপে শুরু করুন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 bg-white border-2 border-primary rounded-full
                                   text-xs font-bold text-primary flex items-center justify-center"
                  >
                    {step}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4 bg-white">
        <div className="container-elite max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">
              Seller Plans
            </h2>
            <p className="text-gray-500 font-hind">
              আপনার ব্যবসার জন্য সঠিক প্ল্যানটি বেছে নিন।
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card p-6 ${
                  plan.primary
                    ? "border-2 border-primary shadow-pink relative"
                    : ""
                }`}
              >
                {plan.primary && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white
                                   text-xs font-bold px-4 py-1 rounded-full"
                  >
                    Most Popular
                  </span>
                )}
                <div className="mb-4">
                  <p className="font-semibold text-gray-500 text-xs font-hind">
                    {plan.nameBn}
                  </p>
                  <p className="font-display text-2xl font-bold text-gray-900">
                    {plan.name}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {plan.price}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle
                        size={14}
                        className="text-green-500 shrink-0"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register?role=vendor"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all
                              ${
                                plan.primary ? "btn-primary" : "btn-secondary"
                              }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-gradient-primary text-white text-center">
        <div className="container-elite max-w-xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-3">
            Ready to Start?
          </h2>
          <p className="text-white/80 mb-6 font-hind">
            আজই রেজিস্ট্রেশন করুন এবং আপনার ব্যবসা শুরু করুন।
          </p>
          <Link
            href="/register?role=vendor"
            className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all"
          >
            Create Seller Account <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
