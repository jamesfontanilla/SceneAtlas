# Phase 2 Requirements: SceneAtlas Productization, AI Chat, SEO, and Growth

## 1. Purpose

Phase 2 turns SceneAtlas from a working research app into a product that feels real, sticky, and launch-ready.

Phase 1 already established the core stack and the right product direction:

- Next.js web app on Vercel
- NestJS API on Render
- PostgreSQL on Neon
- Custom auth with email/password, OTP verification, password reset, and Google OAuth
- Public movie-data baseline from Wikidata + Wikimedia Commons
- Groq-only AI analysis using `openai/gpt-oss-120b`
- Premium editorial UI with restrained ads for free users

Phase 2 must extend that baseline without changing the product's center of gravity.

## 2. Phase 2 Product Goal

A user should be able to:

- Search for a movie quickly
- Open a polished movie research page
- Ask follow-up questions in a movie-specific AI chat
- Save and organize titles
- Return later and see their history, saved chats, and watchlist
- Discover content through SEO-friendly pages and curated discovery surfaces

Admins should be able to:

- Rebuild or refresh AI analysis
- Monitor failures, quotas, and content health
- Feature titles and tune discovery surfaces

Free users should:

- Get a good product experience
- See native, labeled ads in low-friction places
- Hit reasonable usage limits that encourage upgrade

Premium users should:

- Be ad-free
- Get higher or unlimited usage where it matters
- Keep a clean, premium research experience

## 3. Locked Product Decisions

These decisions are fixed for Phase 2:

- Movie data baseline remains public and commercial-safe: Wikidata + Wikimedia Commons
- AI provider remains Groq only
- AI model remains pinned in code to `openai/gpt-oss-120b`
- No OpenAI fallback path
- No Clerk or Auth.js auth stack
- No TMDB dependency for the public baseline
- No mobile native app in this phase
- No social feed, follows, or comment network
- No user-uploaded media
- No custom model training
- No ad formats that interrupt the core research flow

## 4. Current Baseline to Preserve

Phase 2 builds on the existing repo structure:

- `apps/web` already contains the marketing site, app routes, auth routes, and server actions
- `apps/api` already contains auth, movies, analysis, watchlist, collections, ratings, reviews, exports, subscriptions, and usage modules
- `packages/db` already contains the Prisma schema and custom auth/session records
- `packages/shared` already contains the movie analysis and app contract types

Phase 2 must not break:

- Search
- Movie detail pages
- Watchlist
- Collections
- Ratings and reviews
- Export notes
- Google OAuth login
- Email OTP verification
- Password reset
- Groq analysis generation

## 5. Phase 2 Scope

### In Scope

- Replace the demo-only homepage/catalog cards with live, data-driven featured titles from the public movie baseline
- Movie-specific AI chat
- Cached AI analyses and chat transcripts
- Background jobs for analysis precompute and refresh
- Search quality improvements and discovery ranking
- Search history and movie view history
- User profile page and activity page
- SEO metadata, structured data, sitemap, and robots improvements
- Ad placement registry and frequency rules
- Analytics event capture and lightweight dashboards
- Admin dashboard for content and AI operations
- Cache invalidation and manual regeneration tools
- Better failure handling and observability

### Out of Scope

- Native mobile apps
- Social feed, follows, and public friend graph
- User-generated media uploads
- Video hosting or playback infrastructure
- Team and enterprise billing
- Custom model training
- Full vector database semantic search if it requires heavy infra
- Real-time collaborative editing
- Marketplace or affiliate flows

## 6. Phase 2 Success Criteria

Phase 2 is successful when:

- Search feels fast and reliable
- Movie pages feel rich and consistent
- AI chat adds value without turning into a generic chatbot
- Cached analysis is reused instead of regenerated unnecessarily
- Users can return to their history and saved work
- SEO pages are indexable and visually polished
- Ads are visible but never annoying
- Admins can manage analysis and content health without touching code
- The app still builds cleanly and deploys on the existing stack

## 7. User Journeys

1. A user searches for a movie, opens the detail page, and sees metadata, structured analysis, and a chat entry point.
2. A user asks a follow-up question about a movie and gets a grounded answer from the movie context.
3. A user saves a movie to the watchlist and later returns to see it in profile history.
4. A free user sees a small labeled ad in a side rail or list break, not inside the answer area.
5. A premium user sees no ads and gets the same content hierarchy without sponsor surfaces.
6. An admin refreshes a stale analysis and watches the job complete.
7. A crawler visits a movie page and receives canonical metadata, OG tags, JSON-LD, and sitemap coverage.

