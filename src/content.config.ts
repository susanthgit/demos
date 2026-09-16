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
  crossLinks: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
  ...sceneBase,
});

// Add future scene types here — they slot in without breaking existing demos.
const Scene = z.discriminatedUnion('type', [Cover, CostMeter, Closing]);

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
