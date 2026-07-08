# Deployment

## Vercel

Deploy `apps/web` as the Vercel project root.

Recommended environment variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `DATABASE_URL`

Notes:

- If Clerk env vars are missing, the edge middleware can fail with `MIDDLEWARE_INVOCATION_FAILED`.
- AdSense verification needs the live site to serve the root layout with the sitewide AdSense snippet present.

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