## 8. Functional Requirements

### 8.1 Discovery and Search

- Search must remain the primary entry point.
- Search should support:
  - title
  - year
  - genre
  - language
  - recent searches
  - trending queries
- Search results should be ranked with a product-aware relevance layer:
  - exact title matches first
  - then high-confidence semantic or metadata matches
  - then fallback public catalog coverage
- Search should degrade gracefully when upstream metadata is incomplete.
- Search should not be blocked by AI provider issues.
- Search pages should be fast enough to feel responsive on low-end devices.
- Search history should be captured per user and used for resurfacing relevant titles.

### 8.2 Movie Detail and Research Page

- The movie page remains the center of the app.
- It must clearly separate:
  - raw metadata
  - AI analysis
  - user actions
  - monetization surfaces
- The page should include:
  - poster and backdrop
  - title and release year
  - runtime and genres
  - tagline and overview
  - cast and crew
  - spoiler toggle
  - summary card
  - ending explanation card
  - timeline rail
  - relationship map
  - similar movies
  - watchlist control
  - export control
  - AI chat entry point
- The spoiler toggle must persist per movie and control all spoiler-sensitive surfaces.
- The page should support a refresh-analysis action when cached content is stale.

### 8.3 AI Analysis

- SceneAtlas must keep structured analysis, not a single paragraph blob.
- Analysis must stay in JSON-shape form so the UI can render cards, lists, and graph data.
- The fixed AI provider is Groq.
- The fixed model is `openai/gpt-oss-120b`.
- The analysis output must include:
  - summary
  - spoiler summary
  - ending explanation
  - spoiler ending explanation
  - timeline events
  - relationship edges
  - similar titles with reasons
- Cached analysis should be keyed by:
  - movie id
  - spoiler mode
  - provider name
  - model version
  - prompt version
- If a cached record exists, the app must return it before generating a new one.
- Admins must be able to invalidate and regenerate analysis.
- Analysis generation must fail closed:
  - if Groq is unavailable, show cached or fallback content
  - if parsing fails, do not break the movie page

### 8.4 AI Chat

- Add a movie-scoped chat experience.
- Chat must answer within the context of the selected movie.
- Chat sessions should be stored and resumable.
- The chat should support:
  - follow-up questions
  - spoiler-aware responses
  - context limited to the current movie
  - a small bounded message window
  - session history
  - chat export later if needed
- Free users should have a message cap.
- Premium users should have a higher or unlimited cap.
- Long sessions should be summarized or trimmed so prompt size stays bounded.
- Chat should not leak system instructions or secret data.

### 8.5 Watchlist, Collections, and History

- The watchlist must remain simple and fast.
- Collections must remain a personal organization tool.
- Phase 2 should add history surfaces for:
  - recently viewed movies
  - recently analyzed movies
  - recent chat sessions
  - recent searches
- The profile page should surface the user's saved work.
- The watchlist should stay usable even when AI or analytics layers fail.

### 8.6 User Profile

- Add a personal profile view.
- Profile should show:
  - avatar
  - display name
  - email
  - join date
  - subscription tier
  - usage snapshot
  - watchlist count
  - collection count
  - review count
  - chat/session count
  - recent activity
- Users should be able to edit allowed profile fields without breaking auth ownership.

### 8.7 SEO and Indexability

- Every public movie page must have:
  - title
  - description
  - canonical URL
  - OpenGraph metadata
  - Twitter metadata
  - JSON-LD structured data
- The app must generate:
  - sitemap
  - robots
  - movie page metadata
  - curated landing page metadata
- SEO pages should remain crawlable even when the API is under load.
- High-value movie pages should be cacheable and revalidatable.
- Search pages should be index-friendly where appropriate, but not duplicate the movie detail pages.

### 8.8 Ads and Monetization

- Ads must remain native and explicitly labeled.
- Ads must never appear inside:
  - the main AI answer area
  - the timeline rail
  - the relationship map
  - the core metadata block
- Ads may appear in:
  - side rails
  - list breaks
  - footer cards
  - low-friction discovery surfaces
- Free users should see restrained ad inventory.
- Premium users should have no ads.
- Ads must fail gracefully without breaking layout.

### 8.9 Analytics and Telemetry

- Track at least:
  - page views
  - search submissions
  - movie page opens
  - analysis requests
  - chat starts
  - chat messages
  - watchlist saves
  - collection actions
  - export actions
  - upgrade clicks
  - ad impressions
