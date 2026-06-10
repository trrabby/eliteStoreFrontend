import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elitestore.com.bd";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/vendor/", "/account/", "/checkout/", "/api/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
