import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* ============================================================
   DEMO PLATFORM — content schema (the contract)
   See files/demo-content-schema-DRAFT.md for the full spec.
   Bets: scene = discriminated union on `type` (add types forever,
   never break old demos) · truth-ledger on every demo · personas
   as data (powers ?persona= + future picker) · pure notebook (no accent).
   ============================================================ */

const Persona = z.enum(['exec', 'security', 'end-user', 'technical', 'cost']);

const TruthLedger = z.object({
  claims: z.array(z.string()).default([]),
  sources: z.array(z.string()).default([]),          // PUBLIC Microsoft links
  capturedOn: z.string().optional(),                  // screenshot/data capture date
  lastVerified: z.string(),                           // YYYY-MM-DD
  staleAfter: z.string().optional(),
  owner: z.string().default('Sush'),
  classification: z.enum(['public', 'internal']).default('public'),
});

// ---- shared per-scene fields ----
const sceneBase = {
  id: z.string().optional(),                          // deep-link anchor
  eyebrow: z.string().optional(),                     // "0X · topic" orientation line at top
  notes: z.string().optional(),                       // speaker notes
  personas: z.array(Persona).optional(),              // per-scene audience tags
  motion: z.enum(['full', 'low']).default('full'),
};

// ---- scene types (implemented in src/components/scenes/) ----
const Cover = z.object({
  type: z.literal('cover'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),                               // *word* → brass underline accent
  lead: z.string().optional(),
  why: z.object({ label: z.string(), body: z.string() }).optional(),
  signature: z.string().optional(),
  chips: z.array(z.object({ label: z.string(), color: z.string().optional() })).optional(),
  ...sceneBase,
});

const CostMeter = z.object({
  type: z.literal('costMeter'),
  kicker: z.string().optional(),
  headline: z.string(),
  model: z.string(),                                   // named model in src/models/ (no inline magic numbers)
  inputs: z.array(z.object({
    id: z.string(), label: z.string(), hint: z.string().optional(),
    min: z.number(), max: z.number(), step: z.number().default(1), default: z.number(),
  })),
  baselines: z.array(z.enum(['flatSeat', 'analystHours'])).default(['flatSeat', 'analystHours']),
  disclaimer: z.string().default('Illustrative only — not Microsoft pricing or a quote.'),
  ...sceneBase,
});

