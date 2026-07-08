import Link from "next/link";
import type { MovieBrief } from "@sceneatlas/shared";
import { MoviePoster } from "./movie-poster";
import { Badge } from "./badge";
import { formatRating, formatRuntime } from "@/lib/format";

interface MovieCardProps {
  movie: MovieBrief;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link className="movie-card panel" href={`/movies/${movie.slug}`}>
      <MoviePoster movie={movie} />
      <div className="movie-card__body">
        <div className="movie-card__chips">
          <Badge>{movie.year}</Badge>
          <Badge>{formatRuntime(movie.runtimeMinutes)}</Badge>
          <Badge className="chip--accent">{formatRating(movie.rating)}</Badge>
        </div>
        <div>
          <h3 className="movie-card__title">{movie.title}</h3>
          <p className="movie-card__meta">{movie.tagline}</p>
        </div>
        <p className="movie-card__overview">{movie.overview}</p>
      </div>
    </Link>
  );
}
