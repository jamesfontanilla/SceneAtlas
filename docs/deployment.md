# Deployment

## Vercel

Deploy `apps/web` as the Vercel project root.

Recommended environment variables:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`

Notes:

- `GOOGLE_OAUTH_REDIRECT_URI` should point to `https://your-vercel-domain/api/auth/google/callback`.
- AdSense verification needs the live site to serve the root layout with the sitewide AdSense snippet present.
- The analysis provider is pinned in code to Groq's `openai/gpt-oss-120b` model, so you only need to configure `GROQ_API_KEY`.

## Render

Deploy `apps/api` as a Render web service.

Recommended environment variables:

- `PORT`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `GROQ_API_KEY`
- `MOVIE_DATA_PROVIDER`
- `ANALYSIS_PROVIDER`
- `WIKIDATA_API_URL`
- `COMMONS_API_URL`

## Neon

Use the Neon Postgres connection string as `DATABASE_URL`.

## Notes

- Free users stay ad-supported with native placements only.
- Premium users are ad-free.
- The public movie-data baseline is Wikidata plus Wikimedia Commons.
