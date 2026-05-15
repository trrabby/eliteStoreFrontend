import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Hind_Siliguri } from "next/font/google";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { FlyToCartProvider } from "@/components/shared/FlyToCart";
import { Toaster } from "sonner";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Elite Store", template: "%s | Elite Store" },
  description:
    "Feel the elegance — Bangladesh's premium online shopping destination",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://elitestore.com.bd",
    siteName: "Elite Store",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${hindSiliguri.variable}`}
    >
      <body className="font-body bg-white text-gray-900 antialiased">
        <ReduxProvider>
          <FlyToCartProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "#fff",
                  border: "1px solid #FFEDFA",
                  borderRadius: "14px",
                  color: "#171717",
                },
              }}
            />
          </FlyToCartProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
