export interface Env {
  ANTHROPIC_API_KEY: string;
  ANTHROPIC_MODEL?: string;
  ALLOWED_ORIGIN?: string;
  ASSETS: Fetcher;
}

type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

type SessionContext = {
  domain?: string;
  scopes?: string[];
  mode?: "plan" | "execute" | string;
  token_present?: boolean;
  accountId_present?: boolean;
};

type AnthropicContentPart = {
  type: string;
  text?: string;
};

type AnthropicResponse = {
  content?: AnthropicContentPart[];
  error?: { message?: string };
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
};

const SCOPE_MAP = [
  "DNS edits → Zone:DNS:Edit + Zone:Zone:Read",
  "SSL/TLS settings → Zone:Zone Settings:Edit + Zone:Zone:Read",
  "WAF / firewall rules → Zone:WAF:Edit + Zone:Firewall Services:Edit + Zone:Zone:Read",
  "R2 storage → Account:R2 Storage:Edit + Account:Account Settings:Read",
  "Workers deploy + routes → Account:Workers Scripts:Edit + Account:Workers Routes:Edit",
  "Pages / static deploy → Account:Cloudflare Pages:Edit",
  "Security level + cache → Zone:Cache Purge:Edit + Zone:Zone Settings:Edit + Zone:Zone:Read",
  "Token management → Account:API Tokens:Edit",
].join("\n");

const OMNIVERSAL_HINTS = [
  "--- AETHER CORE (Central Intelligence) ---",
  "omniversalmedia.llc — Omniversal Media LLC · Aether Core · Infrastructure, AI, compliance, merch ops",
  "omniversalmedia.cc — Mythic Intelligence Layer · primary narrative & identity hub",
  "omniversalmedia.info — Knowledge Base & Documentation · canonical reference layer",
  "omniversalmedia.org — Institutional & Ethical Layer · governance and public trust",
  "omniversalmedia.net — Omniversal flagship · main public-facing web presence",
  "omniversalmedia.art — Omniversal Media Productions LLC · music, label ops, artist output",
  "omniversalmediasolutions.com — Omniversal Media Solutions · client & community engagement",
  "",
  "--- SOVEREIGN REALMS ---",
  "theceltickey.com — The Celtic Key LLC · symbolic systems, mythic encryption, cultural resonance",
  "thesentinelframework.com — The Sentinel Framework LLC · security, guardianship, structural integrity, oversight",
  "aetherintelligence.net — Aether Intelligence LLC · advanced research, AI-aligned systems, mythic computation",
  "aetheranalysis.com — Aether Analysis · analysis layer for the Aether Intelligence network",
  "aetheragency.online — Aether Agency · operational outreach and services",
  "everlightos.com — EverLightOS LLC · terminal interfaces, federated storytelling, Aether protocols",
  "everlightos.net — EverLightOS alternate/legacy domain",
  "rebuilding-roots.com — Rebuilding Roots LLC · creative ops, community initiatives, narrative development",
  "",
  "--- CONSOLE & INFRA ---",
  "rancher.everlightos.com — proposed Rancher console host · primary deployment target for this Worker",
  "account-level (all zones) — Workers, R2, Pages, account-wide tasks",
].join("\n");

