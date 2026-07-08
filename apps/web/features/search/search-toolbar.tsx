import { Button } from "@/components/ui/button";
import { sceneAtlasMovies } from "@sceneatlas/shared";

interface SearchToolbarProps {
  query: string;
  genre: string;
  year: string;
  language: string;
}

export function SearchToolbar({ query, genre, year, language }: SearchToolbarProps) {
  const genres = Array.from(new Set(sceneAtlasMovies.flatMap((movie) => movie.genres))).sort();
  const languages = Array.from(
    new Set(sceneAtlasMovies.map((movie) => movie.language).filter((value): value is string => Boolean(value)))
  ).sort();

  return (
    <form className="search-toolbar" action="/search" method="get">
      <div className="search-toolbar__row">
        <label className="field">
          <span className="field__label">Search titles</span>
          <input className="field__input" defaultValue={query} name="q" placeholder="Try Interstellar, Arrival, or Dune" />
        </label>

        <label className="field">
          <span className="field__label">Genre</span>
          <select className="field__select" defaultValue={genre} name="genre">
            <option value="">All genres</option>
            {genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Language</span>
          <select className="field__select" defaultValue={language} name="language">
            <option value="">All languages</option>
            {languages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Year</span>
          <input className="field__input" defaultValue={year} name="year" placeholder="2014" />
        </label>

        <Button className="button--small" type="submit">
          Refine search
        </Button>
      </div>
    </form>
  );
}
