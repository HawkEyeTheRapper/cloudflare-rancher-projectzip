# Cloudflare Rancher — Omniversal Federation Console

## Project overview

A Cloudflare Worker + static-frontend infrastructure console purpose-built for the **Omniversal Federated Network** — a constellation of sovereign LLCs united under a shared operational, creative, and mythic architecture.

Rancher translates plain-language requests into precise Cloudflare operations (DNS, SSL/TLS, WAF, Workers, R2, Pages) while keeping the Anthropic API key server-side in a Worker secret.

## Architecture

```
public/index.html  — Static frontend (served as Worker assets)
src/index.ts       — Cloudflare Worker backend (TypeScript)
wrangler.jsonc     — Wrangler configuration
package.json       — npm scripts
```

### API endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/` | GET | Rancher UI (static assets) |
| `/api/chat` | POST | AI chat proxy → Anthropic Claude |
| `/api/plan` | POST | Operation plan generator |
| `/api/federation` | GET | Omniversal realm manifest (JSON) |
| `/api/health` | GET | Health check |

## Omniversal Federation

### Aether Core
| Entity | Domains |
|---|---|
| Omniversal Media LLC | omniversalmedia.llc, .cc, .info, .org, .net, omniversalmediasolutions.com |
| Omniversal Media Productions LLC | omniversalmedia.art |

### Sovereign Realms
| Realm | Domain | Purpose |
|---|---|---|
| Rebuilding Roots LLC | rebuilding-roots.com | Creative ops, community, narrative |
| Aether Intelligence LLC | aetherintelligence.net, aetheranalysis.com | Research, AI systems |
| EverLightOS LLC | everlightos.com, everlightos.net | Terminal interfaces, Aether protocols |
| The Sentinel Framework LLC | thesentinelframework.com | Security, governance, oversight |
| The Celtic Key LLC | theceltickey.com | Symbolic systems, mythic encryption |
| Aether Agency | aetheragency.online | Operational outreach |

### Recommended console host
`rancher.everlightos.com` (attach as custom domain to the Worker after deploy)

## Local development

```bash
npm install
# Create .dev.vars with ANTHROPIC_API_KEY=sk-ant-...
npm run dev   # runs on port 5000
```

## Deployment

```bash
npm install
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Attach `rancher.everlightos.com` as a custom domain in Cloudflare dashboard.

## Required Worker secrets
- `ANTHROPIC_API_KEY` — required
- `ANTHROPIC_MODEL` — optional (defaults to `claude-sonnet-4-20250514`)
- `ALLOWED_ORIGIN` — optional

## Notes
- Cloudflare token / account ID entered in the browser stay in browser memory only.
- Chat history is session-only (not persisted).
- The Federation tab shows the full realm constellation with clickable domain chips.
