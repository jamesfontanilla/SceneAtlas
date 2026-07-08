import type { MovieBrief, MovieDetail } from "@sceneatlas/shared";

export interface MovieSourceProvider {
  search(query: string): Promise<MovieBrief[]>;
  findBySlug(slug: string): Promise<MovieDetail | null>;
}
