// app/sitemap.ts
import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-server";

function getBaseUrl() {
  const env = process.env.SITE_URL 
  
  if (!env) return "http://localhost:3000";

  const withProtocol = env;
  return withProtocol.replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBaseUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/properties",
    "/services",
    "/about-inmedina",
    "/contact",
    "/terms",
    "/privacy",
  ].map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: new Date(),
  }));

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error || !data?.length) return staticRoutes;

  const propertyRoutes: MetadataRoute.Sitemap = data
    .filter((p) => typeof p.slug === "string" && p.slug.length > 0)
    .map((p) => ({
      url: `${base}/properties/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    }));

  return [...staticRoutes, ...propertyRoutes];
}
