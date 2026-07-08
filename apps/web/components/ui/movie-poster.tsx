import type { CSSProperties } from "react";
import type { MovieBrief } from "@sceneatlas/shared";

interface MoviePosterProps {
  movie: MovieBrief;
  compact?: boolean;
}

export function MoviePoster({ movie, compact = false }: MoviePosterProps) {
  const style = {
    "--poster-a": movie.posterPalette[0],
    "--poster-b": movie.posterPalette[1],
    "--poster-c": movie.posterPalette[2]
  } as CSSProperties;

  return (
    <div className={["movie-poster", compact ? "movie-poster--compact" : ""].filter(Boolean).join(" ")} style={style}>
      <span className="movie-poster__imprint">SceneAtlas</span>
      <div className="movie-poster__label">
        <p className="movie-poster__title">{movie.title}</p>
        <p className="movie-poster__meta">
          {movie.year} | {movie.genres.join(" / ")}
        </p>
      </div>
    </div>
  );
}
