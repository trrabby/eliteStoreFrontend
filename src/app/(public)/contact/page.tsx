/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Phone / হটলাইন",
    value: "01700-000000",
    sub: "শনি–বৃহস্পতিবার, সকাল ৯টা – রাত ৯টা",
    href: "tel:01700000000",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@elitestore.com.bd",
    sub: "We reply within 24 hours",
    href: "mailto:support@elitestore.com.bd",
  },
  {
    icon: MapPin,
    label: "Office / অফিস",
    value: "Dhaka, Bangladesh",
    sub: "বনানী, ঢাকা-১২১৩",
    href: null,
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "Sat – Thu",
    sub: "9:00 AM – 9:00 PM",
    href: null,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    // Simulate sending (replace with real API)
    await new Promise((r) => setTimeout(r, 1500));
    setSent(true);
    setSending(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-white py-16 px-4 text-center">
        <div className="container-elite max-w-2xl mx-auto">
          <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest">
            যোগাযোগ করুন • Contact Us
          </span>
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
            Get in Touch
          </h1>
          <p className="text-gray-500 font-hind">
            আমাদের সাথে যোগাযোগ করুন — আমরা সাহায্য করতে সদা প্রস্তুত।
          </p>
        </div>
      </section>

      <div className="container-elite py-12 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-5">
              Contact Information
            </h2>
            {CONTACT_INFO.map(({ icon: Icon, label, value, sub, href }) => (
              <div key={label} className="card p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-pale flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-semibold text-gray-900 hover:text-primary transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">
                      {value}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 font-hind">
                    {sub}
                  </p>
                </div>
              </div>
            ))}

            {/* Social */}
            <div className="card p-4">
              <p className="text-xs text-gray-400 mb-3">Social Media</p>
              <div className="flex gap-3">
                {[
                  {
                    label: "Facebook",
                    href: "https://facebook.com/elitestore.bd",
                  },
                  {
                    label: "Instagram",
                    href: "https://instagram.com/elitestore.bd",
                  },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary-pale flex items-center justify-center">
                  <MessageSquare size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Send us a Message
                  </h2>
                  <p className="text-xs text-gray-400">আমাদের বার্তা পাঠান</p>
                </div>
              </div>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-3 py-12 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle size={32} className="text-green-500" />
                  </div>
                  <p className="font-semibold text-gray-900">Message Sent!</p>
                  <p className="text-sm text-gray-500 font-hind">
                    আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                    <br />
                    We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: "",
                        email: "",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="text-sm text-primary hover:underline mt-2"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Name *
                      </label>
                      <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="Your full name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="your@email.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <input
                      value={form.subject}
                      onChange={(e) => set("subject", e.target.value)}
                      placeholder="What's this about?"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      rows={5}
                      placeholder="আপনার বার্তা লিখুন / Write your message..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={sending}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                    ) : (
                      <Send size={15} />
                    )}
                    {sending ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
