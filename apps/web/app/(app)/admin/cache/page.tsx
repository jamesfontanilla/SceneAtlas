import { featureMovieAction, invalidateCacheAction, rebuildAnalysisAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { sceneAtlasMovies } from "@sceneatlas/shared";

export default function AdminCachePage() {
  return (
    <main className="app-flow">
      <SectionHeading
        eyebrow="Admin"
        title="Cache and featured content"
        copy="Use this page to feature a title, invalidate cached data, or rebuild analysis from the current catalog."
      />

      <div className="auth-grid">
        <Card className="analysis-card">
          <h3 className="analysis-card__title">Feature a title</h3>
          <form action={featureMovieAction} className="auth-form">
            <label className="field">
              <span className="field__label">Movie</span>
              <select className="field__select" defaultValue={sceneAtlasMovies[0]?.slug ?? ""} name="movieId">
                {sceneAtlasMovies.map((movie) => (
                  <option key={movie.slug} value={movie.slug}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit">Feature title</Button>
          </form>
        </Card>

        <Card className="analysis-card">
          <h3 className="analysis-card__title">Invalidate cache</h3>
          <form action={invalidateCacheAction} className="auth-form">
            <label className="field">
              <span className="field__label">Movie id, optional</span>
              <input className="field__input" name="movieId" placeholder="interstellar" />
            </label>
            <Button type="submit" variant="secondary">
              Invalidate
            </Button>
          </form>
        </Card>
      </div>

      <section className="section">
        <SectionHeading eyebrow="Analysis" title="Rebuild a movie analysis" copy="Trigger a fresh analysis run when you want to refresh a cached result." />
        <Card className="analysis-card">
          <form action={rebuildAnalysisAction} className="auth-form">
            <label className="field">
              <span className="field__label">Movie</span>
              <select className="field__select" defaultValue={sceneAtlasMovies[0]?.slug ?? ""} name="movieId">
                {sceneAtlasMovies.map((movie) => (
                  <option key={movie.slug} value={movie.slug}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field--inline">
              <input name="spoilers" type="checkbox" value="true" />
              <span className="field__label">Allow spoilers</span>
            </label>
            <Button type="submit">Rebuild analysis</Button>
          </form>
        </Card>
      </section>
    </main>
  );
}
