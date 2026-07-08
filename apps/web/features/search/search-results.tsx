import type { MovieBrief } from "@sceneatlas/shared";
import { MovieCard } from "@/components/ui/movie-card";
import { AdSlot } from "@/components/ui/ad-slot";
import { Badge } from "@/components/ui/badge";

interface SearchResultsProps {
  movies: MovieBrief[];
  query: string;
  adsEnabled: boolean;
}

export function SearchResults({ movies, query, adsEnabled }: SearchResultsProps) {
  return (
    <div className="search-layout">
      <div className="movie-grid">
        {movies.length ? (
          movies.map((movie) => <MovieCard movie={movie} key={movie.slug} />)
        ) : (
          <div className="panel search-empty">
            <Badge className="chip--accent">No matches</Badge>
            <h3>We could not find a title for "{query}".</h3>
            <p>Try a different title, or browse one of the featured research cuts from the homepage.</p>
          </div>
        )}
      </div>

      <div className="search-side">
        {adsEnabled ? (
          <AdSlot
            copy="Upgrade to the premium tier for ad-free research, exportable notes, and unlimited collections."
            cta="See premium"
            href="/billing"
            title="Research without interruptions"
          />
        ) : (
          <aside className="panel analysis-card">
            <h3 className="analysis-card__title">Premium workspace active</h3>
            <p className="analysis-card__body">No sponsored inventory appears in your research flow while premium is enabled.</p>
          </aside>
        )}

        <aside className="panel analysis-card">
          <h3 className="analysis-card__title">Why SceneAtlas feels expensive</h3>
          <p className="analysis-card__body">
            A dark editorial palette, restrained motion, structured insights, and carefully placed sponsored inventory keep the product premium rather than noisy.
          </p>
        </aside>
      </div>
    </div>
  );
}