const FEDERATION_CONTEXT = [
  "THE OMNIVERSAL FEDERATED NETWORK — Architecture Overview",
  "=========================================================",
  "Omniversal Media LLC is the AETHER CORE: the central intelligence layer that provides",
  "enterprise-class infrastructure, AI-powered operational systems, merchandising and",
  "distribution pipelines, compliance scaffolding, and federated intelligence protocols",
  "to all sovereign member realms.",
  "",
  "Each sovereign LLC maintains full autonomy (separate finances, operations, liability)",
  "while plugging into the Aether Core via a Shared Services Agreement.",
  "",
  "SOVEREIGN REALMS AND THEIR PURPOSE:",
  "• Rebuilding Roots LLC — Creative operations, community initiatives, narrative development",
  "• Omniversal Media Productions LLC — Music, label operations, merch, distribution, artistic output",
  "• Aether Intelligence LLC — Advanced research, AI-aligned systems, mythic computation",
  "• EverLightOS LLC — Terminal interfaces, federated storytelling, Aether protocols",
  "• The Sentinel Framework LLC — Security, guardianship, structural integrity, oversight",
  "• The Celtic Key LLC — Symbolic systems, mythic encryption, cultural resonance",
  "• Aether Agency — Operational outreach and external-facing services",
  "",
  "SHARED SERVICES PROVIDED BY AETHER CORE:",
  "• Infrastructure (hosting, Workers, R2 storage, DNS)",
  "• AI systems and Aether Intelligence protocols",
  "• Compliance scaffolding and legal structure",
  "• Merchandising and distribution pipelines",
  "• Metadata, SEO, and federated intelligence architecture",
  "",
  "INTERCOMPANY FLOW: Contracts define roles, revenue shares are set per project,",
  "ownership remains clear, liability remains separate per realm.",
].join("\n");

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    if (url.pathname === "/api/health") {
      return json({ ok: true, service: "cloudflare-rancher", federation: "omniversal" }, request, env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/plan" && request.method === "POST") {
      return handlePlan(request, env);
    }

    if (url.pathname === "/api/federation" && request.method === "GET") {
      return handleFederation(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }

  const body = await safeJson(request);
  const history = normalizeHistory(body);
  const session = normalizeSession(body);

  const system = [
    "You are Rancher, an expert Cloudflare operations concierge for the Omniversal Federated Network.",
    "The Omniversal Federated Network is a constellation of sovereign LLCs aligned under a shared",
    "operational, creative, and mythic architecture — all powered by Omniversal Media LLC as the Aether Core.",
    "You translate plain-language requests into precise Cloudflare operations.",
    "",
    "Priorities:",
    "1. Keep answers concise and execution-oriented.",
    "2. Identify required Cloudflare scopes and call out missing scope categories.",
    "3. Distinguish safe read-only audit steps from mutating steps.",
    "4. Explicitly warn before destructive actions such as deletes, purges, overwrites, route changes, token changes, or DNS replacement.",
    "5. If the request is ambiguous, ask only the smallest necessary clarifying question.",
    "6. When working on a realm's domain, acknowledge which sovereign LLC it belongs to and its purpose in the federation.",
    "",
    "Session context:",
    `- Target domain/zone: ${session.domain || "not set"}`,
    `- Selected scope categories: ${(session.scopes || []).join(", ") || "none selected"}`,
    `- Mode: ${session.mode || "plan"}`,
    `- Cloudflare token present in browser session: ${Boolean(session.token_present)}`,
    `- Cloudflare account ID present in browser session: ${Boolean(session.accountId_present)}`,
    "",
    "Scope mapping:",
    SCOPE_MAP,
    "",
    "Omniversal Federation domain constellation:",
    OMNIVERSAL_HINTS,
    "",
    "Federation architecture:",
    FEDERATION_CONTEXT,
    "",
    "When asked for an audit, cover DNS, SSL/TLS, WAF, cache posture, Workers/Pages inventory, and R2 where relevant.",
    "End with a clear next step.",
  ].join("\n");

  const reply = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: history,
    maxTokens: 1200,
  });

  return json({ reply }, request, env);
}

async function handlePlan(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }

  const body = await safeJson(request);
  const history = normalizeHistory(body);
  const session = normalizeSession(body);

  const transcript = history
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const system = [
    "You are Rancher, a Cloudflare operations planner for the Omniversal Federated Network.",
    "Generate a precise execution-ready plan from the conversation transcript.",
    "Always produce plain text in this exact high-level structure:",
    "",
    "OPERATION PLAN",
    "==============",
    "Target: <domain> (<realm name if applicable>)",
    "Mode: <plan-only|execute>",
    "Scope categories selected: <list>",
    "Required permissions: <list>",
    "",
    "STEPS:",
    "1. <action> — <command or API call>",
    "2. ...",
    "",
    "VERIFICATION:",
    "- <checks>",
    "",
    "WARNINGS:",
    "- <use ⚠ for destructive or potentially disruptive actions>",
    "",
    "NOTES:",
    "- <assumptions, missing data, follow-up>",
    "",
    "Use Wrangler or curl examples whenever possible.",
    "Do not pretend destructive actions are safe.",
    "If information is missing, make explicit assumptions and note them.",
    "Reference the realm's purpose when relevant (e.g., Sentinel Framework = security/oversight).",
  ].join("\n");

  const userPrompt = [
    `Session domain: ${session.domain || "not set"}`,
    `Mode: ${session.mode || "plan"}`,
    `Selected scopes: ${(session.scopes || []).join(", ") || "none selected"}`,
    "",
    "Transcript:",
    transcript,
    "",
    "Scope mapping:",
    SCOPE_MAP,
    "",
    "Omniversal domain constellation:",
    OMNIVERSAL_HINTS,
  ].join("\n");

  const plan = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1400,
  });

  return json({ plan }, request, env);
}

