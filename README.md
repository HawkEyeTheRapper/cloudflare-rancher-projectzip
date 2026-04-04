# Cloudflare Rancher

A deployable Cloudflare Worker + static-assets version of the Rancher console.

## Why this structure

This project is intentionally packaged as a **Worker with static assets** instead of a browser-only HTML file.
That gives you:

- a secure server-side proxy for Anthropic calls
- static UI hosting from the same deployment
- one deploy target for both the console and its API endpoints
- an easy path to attach a custom domain like `rancher.everlightos.com`

## Included endpoints

- `GET /` → Rancher UI
- `POST /api/chat` → AI chat proxy
- `POST /api/plan` → operation-plan generator
- `GET /api/health` → health check

## Required secrets

Set these in Cloudflare before deploy:

- `ANTHROPIC_API_KEY` (required)
- `ANTHROPIC_MODEL` (optional, defaults to `claude-sonnet-4-20250514`)
- `ALLOWED_ORIGIN` (optional, useful if you later split front-end and API origins)

## Local development

```bash
npm install
npx wrangler dev
```

For local secrets, create `.dev.vars`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ALLOWED_ORIGIN=http://localhost:8787
```

## Deploy

```bash
npm install
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put ANTHROPIC_MODEL
npx wrangler deploy
```

After deployment, attach your preferred hostname in the Cloudflare dashboard or add a custom domain to the Worker.
A good first pass would be:

- `rancher.everlightos.com`

## Notes

- The entered Cloudflare token and account ID are only held in browser memory in this version.
- The browser does **not** call Anthropic directly anymore.
- You can later add Durable Objects, KV, D1, or auth if you want persisted sessions, audit history, or multi-user access.
