import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hind_Siliguri } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import "./globals.css";
import { getLocale, getMessages } from "next-intl/server";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: "Elite Store", template: "%s | Elite Store" },
  description:
    "Feel the elegance — Bangladesh's premium online shopping destination",
  keywords: ["online shopping", "Bangladesh", "fashion", "elite store"],
  authors: [{ name: "Elite Store" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elitestore.com.bd",
    siteName: "Elite Store",
    title: "Elite Store — Feel the elegance",
    description: "Bangladesh's premium online shopping destination",
  },
  twitter: {
    card: "summary_large_image",
    title: "Elite Store",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${dmSans.variable} ${hindSiliguri.variable}`}
    >
      <body className="font-body bg-white text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          <ReduxProvider>{children}</ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
