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
  "rancher.everlightos.com — proposed Rancher host",
  "everlightos.com / everlightos.net — EverLight OS",
  "thesentinelframework.com — Sentinel Framework",
  "omniversalmediasolutions.com — Omniversal Media Solutions",
  "omniversalmedia.net — Omniversal flagship",
  "aetheranalysis.com — Aether Analysis",
  "aetherintelligence.net — Aether Intelligence",
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
      return json({ ok: true, service: "cloudflare-rancher" }, request, env);
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      return handleChat(request, env);
    }

    if (url.pathname === "/api/plan" && request.method === "POST") {
      return handlePlan(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleChat(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }

  const body = await safeJson(request);
  const history = normalizeHistory(body.history);
  const session = normalizeSession(body.session);

  const system = [
    "You are Rancher, an expert Cloudflare operations concierge for Omniversal Media and related EverLight / Sentinel / Aether properties.",
    "You translate plain-language requests into precise Cloudflare operations.",
    "Priorities:",
    "1. Keep answers concise and execution-oriented.",
    "2. Identify required Cloudflare scopes and call out missing scope categories.",
    "3. Distinguish safe read-only audit steps from mutating steps.",
    "4. Explicitly warn before destructive actions such as deletes, purges, overwrites, route changes, token changes, or DNS replacement.",
    "5. If the request is ambiguous, ask only the smallest necessary clarifying question.",
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
    "Omniversal hints:",
    OMNIVERSAL_HINTS,
    "",
    "When asked for an audit, cover DNS, SSL/TLS, WAF, cache posture, Workers/Pages inventory, and R2 where relevant.",
    "End with a clear next step.",
  ].join("\n");

  const reply = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: history,
    maxTokens: 1000,
  });

  return json({ reply }, request, env);
}

async function handlePlan(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }

  const body = await safeJson(request);
  const history = normalizeHistory(body.history);
  const session = normalizeSession(body.session);

  const transcript = history
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const system = [
    "You are Rancher, a Cloudflare operations planner.",
    "Generate a precise execution-ready plan from the conversation transcript.",
    "Always produce plain text in this exact high-level structure:",
    "",
    "OPERATION PLAN",
    "==============",
    "Target: <domain>",
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
  ].join("\n");

  const plan = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1200,
  });

  return json({ plan }, request, env);
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

  const data = await res.json<any>();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Anthropic request failed (${res.status})`);
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .filter((part: any) => part?.type === "text")
        .map((part: any) => part.text)
        .join("\n")
    : "";

  return text || "No response received.";
}

function normalizeHistory(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => ({
      role: item?.role === "assistant" ? "assistant" : "user",
      content: typeof item?.content === "string" ? item.content : "",
    }))
    .filter((item) => item.content.trim().length > 0);
}

function normalizeSession(input: unknown): SessionContext {
  const source = (input && typeof input === "object") ? (input as Record<string, unknown>) : {};
  return {
    domain: typeof source.domain === "string" ? source.domain : undefined,
    scopes: Array.isArray(source.scopes) ? source.scopes.filter((x): x is string => typeof x === "string") : [],
    mode: typeof source.mode === "string" ? source.mode : "plan",
    token_present: Boolean(source.token_present),
    accountId_present: Boolean(source.accountId_present),
  };
}

async function safeJson(request: Request): Promise<any> {
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
  const requestOrigin = request.headers.get("origin") || "*";
  const allowed = env.ALLOWED_ORIGIN || requestOrigin || "*";
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "vary": "origin",
  };
}