const Closing = z.object({
  type: z.literal('closing'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  pillars: z.array(z.object({ name: z.string(), body: z.string() })).optional(),  // slide 13 bridge
  crossLinks: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  ...sceneBase,
});

// Big-font connective tissue / section divider — one statement, almost no other text.
// The "slow build" device (mirrors MS slide 3 = one sentence, slide 13 = three words).
const Statement = z.object({
  type: z.literal('statement'),
  eyebrow: z.string().optional(),
  title: z.string().optional(),                        // big PPT title pinned to the top
  kicker: z.string().optional(),
  text: z.string(),                                    // the big line (*brass* / _navy italic_)
  sub: z.string().optional(),                          // one small supporting line, optional
  aside: z.enum(['meter', 'spectrum', 'split']).optional(),  // optional hand-drawn right-side visual
  asideCaption: z.string().optional(),
  ...sceneBase,
});

// Plan-your-spend estimator (slide 10) — interactive: users × prompts × profile → monthly cost.
const Estimator = z.object({
  type: z.literal('estimator'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  users: z.object({ default: z.number(), min: z.number(), max: z.number(), step: z.number().default(50) }),
  prompts: z.object({ default: z.number(), min: z.number(), max: z.number(), step: z.number().default(5) }),
  profiles: z.array(z.object({
    id: z.string(), label: z.string(), color: z.string(), creditsPerPrompt: z.number(),
  })).min(2),
  presets: z.array(z.object({ label: z.string(), users: z.number() })).optional(),
  analogy: z.string().optional(),
  disclaimer: z.string().default('Illustrative — plug in your own numbers. Not a quote.'),
  ...sceneBase,
});

// Real scenarios → Cowork cost (slide 12, Cowork-only — no competitor column).
const PricingExamples = z.object({
  type: z.literal('pricingExamples'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  rows: z.array(z.object({
    size: z.string(), color: z.string(), scenario: z.string(), range: z.string(),
  })).min(1),
  note: z.string().optional(),
  ...sceneBase,
});

// A realistic (original, notebook-styled) Cowork chat window — used to show `/cost` for real.
const CoworkChat = z.object({
  type: z.literal('coworkChat'),
  kicker: z.string().optional(),
  headline: z.string(),
  appName: z.string().default('Microsoft 365 Copilot'),
  thread: z.array(z.object({
    who: z.enum(['user', 'agent']),
    text: z.string().optional(),
    steps: z.array(z.string()).optional(),                 // a ticked "workspace plan" (the agent's plan)
    chips: z.array(z.string()).optional(),                 // deliverable chips
    checkpoint: z.object({ label: z.string(), sub: z.string().optional() }).optional(),  // human-in-the-loop approve moment
    cost: z.object({ credits: z.string(), note: z.string() }).optional(),  // the /cost reply
  })),
  note: z.string().optional(),
  ...sceneBase,
});

// Two ways to buy credits — a clean 2-card comparison (reimagined from the row table) + analogy.
const BuyOptions = z.object({
  type: z.literal('buyOptions'),
  kicker: z.string().optional(),
  headline: z.string(),
  options: z.array(z.object({
    tag: z.string(),
    name: z.string(),
    icon: z.enum(['meter', 'bundle']),
    price: z.string(),
    bestFor: z.string(),
    points: z.array(z.string()).default([]),
    tone: z.enum(['flex', 'save']),
  })).length(2),
  analogy: z.object({ tag: z.string(), text: z.string() }).optional(),
  ...sceneBase,
});

// Which prepaid plan funds Cowork — a table of plan types + a red gotcha callout.
const PlanTable = z.object({
  type: z.literal('planTable'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  rows: z.array(z.object({
    plan: z.string(),
    covers: z.string(),
    cowork: z.enum(['yes', 'no', 'both']),
    note: z.string().optional(),
    highlight: z.boolean().default(false),
  })),
  gotcha: z.string().optional(),
  note: z.string().optional(),
  ...sceneBase,
});

const Compare = z.object({
  type: z.literal('compare'),
  kicker: z.string().optional(),
  headline: z.string(),
  columns: z.array(z.object({ name: z.string() })).length(2),   // [left, right]
  rows: z.array(z.object({
    label: z.string(),
    a: z.string(),                                              // left cell
    b: z.string(),                                              // right cell
    winner: z.enum(['a', 'b', 'both']).optional(),             // brass tick
    why: z.string().optional(),                                 // click-to-reveal aside
  })),
  rule: z.object({ label: z.string(), body: z.string() }).optional(),  // rule-of-thumb card
  ...sceneBase,
});

// Two-part bill: a predictable part + a variable part.
const TwoPart = z.object({
  type: z.literal('twoPart'),
  kicker: z.string().optional(),
  headline: z.string(),
  parts: z.array(z.object({
    tag: z.string(),
    label: z.string(),
    sub: z.string(),
    price: z.string().optional(),
    kind: z.enum(['fixed', 'variable']),
    items: z.array(z.string()).default([]),
  })).length(2),
  rule: z.object({ label: z.string(), body: z.string() }).optional(),
  analogy: z.object({
    tag: z.string(),
    seat: z.string(),
    usage: z.string(),
  }).optional(),
  ...sceneBase,
});

// Single concept with a big stat and/or a terminal-style reveal (used for "what's a credit" + /cost).
const Concept = z.object({
  type: z.literal('concept'),
  kicker: z.string().optional(),
  headline: z.string(),
  stat: z.object({ value: z.string(), label: z.string() }).optional(),
  body: z.string().optional(),
  tip: z.string().optional(),                          // red handwriting margin tip
  terminal: z.object({ prompt: z.string(), reply: z.string() }).optional(),
  ...sceneBase,
});

// THE interactive hero: a task's credits built from 4 inputs, + a "real task" annotated mode.
const CreditBuilder = z.object({
  type: z.literal('creditBuilder'),
  kicker: z.string().optional(),
  headline: z.string(),
  inputs: z.array(z.object({
    id: z.string(),
    label: z.string(),
    color: z.string(),
    desc: z.string(),
    levels: z.array(z.number()).length(3),   // [low, mid, high] credit contribution
  })).length(4),
  task: z.object({
    intro: z.string(),
    fragments: z.array(z.object({ text: z.string(), input: z.string().optional() })),
  }).optional(),
  presets: z.array(z.object({
    label: z.string(),
    levels: z.array(z.number()).length(4),   // [models, context, tools, runtime] each 0/1/2
  })).optional(),
  analogyNote: z.string().optional(),
  disclaimer: z.string().default('Illustrative — credits vary by model, context, tools and runtime.'),
  ...sceneBase,
});

// Why usage-based — the stage-setter (slide 3). AI work isn't uniform; a spectrum
// of task sizes shows why one flat price can't fairly cover both light and heavy work.
const WhyUsage = z.object({
  type: z.literal('whyUsage'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  spectrum: z.object({
    lowLabel: z.string(),
    highLabel: z.string(),
    steps: z.array(z.object({ label: z.string(), weight: z.number() })).min(2),
  }),
  footer: z.string().optional(),                       // red-ink cost-link line
  takeaway: z.object({ label: z.string(), body: z.string() }).optional(),
  ...sceneBase,
});

// Two pricing philosophies (slide 4) — meter-everything vs predictable-seat-plus-usage.
// NEUTRAL + public-safe: the competitor is unnamed; the teaching point is the contrast.
const Philosophies = z.object({
  type: z.literal('philosophies'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  options: z.array(z.object({
    tag: z.string(),
    name: z.string(),
    line: z.string(),
    rows: z.array(z.object({ label: z.string(), metered: z.boolean() })),
    takeaway: z.string(),
    tone: z.enum(['watch', 'good']).default('watch'),
  })).length(2),
  rule: z.object({ label: z.string(), body: z.string() }).optional(),
  analogy: z.string().optional(),
  ...sceneBase,
});

// Differentiators (slide 6) — a build-up of N points (what makes Cowork different).
const Differentiators = z.object({
  type: z.literal('differentiators'),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  points: z.array(z.object({
    title: z.string(),
    body: z.string(),
    example: z.string().optional(),
    pills: z.array(z.string()).optional(),             // e.g. model pills
    color: z.string().optional(),
    icon: z.enum(['cloud', 'iq', 'shield', 'models', 'cost']).optional(),
  })).min(2),
  callout: z.string().optional(),                      // red handwriting reframe at the bottom
  note: z.string().optional(),
  ...sceneBase,
});

// Light / Medium / Heavy task tiers.
const Tiers = z.object({
  type: z.literal('tiers'),
  kicker: z.string().optional(),
  headline: z.string(),
  tiers: z.array(z.object({
    name: z.string(),
    color: z.string(),
    traits: z.array(z.string()),
    example: z.string(),
    credits: z.string(),
    dollars: z.string().optional(),
  })),
  note: z.string().optional(),
  analogy: z.string().optional(),
  ...sceneBase,
});

// THE product-story hero (Meet Cowork): messy sources IN -> plan/reconcile/execute -> a decision pack OUT.
// Interactive: a "Delegate it" button plays the flow; replays each time the scene lands.
const AgentLoop = z.object({
  type: z.literal('agentLoop'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  inbox: z.object({ label: z.string(), items: z.array(z.string()).min(1) }),       // the messy sources
  steps: z.array(z.object({ label: z.string(), desc: z.string() })).min(2),         // plan / reconcile / execute
  outbox: z.object({ label: z.string(), items: z.array(z.string()).min(1) }),       // the decision pack
  moves: z.array(z.object({ tag: z.string(), text: z.string() })).optional(),       // "your part = 3 moves"
  boundary: z.string().optional(),                                                  // "...all inside your M365 tenant"
  runLabel: z.string().default('Delegate it'),
  analogy: z.string().optional(),
  disclaimer: z.string().default('Illustrative — your sources, steps and deliverables will differ.'),
  ...sceneBase,
});

// Where Cowork fits — a maturity/value ladder (Assist -> Advise -> Coordinate[here] -> Operate),
// plotted as effort-to-deploy (x) vs business-impact (y). One stage is flagged "you are here".
const ValueCurve = z.object({
  type: z.literal('valueCurve'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  xLabel: z.string().default('effort to deploy →'),
  yLabel: z.string().default('business impact →'),
  stages: z.array(z.object({
    name: z.string(),
    sub: z.string().optional(),
    roi: z.string().optional(),
    here: z.boolean().default(false),
  })).min(2),
  footer: z.string().optional(),
  analogy: z.string().optional(),
  ...sceneBase,
});

// Skills + plugins — grouped chips (built-in skills | plugins & connectors | your own custom skills).
const SkillsGrid = z.object({
  type: z.literal('skillsGrid'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  groups: z.array(z.object({
    label: z.string(),
    color: z.string().optional(),
    icon: z.enum(['builtin', 'plug', 'custom']).optional(),
    chips: z.array(z.string()).min(1),
  })).min(1),
  note: z.string().optional(),
  analogy: z.string().optional(),
  ...sceneBase,
});

// How it's wired — an original notebook architecture diagram (runtime + sandbox + models + Work IQ +
// your apps + plugins), all inside the M365 tenant boundary. Rebuilt from the public architecture slide.
const Architecture = z.object({
  type: z.literal('architecture'),
  eyebrow: z.string().optional(),
  kicker: z.string().optional(),
  headline: z.string(),
  lead: z.string().optional(),
  ui: z.object({ label: z.string(), sub: z.string().optional() }),
  runtime: z.object({ label: z.string(), items: z.array(z.string()).default([]) }),
  sandbox: z.object({ label: z.string(), items: z.array(z.string()).default([]) }),
  security: z.string().optional(),
  models: z.object({ label: z.string(), items: z.array(z.string()).default([]) }),
  context: z.object({ label: z.string(), items: z.array(z.string()).default([]) }),  // Work IQ
  services: z.array(z.string()).default([]),                                          // Outlook/Teams/SharePoint...
  plugins: z.array(z.string()).default([]),                                           // 3rd-party / MCP connectors
  boundary: z.string().optional(),
  analogy: z.string().optional(),
  ...sceneBase,
});

// Add future scene types here — they slot in without breaking existing demos.
const Scene = z.discriminatedUnion('type', [
  Cover, CostMeter, Compare, TwoPart, Concept, CreditBuilder, Tiers, Closing,
  WhyUsage, Philosophies, Differentiators, Statement, Estimator, PricingExamples, CoworkChat,
  BuyOptions, PlanTable,
  AgentLoop, ValueCurve, SkillsGrid, Architecture,
]);

const demos = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/demos' }),
  schema: z.object({
    topic: z.string(),
    title: z.string(),
    blurb: z.string(),
    order: z.number().default(0),
    durationMin: z.number().optional(),
    modality: z.enum(['explainer', 'annotated', 'scenario']).default('explainer'),
    note: z.string().optional(),
    personas: z.array(Persona).default([]),
    visibility: z.enum(['indexed', 'noindex', 'private']).default('noindex'),
    presenterChecklist: z.array(z.string()).optional(),
    ledger: TruthLedger,
    scenes: z.array(Scene).min(1),
  }),
});

/* ============================================================
   RUNSHEETS — presenter reference, not a stage deck.
   A demo is what the ROOM sees: fullscreen, one idea at a time.
   A runsheet is what SUSH reads while presenting: dense, scannable,
   copy-paste prompts, verified control numbers, recovery lines.
   Different job, so a different content type and layout — same portal,
   same notebook look.

   Blocks use the same discriminated-union bet as scenes: add block types
   forever, never break an existing runsheet.
   ============================================================ */

const Say = z.object({
  type: z.literal('say'),
  body: z.string(),                                   // the line to actually say out loud
  attrib: z.string().optional(),
});

const Prompt = z.object({
  type: z.literal('prompt'),
  label: z.string().default('Copy prompt'),
  body: z.string(),                                   // copied verbatim
  note: z.string().optional(),                        // e.g. attach the skill first
  // Some hosts submit on Enter, so a pasted prompt with blank lines is truncated
  // at the first break. When true the UI warns and copies as a single block.
  oneBlock: z.boolean().default(true),
});

const Steps = z.object({
  type: z.literal('steps'),
  title: z.string().optional(),
  ordered: z.boolean().default(true),
  items: z.array(z.string()).min(1),
});

const TableBlock = z.object({
  type: z.literal('table'),
  caption: z.string().optional(),
  head: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  numeric: z.array(z.number()).default([]),           // 0-based columns to right-align
  foot: z.string().optional(),
});

const Points = z.object({
  type: z.literal('points'),
  title: z.string().optional(),
  items: z.array(z.object({ label: z.string(), body: z.string() })).min(1),
});

const Callout = z.object({
  type: z.literal('callout'),
  kind: z.enum(['note', 'warn', 'win', 'verified']).default('note'),
  title: z.string().optional(),
  body: z.string(),
});

const Block = z.discriminatedUnion('type', [Say, Prompt, Steps, TableBlock, Points, Callout]);

const RunsheetSection = z.object({
  n: z.string(),                                      // "1", "2", "Fallback" — free text on purpose
  title: z.string(),
  mode: z.string().optional(),                        // the host mode to select, e.g. "Chat only"
  where: z.string().optional(),                       // sheet / file / screen to be on
  minutes: z.number().optional(),
  // Sush presents by pivoting on the room. Anchors are the spine you never cut;
  // pivot sections are the optional branches you reach for when asked.
  anchor: z.boolean().default(false),
  pivot: z.boolean().default(false),
  verifiedOn: z.string().optional(),                  // proven live on this date
  blocks: z.array(Block).default([]),
});

// "If they ask X → go to section Y." Read the room, don't read a script.
const PivotRule = z.object({
  trigger: z.string(),
  goto: z.string(),
  why: z.string().optional(),
});

const runsheets = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/runsheets' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string(),
    order: z.number().default(0),
    durationMin: z.number().optional(),
    topic: z.string().optional(),                     // reuses TOPICS ids when it fits
    audience: z.string().optional(),
    note: z.string().optional(),
    visibility: z.enum(['indexed', 'noindex', 'private']).default('noindex'),
    files: z.array(z.object({
      name: z.string(), what: z.string(), where: z.string().optional(),
    })).default([]),
    preflight: z.array(z.string()).default([]),
    gotchas: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
    pivots: z.array(PivotRule).default([]),
    recovery: z.array(z.object({ when: z.string(), then: z.string() })).default([]),
    ledger: TruthLedger,
    sections: z.array(RunsheetSection).min(1),
  }),
});

export const collections = { demos, runsheets };
