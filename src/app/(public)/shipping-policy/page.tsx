import type { Metadata } from "next";
import { Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping Policy | Elite Store",
  description: "Elite Store shipping and delivery policy — ডেলিভারি নীতি।",
};

const DELIVERY_ZONES = [
  {
    zone: "ঢাকা মেট্রো",
    en: "Dhaka Metro",
    time: "১-২ দিন / 1-2 Days",
    fee: "৳60",
  },
  {
    zone: "ঢাকার আশপাশ",
    en: "Dhaka Suburbs",
    time: "২-৩ দিন / 2-3 Days",
    fee: "৳80",
  },
  {
    zone: "চট্টগ্রাম, সিলেট",
    en: "Chittagong, Sylhet",
    time: "২-৩ দিন / 2-3 Days",
    fee: "৳100",
  },
  {
    zone: "সারা বাংলাদেশ",
    en: "Rest of Bangladesh",
    time: "৩-৫ দিন / 3-5 Days",
    fee: "৳120",
  },
];

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container-elite max-w-3xl mx-auto">
        <div className="card p-8 mb-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-pale flex items-center justify-center mx-auto mb-4">
            <Truck size={24} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            Shipping Policy
          </h1>
          <p className="text-gray-500 font-hind text-lg">
            ডেলিভারি ও শিপিং নীতিমালা
          </p>
          <p className="text-xs text-gray-400 mt-2">
            সর্বশেষ আপডেট: জানুয়ারি ২০২৫
          </p>
        </div>

        <div className="card p-8 space-y-8 font-hind text-gray-700 leading-relaxed">
          {/* Free shipping notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 font-semibold">
              🎉 ১,০০০ টাকার উপরে অর্ডারে বিনামূল্যে ডেলিভারি!
            </p>
            <p className="text-green-600 text-sm mt-1">
              Free shipping on orders over ৳1,000
            </p>
          </div>

          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-4">
              ডেলিভারি এলাকা ও সময়
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["এলাকা / Zone", "ডেলিভারি সময়", "চার্জ"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 font-semibold text-gray-700 text-xs"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {DELIVERY_ZONES.map((z) => (
                    <tr key={z.zone} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{z.zone}</p>
                        <p className="text-xs text-gray-400">{z.en}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{z.time}</td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {z.fee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {[
            {
              title: "শিপমেন্ট প্রক্রিয়া",
              items: [
                "অর্ডার নিশ্চিত হওয়ার পর ১-২ কার্যদিবসের মধ্যে পণ্য প্রেরণ করা হয়।",
                "প্রেরণের পর SMS ও ইমেইলে ট্র্যাকিং নম্বর পাঠানো হবে।",
                "ওয়েবসাইটের 'অর্ডার ট্র্যাক করুন' পেজে ট্র্যাকিং করা যাবে।",
                "শুক্রবার ও সরকারি ছুটির দিনে ডেলিভারি হয় না।",
              ],
            },
            {
              title: "ডেলিভারি ব্যর্থ হলে",
              items: [
                "ডেলিভারিতে ব্যর্থ হলে পুনরায় ডেলিভারির চেষ্টা করা হবে।",
                "৩ বার চেষ্টার পরেও ডেলিভারি না হলে পণ্য ফেরত আসবে।",
                "পুনরায় ডেলিভারির জন্য অতিরিক্ত চার্জ প্রযোজ্য হতে পারে।",
                "সঠিক ঠিকানা ও ফোন নম্বর নিশ্চিত করুন।",
              ],
            },
          ].map(({ title, items }) => (
            <section key={title}>
              <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
                {title}
              </h2>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5 shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-3">
              কুরিয়ার পার্টনার
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Steadfast Courier",
                "Pathao Courier",
                "Sundarban Courier",
                "SA Paribahan",
                "Redx",
                "eCourier",
              ].map((c) => (
                <div
                  key={c}
                  className="bg-gray-50 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 text-center"
                >
                  {c}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gray-50 rounded-xl p-5">
            <p className="text-sm text-gray-500">
              ডেলিভারি সংক্রান্ত সমস্যায় যোগাযোগ করুন:{" "}
              <a
                href="tel:01700000000"
                className="text-primary hover:underline font-medium"
              >
                01700-000000
              </a>{" "}
              বা{" "}
              <a
                href="mailto:delivery@elitestore.com.bd"
                className="text-primary hover:underline font-medium"
              >
                delivery@elitestore.com.bd
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
