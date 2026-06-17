import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Elite Store",
  description: "Elite Store privacy policy — গোপনীয়তা নীতি।",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-elite max-w-3xl mx-auto">
        <div className="card p-8 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-hind text-lg">গোপনীয়তা নীতিমালা</p>
          <p className="text-xs text-gray-400 mt-2">
            সর্বশেষ আপডেট: জানুয়ারি ২০২৫
          </p>
        </div>

        <div className="card p-8 space-y-8 font-hind text-gray-700 leading-relaxed">
          {[
            {
              title: "১. তথ্য সংগ্রহ",
              content: `আমরা আপনার নিম্নলিখিত তথ্য সংগ্রহ করি:
              \n• নাম, ইমেইল, ফোন নম্বর এবং ডেলিভারি ঠিকানা
              \n• অর্ডার ইতিহাস এবং পেমেন্ট তথ্য (এনক্রিপ্টেড)
              \n• ব্রাউজিং আচরণ এবং পছন্দের তথ্য
              \n• ডিভাইস তথ্য এবং আইপি অ্যাড্রেস`,
            },
            {
              title: "২. তথ্য ব্যবহার",
              content: `সংগৃহীত তথ্য নিম্নলিখিত উদ্দেশ্যে ব্যবহার করা হয়:
              \n• অর্ডার প্রক্রিয়াকরণ এবং ডেলিভারি নিশ্চিতকরণ
              \n• গ্রাহক সেবা প্রদান
              \n• ব্যক্তিগতকৃত পণ্য সুপারিশ
              \n• প্রমোশনাল অফার এবং নিউজলেটার (আপনার সম্মতিতে)`,
            },
            {
              title: "৩. তথ্য সুরক্ষা",
              content: `আমরা আপনার তথ্য সুরক্ষায় সর্বোচ্চ ব্যবস্থা গ্রহণ করি:
              \n• SSL/TLS এনক্রিপশন ব্যবহার
              \n• নিয়মিত নিরাপত্তা অডিট
              \n• সীমিত অ্যাক্সেস নিয়ন্ত্রণ
              \n• তৃতীয় পক্ষের কাছে তথ্য বিক্রি করা হয় না`,
            },
            {
              title: "৪. কুকিজ নীতি",
              content: `আমাদের ওয়েবসাইট কুকিজ ব্যবহার করে যা:
              \n• আপনার লগইন সেশন বজায় রাখে
              \n• কার্টে পণ্য সংরক্ষণ করে
              \n• সাইট পারফরম্যান্স উন্নত করে
              \n\nআপনি যেকোনো সময় ব্রাউজার সেটিংস থেকে কুকিজ বন্ধ করতে পারেন।`,
            },
            {
              title: "৫. আপনার অধিকার",
              content: `আপনি নিম্নলিখিত অধিকার ভোগ করেন:
              \n• আপনার সংরক্ষিত তথ্য দেখার অধিকার
              \n• তথ্য সংশোধনের অধিকার
              \n• অ্যাকাউন্ট ও তথ্য মুছে ফেলার অধিকার
              \n• মার্কেটিং ইমেইল থেকে আনসাবস্ক্রাইব করার অধিকার`,
            },
          ].map(({ title, content }) => (
            <section key={title}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
                {title}
              </h2>
              {content.split("\n").map((line, i) =>
                line.trim() ? (
                  <p
                    key={i}
                    className={`text-sm ${line.startsWith("•") ? "ml-2" : ""}`}
                  >
                    {line.trim()}
                  </p>
                ) : (
                  <div key={i} className="h-1.5" />
                ),
              )}
            </section>
          ))}

          <section className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্নে:{" "}
              <a
                href="mailto:privacy@elitestore.com.bd"
                className="text-primary hover:underline font-medium"
              >
                privacy@elitestore.com.bd
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
