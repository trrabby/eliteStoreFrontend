import type { Metadata } from "next";
import { RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Return Policy | Elite Store",
  description: "Elite Store return and refund policy — রিটার্ন ও রিফান্ড নীতি।",
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-elite max-w-3xl mx-auto">
        {/* Header */}
        <div className="card p-8 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-4">
            <RotateCcw size={24} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Return Policy
          </h1>
          <p className="text-gray-500 font-hind text-lg">
            রিটার্ন ও রিফান্ড নীতিমালা
          </p>
          <p className="text-xs text-gray-400 mt-2">
            সর্বশেষ আপডেট: জানুয়ারি ২০২৫
          </p>
        </div>

        <div className="card p-8 space-y-8 font-hind text-gray-700 leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
              ১. রিটার্নের শর্তাবলী
            </h2>
            <p className="mb-3">
              আমরা গ্রাহকদের সন্তুষ্টিকে সর্বোচ্চ অগ্রাধিকার দিই। পণ্য পাওয়ার
              পর যদি আপনি সন্তুষ্ট না হন, তাহলে নির্দিষ্ট শর্তে পণ্য ফেরত দিতে
              পারবেন।
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                পণ্য ডেলিভারি পাওয়ার <strong>৭ (সাত) দিনের</strong> মধ্যে
                রিটার্নের আবেদন করতে হবে।
              </li>
              <li>পণ্যটি অবশ্যই অব্যবহৃত এবং মূল প্যাকেজিং সহ থাকতে হবে।</li>
              <li>পণ্যের ট্যাগ, সিল বা লেবেল অক্ষুণ্ণ থাকতে হবে।</li>
              <li>
                ক্ষতিগ্রস্ত বা ভুল পণ্যের ক্ষেত্রে অবশ্যই ছবি বা ভিডিও প্রমাণ
                পাঠাতে হবে।
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
              ২. রিটার্নযোগ্য পণ্যের তালিকা
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="font-semibold text-green-700 mb-2">
                  ✅ রিটার্নযোগ্য
                </p>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• ত্রুটিপূর্ণ বা ক্ষতিগ্রস্ত পণ্য</li>
                  <li>• ভুল পণ্য ডেলিভারি</li>
                  <li>• বিবরণ অনুযায়ী নয় এমন পণ্য</li>
                  <li>• সাইজ বা কালার সমস্যা (পোশাক)</li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="font-semibold text-red-700 mb-2">
                  ❌ রিটার্নযোগ্য নয়
                </p>
                <ul className="text-sm text-red-600 space-y-1">
                  <li>• ব্যবহৃত বা ধোয়া পোশাক</li>
                  <li>• ডিজিটাল পণ্য বা সফটওয়্যার</li>
                  <li>• ব্যক্তিগত স্বাস্থ্য পণ্য</li>
                  <li>• অন্তর্বাস বা সুইমওয়্যার</li>
                  <li>• ফ্ল্যাশ সেলের পণ্য (শর্ত প্রযোজ্য)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
              ৩. রিটার্নের প্রক্রিয়া
            </h2>
            <div className="space-y-3">
              {[
                {
                  step: "১",
                  text: "আমার অ্যাকাউন্ট → অর্ডার সেকশনে যান এবং সংশ্লিষ্ট অর্ডারটি খুঁজুন।",
                },
                {
                  step: "২",
                  text: "'রিটার্ন রিকোয়েস্ট' বাটনে ক্লিক করুন এবং কারণ উল্লেখ করুন।",
                },
                {
                  step: "৩",
                  text: "প্রয়োজনে পণ্যের ছবি বা ভিডিও আপলোড করুন।",
                },
                {
                  step: "৪",
                  text: "আমাদের টিম ৪৮ ঘণ্টার মধ্যে আপনার অনুরোধ পর্যালোচনা করবে।",
                },
                {
                  step: "৫",
                  text: "অনুমোদন হলে আপনাকে পণ্য পাঠানোর নির্দেশনা দেওয়া হবে।",
                },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {step}
                  </div>
                  <p className="text-sm pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
              ৪. রিফান্ড নীতি
            </h2>
            <p className="mb-3 text-sm">
              রিটার্ন অনুমোদনের পর রিফান্ড নিম্নলিখিত পদ্ধতিতে প্রদান করা হবে:
            </p>
            <div className="bg-primary-pale rounded-xl p-4 space-y-2 text-sm">
              <p>
                • <strong>ওয়ালেট রিফান্ড:</strong> ১-৩ কার্যদিবসের মধ্যে
              </p>
              <p>
                • <strong>বিকাশ/নগদ রিফান্ড:</strong> ৩-৫ কার্যদিবসের মধ্যে
              </p>
              <p>
                • <strong>ব্যাংক ট্রান্সফার:</strong> ৫-৭ কার্যদিবসের মধ্যে
              </p>
              <p>
                • <strong>ক্যাশ অন ডেলিভারি:</strong> বিকাশ/নগদ বা ওয়ালেটে
                রিফান্ড
              </p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              রিটার্ন সংক্রান্ত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:{" "}
              <a
                href="mailto:support@elitestore.com.bd"
                className="text-primary hover:underline font-medium"
              >
                support@elitestore.com.bd
              </a>{" "}
              অথবা{" "}
              <a
                href="tel:01700000000"
                className="text-primary hover:underline font-medium"
              >
                01700-000000
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
