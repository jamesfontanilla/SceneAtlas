import type { MetadataRoute } from "next";
import { sceneAtlasMovies } from "@sceneatlas/shared";

const routes = [
  "/",
  "/search",
  "/watchlist",
  "/collections",
  "/billing",
  "/settings",
  ...sceneAtlasMovies.map((movie) => `/movies/${movie.slug}`)
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString()
  }));
}