- Analytics should be privacy-aware and avoid collecting unnecessary PII.
- Events should support product decisions, not just vanity metrics.
- Admins should be able to inspect aggregate trends.

### 8.10 Admin and Operations

- Add an admin dashboard.
- Admin should be able to:
  - view queue depth
  - regenerate analysis
  - invalidate analysis cache
  - inspect failures
  - inspect usage snapshots
  - feature a title
  - view flagged content or suspicious activity
- Admin pages should be protected by role checks.
- Admin actions should be auditable.

### 8.11 Reliability and Error Handling

- If Groq fails, the app should fall back to cached or baseline analysis.
- If search provider data is incomplete, the page should still render.
- If ads fail, the layout should remain intact.
- If analytics fail, the user flow should continue.
- If an admin job fails, the error should be visible in logs and the queue.

### 8.12 Performance

- Search should feel immediate.
- Movie page data should be streamed or progressively revealed where useful.
- AI responses should be cached aggressively.
- Repeated analysis requests should not re-hit Groq unless the cache is invalidated.
- Static and cached routes should stay lightweight enough for Vercel.

### 8.13 Security

- All write endpoints must validate inputs.
- OAuth state and PKCE flows must stay intact.
- Reset tokens and OTP tokens must stay hashed at rest.
- AI prompts must not expose secrets or internal system instructions.
- Admin-only actions must be role checked.
- Open redirects must be blocked.
- Audit logs should record sensitive transitions like sign-in, sign-out, password reset, and analysis regeneration.

## 9. Data Model Additions

Phase 2 should extend the Prisma schema with the following kinds of data:

### 9.1 Existing tables to keep

- `User`
- `AuthSession`
- `AuthChallenge`
- `Subscription`
- `Movie`
- `MovieSourceSnapshot`
- `AnalysisRequest`
- `AnalysisResult`
- `Character`
- `TimelineEvent`
- `WatchlistItem`
- `Collection`
- `CollectionItem`
- `Rating`
- `Review`
- `ExportJob`
- `UsageEvent`

### 9.2 New or expanded tables

- `ChatSession`
  - user id
  - movie id
  - summary
  - provider
  - model
  - spoiler mode
  - last message time
  - archived flag
- `ChatMessage`
  - session id
  - role
  - content
  - token counts
  - created at
- `SearchEvent`
  - user id
  - query
  - filters
  - result count
  - provider
- `MovieViewEvent`
  - user id
  - movie id
  - spoiler toggle state
  - referrer
- `AnalyticsEvent`
  - event name
  - user id
  - session id
  - payload json
- `AdminAuditLog`
  - actor
  - action
  - target
  - metadata json
- `PromptVersion`
  - provider
  - model
  - version key
  - active flag

### 9.3 Required indexes

- `ChatSession(movieId, userId)`
- `ChatMessage(sessionId, createdAt)`
- `SearchEvent(userId, createdAt)`
- `MovieViewEvent(movieId, createdAt)`
- `AnalyticsEvent(eventName, createdAt)`
- `AnalysisRequest(movieId, spoilerEnabled)`
- `AnalysisRequest(cacheKey)`

## 10. API Surface

Phase 2 should preserve the current API and add the following:

### 10.1 Analysis

- `GET /analysis/:movieId?spoilers=0|1`
- `POST /analysis/:movieId/regenerate`
- `DELETE /analysis/:movieId/cache`

### 10.2 Chat

- `GET /chat/sessions?movieId=...`
- `POST /chat/sessions`
- `GET /chat/sessions/:sessionId`
- `POST /chat/sessions/:sessionId/messages`
- `POST /chat/sessions/:sessionId/summary`
- `DELETE /chat/sessions/:sessionId`

### 10.3 Search and Discovery

- `GET /movies?query=...`
- `GET /movies/:movieId`
- `GET /search/suggestions?q=...`
- `GET /search/trending`
- `GET /discover/featured`

### 10.4 User and Profile

- `GET /auth/me`
- `GET /profile/me`
- `GET /profile/me/history`
- `GET /profile/me/chat-sessions`
- `GET /profile/me/search-history`

### 10.5 Admin

- `GET /admin/metrics`
- `GET /admin/queue`
- `POST /admin/analysis/:movieId/rebuild`
- `POST /admin/cache/invalidate`
- `POST /admin/feature/:movieId`

### 10.6 Analytics

