import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Elite Store",
  description: "Elite Store terms and conditions — ব্যবহারের শর্তাবলী।",
};

const SECTIONS = [
  {
    title: "১. সেবা গ্রহণের শর্ত",
    body: `এলিট স্টোর ব্যবহার করতে আপনাকে অবশ্যই:
- ন্যূনতম ১৮ বছর বয়স্ক হতে হবে
- সঠিক ও বৈধ তথ্য দিয়ে নিবন্ধন করতে হবে
- বাংলাদেশের প্রচলিত আইন মেনে চলতে হবে
- অন্যের অ্যাকাউন্ট ব্যবহার বা প্রতারণামূলক কার্যকলাপ থেকে বিরত থাকতে হবে`,
  },
  {
    title: "২. পণ্য ও মূল্য",
    body: `• পণ্যের মূল্য বিক্রেতা নির্ধারণ করেন এবং পরিবর্তনশীল
- মূল্য বাংলাদেশী টাকায় (BDT) প্রদর্শিত হয়
- মূল্যে VAT অন্তর্ভুক্ত থাকতে পারে
- স্টক শেষ হলে অর্ডার বাতিল হতে পারে`,
  },
  {
    title: "৩. অর্ডার ও পেমেন্ট",
    body: `• অর্ডার নিশ্চিত হওয়ার পর সংশোধন সীমিত
- পেমেন্ট ব্যর্থ হলে অর্ডার স্বয়ংক্রিয়ভাবে বাতিল হবে
- ক্যাশ অন ডেলিভারিতে পণ্য গ্রহণের সময় সম্পূর্ণ মূল্য পরিশোধ করতে হবে
- কুপন একবার ব্যবহারযোগ্য এবং হস্তান্তরযোগ্য নয়`,
  },
  {
    title: "৪. বিক্রেতাদের জন্য শর্তাবলী",
    body: `• বিক্রেতাদের সত্যিকারের ও মানসম্পন্ন পণ্য বিক্রি করতে হবে
- নকল বা কপিরাইট লঙ্ঘনকারী পণ্য বিক্রি নিষিদ্ধ
- প্ল্যাটফর্ম কমিশন ১০% (Pro ভেন্ডরের জন্য কম)
- নিয়ম লঙ্ঘনে অ্যাকাউন্ট স্থগিত বা বন্ধ করা হতে পারে`,
  },
  {
    title: "৫. দায়মুক্তি",
    body: `এলিট স্টোর নিম্নলিখিত বিষয়ে দায়ী নয়:
- তৃতীয় পক্ষের বিক্রেতার পণ্যের মান
- ব্যবহারকারীর নিজের অবহেলায় ঘটা ক্ষতি
- অপ্রত্যাশিত প্রযুক্তিগত ত্রুটির কারণে সেবা বিঘ্ন
- তৃতীয় পক্ষের লিংক বা সেবার মাধ্যমে ঘটা ক্ষতি`,
  },
  {
    title: "৬. আইনি এখতিয়ার",
    body: `এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত হয়। যেকোনো বিরোধ ঢাকার উপযুক্ত আদালতে নিষ্পত্তি করা হবে।`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-elite max-w-3xl mx-auto">
        <div className="card p-8 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 font-hind text-lg">ব্যবহারের শর্তাবলী</p>
          <p className="text-xs text-gray-400 mt-2">
            সর্বশেষ আপডেট: জানুয়ারি ২০২৫
          </p>
        </div>

        <div className="card p-8 space-y-8 font-hind text-gray-700 leading-relaxed">
          <p className="text-sm bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700">
            এলিট স্টোর ব্যবহার করার মাধ্যমে আপনি এই শর্তাবলী পড়েছেন, বুঝেছেন
            এবং মেনে নিয়েছেন বলে বিবেচিত হবেন।
          </p>

          {SECTIONS.map(({ title, body }) => (
            <section key={title}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
                {title}
              </h2>
              {body.split("\n").map((line, i) =>
                line.trim() ? (
                  <p
                    key={i}
                    className={`text-sm ${
                      line.startsWith("•") ? "ml-2 mt-1" : "mt-1"
                    }`}
                  >
                    {line.trim()}
                  </p>
                ) : null,
              )}
            </section>
          ))}

          <section className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              শর্তাবলী সংক্রান্ত প্রশ্নে:{" "}
              <a
                href="mailto:legal@elitestore.com.bd"
                className="text-primary hover:underline font-medium"
              >
                legal@elitestore.com.bd
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
