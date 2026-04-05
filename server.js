import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type,authorization");
  res.setHeader("Vary", "Origin");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ─── SHARED DATA ──────────────────────────────────────────────────────────────
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
  "Omniversal Media LLC is the AETHER CORE: the central intelligence layer.",
  "Each sovereign LLC maintains full autonomy while plugging into shared services.",
  "",
  "SOVEREIGN REALMS:",
  "• Rebuilding Roots LLC — Creative operations, community initiatives",
  "• Omniversal Media Productions LLC — Music, label ops, distribution",
  "• Aether Intelligence LLC — Advanced research, AI-aligned systems",
  "• EverLightOS LLC — Terminal interfaces, federated storytelling",
  "• The Sentinel Framework LLC — Security, guardianship, oversight",
  "• The Celtic Key LLC — Symbolic systems, mythic encryption",
  "• Aether Agency — Operational outreach and external-facing services",
  "",
  "SHARED SERVICES: Infrastructure, AI systems, compliance, merch pipelines,",
  "metadata/SEO, and federated intelligence architecture.",
].join("\n");

const REALMS = [
  {
    name: "Omniversal Media LLC",
    role: "Aether Core",
    domains: ["omniversalmedia.llc", "omniversalmedia.cc", "omniversalmedia.info", "omniversalmedia.org", "omniversalmedia.net", "omniversalmediasolutions.com"],
    description: "Central intelligence layer. Provides infrastructure, AI systems, compliance scaffolding, merchandising, and federated intelligence protocols.",
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
    description: "Security, guardianship, structural integrity, and oversight.",
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

// ─── HELPERS ──────────────────────────────────────────────────────────────────
async function callAnthropic({ system, messages, maxTokens }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable.");

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514";

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model, system, max_tokens: maxTokens, messages }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message ?? `Anthropic error (${response.status})`);
  }

  return Array.isArray(data?.content)
    ? data.content
        .filter((p) => p?.type === "text" && typeof p.text === "string")
        .map((p) => p.text)
        .join("\n") || "No response received."
    : "No response received.";
}

function buildChatSystem(session) {
  return [
    "You are Rancher, an expert Cloudflare operations concierge for the Omniversal Federated Network.",
    "Translate plain-language requests into precise Cloudflare operations.",
    "",
    "Priorities:",
    "1. Keep answers concise and execution-oriented.",
    "2. Identify required Cloudflare scopes and call out missing scope categories.",
    "3. Distinguish safe read-only steps from mutating steps.",
    "4. Warn before destructive actions (deletes, purges, overwrites, DNS replacement).",
    "5. If ambiguous, ask only the smallest necessary clarifying question.",
    "6. Acknowledge which realm a domain belongs to and its purpose.",
    "",
    `Session: domain=${session.domain || "not set"} | scopes=${(session.scopes || []).join(", ") || "none"} | mode=${session.mode || "plan"} | token=${Boolean(session.token_present)}`,
    "",
    "Scope mapping:",
    SCOPE_MAP,
    "",
    "Federation domain constellation:",
    OMNIVERSAL_HINTS,
    "",
    "Federation architecture:",
    FEDERATION_CONTEXT,
  ].join("\n");
}

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "cloudflare-rancher", federation: "omniversal" });
});

app.get("/api/federation", (_req, res) => {
  res.json({ realms: REALMS, console_host: "rancher.everlightos.com" });
});

app.post("/api/chat", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY secret." });
  }
  try {
    const { history = [], session = {} } = req.body ?? {};
    const messages = history
      .filter((m) => m?.content?.trim())
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    const reply = await callAnthropic({
      system: buildChatSystem(session),
      messages,
      maxTokens: 1200,
    });
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/plan", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY secret." });
  }
  try {
    const { history = [], session = {} } = req.body ?? {};
    const transcript = history
      .filter((m) => m?.content?.trim())
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const system = [
      "You are Rancher, a Cloudflare operations planner for the Omniversal Federated Network.",
      "Generate a precise, execution-ready plan. Format:",
      "",
      "OPERATION PLAN",
      "==============",
      "Target: <domain>",
      "Mode: <plan-only|execute>",
      "Required permissions: <list>",
      "",
      "STEPS:",
      "1. <action> — <command or API call>",
      "",
      "VERIFICATION:",
      "- <checks>",
      "",
      "WARNINGS:",
      "- <use ⚠ for destructive actions>",
      "",
      "NOTES:",
      "- <assumptions, missing data>",
    ].join("\n");

    const userPrompt = [
      `Session domain: ${session.domain || "not set"}`,
      `Mode: ${session.mode || "plan"}`,
      `Selected scopes: ${(session.scopes || []).join(", ") || "none"}`,
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
      system,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: 1400,
    });
    res.json({ plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── STATIC FILES (must come after API routes) ────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.get("/{*path}", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Cloudflare Rancher · Omniversal Federation Console`);
  console.log(`Listening on http://0.0.0.0:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "present" : "NOT SET"}`);
});