- `POST /analytics/events`
- `POST /analytics/impression`

## 11. Folder and File Structure

This is the target repo shape for Phase 2. It keeps the current monorepo layout and adds the missing product layers.

```text
apps/
  web/
    app/
      layout.tsx
      globals.css
      not-found.tsx
      robots.ts
      sitemap.ts
      (marketing)/
        layout.tsx
        page.tsx
        about/page.tsx
        faq/page.tsx
        pricing/page.tsx
      (app)/
        layout.tsx
        dashboard/page.tsx
        search/page.tsx
        search/loading.tsx
        search/error.tsx
        movies/[movieId]/
          page.tsx
          loading.tsx
          not-found.tsx
          error.tsx
          chat/page.tsx
        watchlist/page.tsx
        collections/page.tsx
        billing/page.tsx
        settings/page.tsx
        profile/page.tsx
        profile/history/page.tsx
        profile/chats/page.tsx
        profile/search-history/page.tsx
        analytics/page.tsx
        admin/page.tsx
        admin/users/page.tsx
        admin/analysis/page.tsx
        admin/jobs/page.tsx
        admin/logs/page.tsx
        admin/cache/page.tsx
      (auth)/
        layout.tsx
        sign-in/page.tsx
        sign-up/page.tsx
        verify-email/page.tsx
        forgot-password/page.tsx
        reset-password/page.tsx
      api/
        auth/google/start/route.ts
        auth/google/callback/route.ts
        analytics/route.ts
        impressions/route.ts
        revalidate/route.ts
    components/
      chrome/
        app-shell.tsx
        site-header.tsx
        site-footer.tsx
        nav-user-menu.tsx
      ui/
        button.tsx
        badge.tsx
        card.tsx
        dialog.tsx
        dropdown-menu.tsx
        input.tsx
        skeleton.tsx
        tabs.tsx
        textarea.tsx
        tooltip.tsx
        movie-card.tsx
        movie-poster.tsx
        section-heading.tsx
        spoiler-toggle.tsx
        ad-slot.tsx
        empty-state.tsx
      analytics/
        event-pixel.tsx
        kpi-grid.tsx
        traffic-chart.tsx
      ads/
        ad-card.tsx
        ad-disclaimer.tsx
        ad-placement.tsx
      seo/
        json-ld.tsx
        metadata.tsx
        canonical-link.tsx
    features/
      search/
        search-toolbar.tsx
        search-results.tsx
        search-suggestions.tsx
        trending-strip.tsx
        recent-searches.tsx
      movie-detail/
        analysis-panels.tsx
        chat-panel.tsx
        timeline-rail.tsx
        relationship-map.tsx
        similar-movies-grid.tsx
        metadata-grid.tsx
        provenance-card.tsx
      chat/
        chat-thread.tsx
        chat-composer.tsx
        chat-message.tsx
        chat-history.tsx
        chat-session-list.tsx
      profile/
        profile-summary.tsx
        history-list.tsx
        saved-items.tsx
        activity-feed.tsx
      admin/
        analysis-queue.tsx
        user-table.tsx
        job-table.tsx
        log-stream.tsx
        cache-table.tsx
      ads/
        ad-placement-registry.ts
        sponsor-card.tsx
      seo/
        structured-data.ts
        metadata-builder.ts
        sitemap-links.tsx
    lib/
      api.ts
      actions.ts
      auth.ts
      session.ts
      chat.ts
      analytics.ts
      ads.ts
      cache.ts
      env.ts
      format.ts
      limits.ts
      seo.ts
      site.ts
      structured-data.ts
    hooks/
      use-debounced-value.ts
      use-intersection-observer.ts
      use-chat-autoscroll.ts
      use-analytics.ts
      use-local-storage.ts
  api/
    src/
      main.ts
      app.module.ts
      common/
        filters/
        guards/
        interceptors/
        decorators/
        sceneatlas-request.ts
      config/
        env.ts
        prompts.ts
        runtime.ts
      modules/
        auth/
          auth.module.ts
          auth.controller.ts
          auth.service.ts
          dto/
          templates/
        analysis/
          analysis.module.ts
          analysis.controller.ts
          analysis.service.ts
          dto/
          jobs/
          prompts/
          providers/
          schemas/
        chat/
          chat.module.ts
          chat.controller.ts
          chat.service.ts
          dto/
          prompts/
          providers/
          schemas/
        search/
          search.module.ts
          search.controller.ts
          search.service.ts
          dto/
          providers/
          index/
        movies/
          movies.module.ts
          movies.controller.ts
          movies.service.ts
          dto/
          providers/
        watchlist/
          watchlist.module.ts
          watchlist.controller.ts
          watchlist.service.ts
        collections/
          collections.module.ts
          collections.controller.ts
          collections.service.ts
        ratings/
          ratings.module.ts
          ratings.controller.ts
          ratings.service.ts
        reviews/
          reviews.module.ts
          reviews.controller.ts
          reviews.service.ts
        exports/
          exports.module.ts
          exports.controller.ts
          exports.service.ts
        subscriptions/
          subscriptions.module.ts
          subscriptions.controller.ts
          subscriptions.service.ts
        usage/
          usage.module.ts
          usage.controller.ts
          usage.service.ts
        analytics/
          analytics.module.ts
          analytics.controller.ts
          analytics.service.ts
          dto/
        admin/
          admin.module.ts
          admin.controller.ts
          admin.service.ts
        seo/
          seo.module.ts
          seo.service.ts
          sitemap.service.ts
        jobs/
          jobs.module.ts
          jobs.service.ts
          workers/
          schedulers/
        health/
          health.module.ts
          health.controller.ts
      workers/
        analysis.worker.ts
        search-index.worker.ts
        cleanup.worker.ts
  db/
    prisma/
      schema.prisma
      migrations/
      seed.ts
      seed-data/
    src/
      prisma.ts
      auth-crypto.ts
      sceneatlas-store.ts
      analytics.ts
      search-index.ts
      index.ts
  shared/
    src/
      types.ts
      mock.ts
      auth.ts
      chat.ts
      seo.ts
      analytics.ts
      limits.ts
      index.ts
scripts/
  backfill-analyses.ts
  backfill-search-index.ts
  regenerate-sitemaps.ts
  seed-admin.ts
  cleanup-expired-sessions.ts
  reset-cache.ts
docs/
  deployment.md
  ai-contract.md
  seo.md
  analytics.md
  ads.md
  admin.md
outputs/
  phase-1-requirements.md
  phase-2-requirements.md
tests/
  api/
  web/
  e2e/
```