async function handleFederation(_request: Request, _env: Env): Promise<Response> {
  const realms = [
    {
      name: "Omniversal Media LLC",
      role: "Aether Core",
      domains: ["omniversalmedia.llc", "omniversalmedia.cc", "omniversalmedia.info", "omniversalmedia.org", "omniversalmedia.net", "omniversalmediasolutions.com"],
      description: "Central intelligence layer. Provides infrastructure, AI systems, compliance scaffolding, merchandising, and federated intelligence protocols to all sovereign realms.",
      tier: "core",
      status: "Active",
    },
    {
      name: "Omniversal Media Productions LLC",
      role: "Sovereign Realm",
      domains: ["omniversalmedia.art"],
      description: "Music, label operations, merch, distribution, and artistic output.",
      tier: "sovereign",
      status: "Active",
    },
    {
      name: "Rebuilding Roots LLC",
      role: "Sovereign Realm",
      domains: ["rebuilding-roots.com"],
      description: "Creative operations, community initiatives, and narrative development.",
      tier: "sovereign",
      status: "Active",
    },
    {
      name: "Aether Intelligence LLC",
      role: "Sovereign Realm",
      domains: ["aetherintelligence.net", "aetheranalysis.com"],
      description: "Advanced research, AI-aligned systems, and mythic computation.",
      tier: "sovereign",
      status: "Active",
    },
    {
      name: "EverLightOS LLC",
      role: "Sovereign Realm",
      domains: ["everlightos.com", "everlightos.net"],
      description: "Terminal interfaces, federated storytelling, and Aether protocols.",
      tier: "sovereign",
      status: "Active",
    },
    {
      name: "The Sentinel Framework LLC",
      role: "Sovereign Realm",
      domains: ["thesentinelframework.com"],
      description: "Security, guardianship, structural integrity, and oversight across the federation.",
      tier: "sovereign",
      status: "Active",
    },
    {
      name: "The Celtic Key LLC",
      role: "Sovereign Realm",
      domains: ["theceltickey.com"],
      description: "Symbolic systems, mythic encryption, and cultural resonance.",
      tier: "sovereign",
      status: "Onboarding",
    },
    {
      name: "Aether Agency",
      role: "Sovereign Realm",
      domains: ["aetheragency.online"],
      description: "Operational outreach and external-facing services for the federation.",
      tier: "sovereign",
      status: "Onboarding",
    },
  ];

  return new Response(JSON.stringify({ realms, console_host: "rancher.everlightos.com" }, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}

async function callAnthropic(args: {
  apiKey: string;
  model: string;
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
}): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: args.model,
      system: args.system,
      max_tokens: args.maxTokens,
      messages: args.messages,
    }),
  });

  const data = await res.json() as AnthropicResponse;
  if (!res.ok) {
    throw new Error(data?.error?.message ?? `Anthropic request failed (${res.status})`);
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .filter((part): part is AnthropicContentPart & { type: "text"; text: string } =>
          part?.type === "text" && typeof part.text === "string"
        )
        .map((part) => part.text)
        .join("\n")
    : "";

  return text || "No response received.";
}

function normalizeHistory(body: unknown): ChatMessage[] {
  if (!body || typeof body !== "object") {
    return [];
  }

  const input = (body as Record<string, unknown>).history;

  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        role: record.role === "assistant" ? "assistant" : ("user" as ChatRole),
        content: typeof record.content === "string" ? record.content : "",
      };
    })
    .filter((item): item is ChatMessage => item !== null && item.content.trim().length > 0);
}

function normalizeSession(body: unknown): SessionContext {
  if (!body || typeof body !== "object") {
    return { scopes: [], mode: "plan", token_present: false, accountId_present: false };
  }

  const input = (body as Record<string, unknown>).session;
  const source = input && typeof input === "object" ? (input as Record<string, unknown>) : {};

  return {
    domain: typeof source.domain === "string" ? source.domain : undefined,
    scopes: Array.isArray(source.scopes)
      ? source.scopes.filter((x): x is string => typeof x === "string")
      : [],
    mode: typeof source.mode === "string" ? source.mode : "plan",
    token_present: Boolean(source.token_present),
    accountId_present: Boolean(source.accountId_present),
  };
}

async function safeJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function json(payload: unknown, request: Request, env: Env, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env),
    },
  });
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const requestOrigin = request.headers.get("origin") ?? "*";
  const allowed = env.ALLOWED_ORIGIN ?? requestOrigin;
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "vary": "origin",
  };
}
