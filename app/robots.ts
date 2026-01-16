import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/admin", "/auth", "/unauthorized"] },
    ],
    sitemap: "https://realestate.inmedina.com/sitemap.xml",
  };
}
