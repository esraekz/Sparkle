# Sparkle Tech Stack

## Mobile (Client)

- **Framework**: React Native + Expo (EAS Build/Submit)
- **State Management**: React Query + Zod (runtime validation)
- **Local Storage**: AsyncStorage/SQLite (offline drafts)
- **Authentication**: Supabase Auth (JWT) via Expo SDK
- **Push Notifications**: Expo Notifications (APNs/FCM)
- **Analytics**: PostHog or Amplitude
- **Error Tracking**: Sentry

## Backend (API)

- **Framework**: FastAPI (async Python)
- **Authentication**: Verify Supabase JWT
- **Job Scheduling**: APScheduler (simple) → Celery + Redis (if scale needed)
- **HTTP Client**: httpx (async) for news connectors
- **Validation**: Pydantic v2
- **Rate Limiting**: slowapi

## Data & Storage

- **Primary Database**: Postgres (Supabase) - **sparkle** schema
- **Vector Search**: pgvector on Supabase
- **Object Storage**: Supabase Storage (exports/assets)
- **Caching/Queues**: Redis (for Celery tasks, dedupe, ephemeral caches)

## AI Layer

- **LLM**: GPT family (OpenAI) for drafts/summaries/critique
- **Embeddings**: text-embedding model (store in pgvector)
- **Light NLP**: spaCy (NER) + scikit-learn classifier for tone/hooks (optional)

## News / Trends (Connectors)

- **Primary Source**: RSS/Atom via feedparser (official/government + reputable media)
- **Fallback API**: NewsAPI/GNews
- **Deduping**: URL hash + embedding similarity threshold
- **Trust Scoring**: Whitelist domains; mark gov/regulatory higher

## Notifications & Publishing

- **Push**: Expo Notifications with deep links (mybrand://draft/{id})
- **Reminders**: APScheduler/Celery scheduled jobs
- **v1**: Clipboard + deeplink to LinkedIn (manual post)
- **v2**: LinkedIn OAuth (Marketing Developer Platform) for auto-schedule/post

## Infrastructure & DevOps

- **Backend Deploy**: Fly.io or Render (Docker)
- **Database**: Supabase hosted Postgres
- **Secrets Management**: Doppler or GitHub Encrypted Secrets
- **CI/CD**: GitHub Actions (API tests + EAS builds)
- **Observability**: Sentry (API + app), Prometheus/Grafana (if needed later)
- **Feature Flags**: ConfigCat or Unleash (toggle Instagram module, auto-post beta, etc.)