## 12. Implementation Order

Phase 2 should be delivered in this order:

1. Add AI chat data model and API
2. Add chat UI to movie pages
3. Add background jobs for analysis refresh and precompute
4. Add history and profile pages
5. Add SEO metadata and structured data improvements
6. Add analytics event ingestion and dashboards
7. Add admin tools for cache and job operations
8. Add discovery and ranking improvements
9. Add any search quality upgrades that depend on the new telemetry

## 13. Environment and Services

### Required Services

- Vercel for `apps/web`
- Render for `apps/api`
- Neon for PostgreSQL
- Groq for AI analysis and chat
- Brevo for transactional email
- Google Cloud Platform for OAuth
- AdSense for monetization

### Required Environment Variables

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `GROQ_API_KEY`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REDIRECT_URI`
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`
- `MOVIE_DATA_PROVIDER`
- `ANALYSIS_PROVIDER`

### Optional Environment Variables

- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `CORS_ORIGIN`
- `REDIS_URL` if a queue backend is added later

## 14. Non-Functional Requirements

- The app must remain buildable on the existing deployment targets.
- The app must degrade gracefully when any third-party service is down.
- The AI provider must be pinned and not user-selectable.
- The UI must remain premium, editorial, and calm.
- Ads must not visually dominate the page.
- All write operations must be auditable.
- Cached responses should be preferred over repeated provider calls.
- Production paths must not depend on localhost-only assumptions.

## 15. Acceptance Criteria

Phase 2 is done when:

- The default homepage and primary browse surfaces no longer depend on hard-coded demo titles
- A user can chat about a movie and the chat persists
- A user can come back and see saved history
- Movie pages have strong SEO and structured data
- Cached analyses are reused
- Admins can regenerate and invalidate content safely
- Ads remain present but restrained for free users
- Premium users see an ad-free research workspace
- Search, movie detail, watchlist, collections, ratings, reviews, exports, and auth still work
- `pnpm typecheck` passes
- `pnpm build` passes
- The repo keeps using the current monorepo architecture

## 16. Notes for Future Phases

Possible Phase 3 work:

- Semantic search with embeddings
- Person pages for directors and actors
- Genre and year landing pages at scale
- Personalized recommendations
- Notification center
- Public sharing links for chats or analyses
- Deeper admin moderation tooling

Those items should not block Phase 2.
