/* ============================================================
   CATALOG — topics + planned-demo roadmap.
   The homepage merges BUILT demos (from the content collection, status=ready)
   with these PLANNED teasers (status=soon) so the catalog looks alive and shows
   the pipeline from day one. When a planned demo gets built as MDX, it auto-
   becomes "ready" (matched by topic+slug) and starts linking through — delete
   its PLANNED row at that point (or leave it; the matcher dedupes by slug).
   ============================================================ */

export interface Topic {
  id: string;
  label: string;
  tagline: string;
  order: number;
}

export interface PlannedDemo {
  topic: string;
  slug: string;
  title: string;
  blurb: string;
  modality: 'explainer' | 'annotated' | 'scenario';
  personas: string[];
  durationMin?: number;
}

export const TOPICS: Topic[] = [
  { id: 'cowork',       label: 'Cowork',             tagline: 'The multi-source AI coworker',          order: 1 },
  { id: 'scout',        label: 'Scout',              tagline: 'Agentic research & reasoning',          order: 2 },
  { id: 'copilot-l100', label: 'Copilot L100',       tagline: 'Foundations for every audience',        order: 3 },
  { id: 'prompting',    label: 'Prompt Engineering', tagline: 'Getting more from every prompt',        order: 4 },
];

// Human labels for the filter UI
export const PERSONA_LABELS: Record<string, string> = {
  exec: 'Executive',
  security: 'Security',
  'end-user': 'End-user',
  technical: 'Technical',
  cost: 'Cost / FinOps',
};

export const MODALITY_LABELS: Record<string, string> = {
  explainer: 'Explainer',
  annotated: 'Annotated tour',
  scenario: 'Scenario replay',
};

// Roadmap teasers — not yet built. Shown as "soon", non-clickable.
export const PLANNED: PlannedDemo[] = [
  { topic: 'cowork', slug: 'meet-cowork', title: 'Meet Cowork',
    blurb: 'The 90-second “what is it and why” for any room.', modality: 'explainer',
    personas: ['exec', 'end-user'], durationMin: 2 },
  { topic: 'cowork', slug: 'cowork-vs-copilot', title: 'Cowork vs Copilot',
    blurb: 'The decision rule — when to reach for which, with the audience lens.', modality: 'explainer',
    personas: ['exec', 'end-user', 'technical'], durationMin: 4 },
  { topic: 'cowork', slug: 'researcher-run', title: 'Researcher run',
    blurb: 'A captured run: prompt → reasoning → cited brief, paced by you.', modality: 'scenario',
    personas: ['end-user', 'technical'], durationMin: 6 },
  { topic: 'cowork', slug: 'analyst-run', title: 'Analyst run',
    blurb: 'Messy spreadsheet in → board-ready tables out.', modality: 'scenario',
    personas: ['exec', 'cost'], durationMin: 6 },
  { topic: 'cowork', slug: 'admin-tour', title: 'Admin & controls tour',
    blurb: 'Annotated walkthrough of spend caps, in-tenant data and audit.', modality: 'annotated',
    personas: ['security', 'cost'], durationMin: 5 },
  { topic: 'scout', slug: 'meet-scout', title: 'Meet Scout',
    blurb: 'What agentic research looks like — and where it fits.', modality: 'explainer',
    personas: ['exec', 'technical'], durationMin: 3 },
  { topic: 'copilot-l100', slug: 'copilot-foundations', title: 'Copilot foundations',
    blurb: 'The level-set: what Copilot is, in plain language.', modality: 'explainer',
    personas: ['exec', 'end-user'], durationMin: 5 },
  { topic: 'prompting', slug: 'prompt-patterns', title: 'Prompt patterns',
    blurb: 'The handful of patterns that get better answers, shown live.', modality: 'explainer',
    personas: ['end-user', 'technical'], durationMin: 5 },
];
