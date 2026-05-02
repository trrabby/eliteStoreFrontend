/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { TbBrandFacebook } from "react-icons/tb";
import { FiYoutube } from "react-icons/fi";
import { MapPin, Phone, Mail } from "lucide-react";

const FOOTER_LINKS = {
  "Quick Links": [
    { label: "About Us", href: "/about" },
    { label: "Contact Us", href: "/contact" },
    { label: "Track Order", href: "/track" },
    { label: "Become Seller", href: "/vendor" },
  ],
  Policies: [
    { label: "Return Policy", href: "/return-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Shipping Policy", href: "/shipping-policy" },
  ],
  "My Account": [
    { label: "My Profile", href: "/account" },
    { label: "My Orders", href: "/account/orders" },
    { label: "My Wishlist", href: "/account/wishlist" },
    { label: "My Wallet", href: "/account/wallet" },
  ],
};

const SOCIAL_LINKS = [
  { icon: TbBrandFacebook, href: "#", label: "Facebook" },
  { icon: FiYoutube, href: "#", label: "YouTube" },
];

const PAYMENT_METHODS = ["SSLCommerz", "bKash", "Nagad", "Cash on Delivery"];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      {/* Main footer */}
      <div className="container-elite py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Elite Store — Feel the elegance. Bangladesh's premium online
              shopping destination for fashion, beauty, and lifestyle.
            </p>
            {/* Contact */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin size={14} className="text-primary shrink-0" />
                Dhaka, Bangladesh
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone size={14} className="text-primary shrink-0" />
                +880 1700-000000
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail size={14} className="text-primary shrink-0" />
                support@elitestore.com.bd
              </div>
            </div>
            {/* Social */}
            <div className="flex gap-3 mt-6">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center
                             justify-center hover:bg-primary transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-sm">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-primary
                                 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="border-t border-gray-800">
        <div
          className="container-elite py-4 flex flex-col sm:flex-row
                        items-center justify-between gap-4"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Secure payments via:</span>
            {PAYMENT_METHODS.map((m) => (
              <span
                key={m}
                className="px-2 py-1 bg-gray-800 rounded text-gray-300 text-xs"
              >
                {m}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Elite Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
