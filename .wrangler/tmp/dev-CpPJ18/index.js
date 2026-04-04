var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8"
};
var SCOPE_MAP = [
  "DNS edits \u2192 Zone:DNS:Edit + Zone:Zone:Read",
  "SSL/TLS settings \u2192 Zone:Zone Settings:Edit + Zone:Zone:Read",
  "WAF / firewall rules \u2192 Zone:WAF:Edit + Zone:Firewall Services:Edit + Zone:Zone:Read",
  "R2 storage \u2192 Account:R2 Storage:Edit + Account:Account Settings:Read",
  "Workers deploy + routes \u2192 Account:Workers Scripts:Edit + Account:Workers Routes:Edit",
  "Pages / static deploy \u2192 Account:Cloudflare Pages:Edit",
  "Security level + cache \u2192 Zone:Cache Purge:Edit + Zone:Zone Settings:Edit + Zone:Zone:Read",
  "Token management \u2192 Account:API Tokens:Edit"
].join("\n");
var OMNIVERSAL_HINTS = [
  "--- AETHER CORE (Central Intelligence) ---",
  "omniversalmedia.llc \u2014 Omniversal Media LLC \xB7 Aether Core \xB7 Infrastructure, AI, compliance, merch ops",
  "omniversalmedia.cc \u2014 Mythic Intelligence Layer \xB7 primary narrative & identity hub",
  "omniversalmedia.info \u2014 Knowledge Base & Documentation \xB7 canonical reference layer",
  "omniversalmedia.org \u2014 Institutional & Ethical Layer \xB7 governance and public trust",
  "omniversalmedia.net \u2014 Omniversal flagship \xB7 main public-facing web presence",
  "omniversalmedia.art \u2014 Omniversal Media Productions LLC \xB7 music, label ops, artist output",
  "omniversalmediasolutions.com \u2014 Omniversal Media Solutions \xB7 client & community engagement",
  "",
  "--- SOVEREIGN REALMS ---",
  "theceltickey.com \u2014 The Celtic Key LLC \xB7 symbolic systems, mythic encryption, cultural resonance",
  "thesentinelframework.com \u2014 The Sentinel Framework LLC \xB7 security, guardianship, structural integrity, oversight",
  "aetherintelligence.net \u2014 Aether Intelligence LLC \xB7 advanced research, AI-aligned systems, mythic computation",
  "aetheranalysis.com \u2014 Aether Analysis \xB7 analysis layer for the Aether Intelligence network",
  "aetheragency.online \u2014 Aether Agency \xB7 operational outreach and services",
  "everlightos.com \u2014 EverLightOS LLC \xB7 terminal interfaces, federated storytelling, Aether protocols",
  "everlightos.net \u2014 EverLightOS alternate/legacy domain",
  "rebuilding-roots.com \u2014 Rebuilding Roots LLC \xB7 creative ops, community initiatives, narrative development",
  "",
  "--- CONSOLE & INFRA ---",
  "rancher.everlightos.com \u2014 proposed Rancher console host \xB7 primary deployment target for this Worker",
  "account-level (all zones) \u2014 Workers, R2, Pages, account-wide tasks"
].join("\n");
var FEDERATION_CONTEXT = [
  "THE OMNIVERSAL FEDERATED NETWORK \u2014 Architecture Overview",
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
  "\u2022 Rebuilding Roots LLC \u2014 Creative operations, community initiatives, narrative development",
  "\u2022 Omniversal Media Productions LLC \u2014 Music, label operations, merch, distribution, artistic output",
  "\u2022 Aether Intelligence LLC \u2014 Advanced research, AI-aligned systems, mythic computation",
  "\u2022 EverLightOS LLC \u2014 Terminal interfaces, federated storytelling, Aether protocols",
  "\u2022 The Sentinel Framework LLC \u2014 Security, guardianship, structural integrity, oversight",
  "\u2022 The Celtic Key LLC \u2014 Symbolic systems, mythic encryption, cultural resonance",
  "\u2022 Aether Agency \u2014 Operational outreach and external-facing services",
  "",
  "SHARED SERVICES PROVIDED BY AETHER CORE:",
  "\u2022 Infrastructure (hosting, Workers, R2 storage, DNS)",
  "\u2022 AI systems and Aether Intelligence protocols",
  "\u2022 Compliance scaffolding and legal structure",
  "\u2022 Merchandising and distribution pipelines",
  "\u2022 Metadata, SEO, and federated intelligence architecture",
  "",
  "INTERCOMPANY FLOW: Contracts define roles, revenue shares are set per project,",
  "ownership remains clear, liability remains separate per realm."
].join("\n");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
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
  }
};
async function handleChat(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }
  const body = await safeJson(request);
  const history = normalizeHistory(body.history);
  const session = normalizeSession(body.session);
  const system = [
    "You are Rancher, an expert Cloudflare operations concierge for the Omniversal Federated Network.",
    "The Omniversal Federated Network is a constellation of sovereign LLCs aligned under a shared",
    "operational, creative, and mythic architecture \u2014 all powered by Omniversal Media LLC as the Aether Core.",
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
    "End with a clear next step."
  ].join("\n");
  const reply = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: history,
    maxTokens: 1200
  });
  return json({ reply }, request, env);
}
__name(handleChat, "handleChat");
async function handlePlan(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ error: "Missing ANTHROPIC_API_KEY Worker secret." }, request, env, 500);
  }
  const body = await safeJson(request);
  const history = normalizeHistory(body.history);
  const session = normalizeSession(body.session);
  const transcript = history.map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n\n");
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
    "1. <action> \u2014 <command or API call>",
    "2. ...",
    "",
    "VERIFICATION:",
    "- <checks>",
    "",
    "WARNINGS:",
    "- <use \u26A0 for destructive or potentially disruptive actions>",
    "",
    "NOTES:",
    "- <assumptions, missing data, follow-up>",
    "",
    "Use Wrangler or curl examples whenever possible.",
    "Do not pretend destructive actions are safe.",
    "If information is missing, make explicit assumptions and note them.",
    "Reference the realm's purpose when relevant (e.g., Sentinel Framework = security/oversight)."
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
    OMNIVERSAL_HINTS
  ].join("\n");
  const plan = await callAnthropic({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
    system,
    messages: [{ role: "user", content: userPrompt }],
    maxTokens: 1400
  });
  return json({ plan }, request, env);
}
__name(handlePlan, "handlePlan");
async function handleFederation(_request, env) {
  const realms = [
    {
      name: "Omniversal Media LLC",
      role: "Aether Core",
      domains: ["omniversalmedia.llc", "omniversalmedia.cc", "omniversalmedia.info", "omniversalmedia.org", "omniversalmedia.net", "omniversalmediasolutions.com"],
      description: "Central intelligence layer. Provides infrastructure, AI systems, compliance scaffolding, merchandising, and federated intelligence protocols to all sovereign realms.",
      tier: "core"
    },
    {
      name: "Omniversal Media Productions LLC",
      role: "Sovereign Realm",
      domains: ["omniversalmedia.art"],
      description: "Music, label operations, merch, distribution, and artistic output.",
      tier: "sovereign"
    },
    {
      name: "Rebuilding Roots LLC",
      role: "Sovereign Realm",
      domains: ["rebuilding-roots.com"],
      description: "Creative operations, community initiatives, and narrative development.",
      tier: "sovereign"
    },
    {
      name: "Aether Intelligence LLC",
      role: "Sovereign Realm",
      domains: ["aetherintelligence.net", "aetheranalysis.com"],
      description: "Advanced research, AI-aligned systems, and mythic computation.",
      tier: "sovereign"
    },
    {
      name: "EverLightOS LLC",
      role: "Sovereign Realm",
      domains: ["everlightos.com", "everlightos.net"],
      description: "Terminal interfaces, federated storytelling, and Aether protocols.",
      tier: "sovereign"
    },
    {
      name: "The Sentinel Framework LLC",
      role: "Sovereign Realm",
      domains: ["thesentinelframework.com"],
      description: "Security, guardianship, structural integrity, and oversight across the federation.",
      tier: "sovereign"
    },
    {
      name: "The Celtic Key LLC",
      role: "Sovereign Realm",
      domains: ["theceltickey.com"],
      description: "Symbolic systems, mythic encryption, and cultural resonance.",
      tier: "sovereign"
    },
    {
      name: "Aether Agency",
      role: "Sovereign Realm",
      domains: ["aetheragency.online"],
      description: "Operational outreach and external-facing services for the federation.",
      tier: "sovereign"
    }
  ];
  return new Response(JSON.stringify({ realms, console_host: "rancher.everlightos.com" }, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*"
    }
  });
}
__name(handleFederation, "handleFederation");
async function callAnthropic(args) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: args.model,
      system: args.system,
      max_tokens: args.maxTokens,
      messages: args.messages
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Anthropic request failed (${res.status})`);
  }
  const text = Array.isArray(data?.content) ? data.content.filter((part) => part?.type === "text").map((part) => part.text).join("\n") : "";
  return text || "No response received.";
}
__name(callAnthropic, "callAnthropic");
function normalizeHistory(input) {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.map((item) => ({
    role: item?.role === "assistant" ? "assistant" : "user",
    content: typeof item?.content === "string" ? item.content : ""
  })).filter((item) => item.content.trim().length > 0);
}
__name(normalizeHistory, "normalizeHistory");
function normalizeSession(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    domain: typeof source.domain === "string" ? source.domain : void 0,
    scopes: Array.isArray(source.scopes) ? source.scopes.filter((x) => typeof x === "string") : [],
    mode: typeof source.mode === "string" ? source.mode : "plan",
    token_present: Boolean(source.token_present),
    accountId_present: Boolean(source.accountId_present)
  };
}
__name(normalizeSession, "normalizeSession");
async function safeJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(safeJson, "safeJson");
function json(payload, request, env, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...corsHeaders(request, env)
    }
  });
}
__name(json, "json");
function corsHeaders(request, env) {
  const requestOrigin = request.headers.get("origin") || "*";
  const allowed = env.ALLOWED_ORIGIN || requestOrigin || "*";
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "vary": "origin"
  };
}
__name(corsHeaders, "corsHeaders");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-TBchag/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-TBchag/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
