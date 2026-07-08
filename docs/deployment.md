# Deployment

## Vercel

Deploy `apps/web` as the Vercel project root.

Recommended environment variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `DATABASE_URL`

## Render

Deploy `apps/api` as a Render web service.

Recommended environment variables:

- `PORT`
- `DATABASE_URL`
- `MOVIE_DATA_PROVIDER`
- `ANALYSIS_PROVIDER`
- `OPENAI_API_KEY`
- `WIKIDATA_API_URL`
- `COMMONS_API_URL`

## Neon

Use the Neon Postgres connection string as `DATABASE_URL`.

## Notes

- Free users stay ad-supported with native placements only.
- Premium users are ad-free.
- The public movie-data baseline is Wikidata plus Wikimedia Commons.
