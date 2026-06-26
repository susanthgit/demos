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
    personas: z.array(Persona).default([]),
    visibility: z.enum(['indexed', 'noindex', 'private']).default('noindex'),
    presenterChecklist: z.array(z.string()).optional(),
    ledger: TruthLedger,
    scenes: z.array(Scene).min(1),
  }),
});

export const collections = { demos };
