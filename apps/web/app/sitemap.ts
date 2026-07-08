import type { MetadataRoute } from "next";

const routes = [
  "/",
  "/search",
  "/watchlist",
  "/collections",
  "/billing",
  "/settings",
  "/movies/interstellar",
  "/movies/arrival",
  "/movies/blade-runner-2049",
  "/movies/dune"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString()
  }));
}
