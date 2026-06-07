/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Send, Users, User, CheckCircle } from "lucide-react";
import { sendBulkNotification } from "@/services/notification.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

const NOTIF_TYPES = [
  { value: "ORDER_UPDATE", label: "Order Update" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "SYSTEM", label: "System" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
];

const TARGET_OPTS = [
  { value: "ALL", label: "All Users", icon: Users },
  { value: "CUSTOMER", label: "Customers", icon: User },
  { value: "VENDOR", label: "Vendors Only", icon: User },
];

export default function AdminNotificationsPage() {
  const [form, setForm] = useState({
    title: "",
    body: "",
    type: "ANNOUNCEMENT",
    target: "ALL",
    link: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required");
      return;
    }
    if (
      !confirm(
        `Send "${form.title}" to ${
          form.target === "ALL" ? "all users" : form.target.toLowerCase() + "s"
        }?`,
      )
    )
      return;

    setSending(true);
    const fd = new FormData();
    fd.append(
      "data",
      JSON.stringify({
        title: form.title,
        body: form.body,
        type: form.type,
        target: form.target,
        link: form.link || undefined,
      }),
    );
    const res = await sendBulkNotification(fd);
    if (res?.success) {
      toast.success("Notification sent!");
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setForm({
          title: "",
          body: "",
          type: "ANNOUNCEMENT",
          target: "ALL",
          link: "",
        });
      }, 3000);
    } else {
      toast.error((res as any)?.message ?? "Failed to send");
    }
    setSending(false);
  };

  const inputCls =
    "w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="font-display text-2xl font-bold text-gray-900">
        Notifications
      </h2>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-primary-pale flex items-center justify-center">
            <Bell size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Broadcast Notification
            </h3>
            <p className="text-xs text-gray-500">
              Send push notification to users
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <p className="font-semibold text-gray-900">Notification Sent!</p>
              <p className="text-sm text-gray-500">
                Your message has been delivered to users.
              </p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSend} className="space-y-4">
              {/* Target audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TARGET_OPTS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("target", opt.value)}
                      className={cn(
                        "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        form.target === opt.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-100 text-gray-600 hover:border-gray-200",
                      )}
                    >
                      <opt.icon size={15} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={inputCls}
                >
                  {NOTIF_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title *
                </label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Flash Sale starts now! 🔥"
                  className={inputCls}
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => set("body", e.target.value)}
                  rows={4}
                  placeholder="Write your notification message here..."
                  className={`${inputCls} resize-none`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {form.body.length}/500
                </p>
              </div>

              {/* Link (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Link{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  value={form.link}
                  onChange={(e) => set("link", e.target.value)}
                  placeholder="/products or https://..."
                  className={inputCls}
                />
              </div>

              {/* Preview */}
              {(form.title || form.body) && (
                <div className="bg-gray-900 rounded-2xl p-4 text-white">
                  <p className="text-xs text-gray-400 mb-2">Preview</p>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
                      <Bell size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {form.title || "Title"}
                      </p>
                      <p className="text-xs text-gray-300 mt-0.5 line-clamp-2">
                        {form.body || "Message"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                    className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : (
                  <Send size={16} />
                )}
                {sending ? "Sending..." : "Send Notification"}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
