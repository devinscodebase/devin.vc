/*
  Pure derivation logic for the /training/{slug} landing page.

  The landing template is CMS-driven: copy + which animation plays + showcase
  specimens all come from Sanity. The animation *implementations* stay in code
  (compiled Astro/Svelte islands), so the CMS stores an identifier that resolves
  to a component via a registry (see `[slug].astro`). These helpers turn the raw
  Sanity fields into render-ready values, with title-derived fallbacks and
  graceful degradation when a referenced visual doesn't exist in code.

  Kept in its own module (not inline in the .astro frontmatter) so it can be
  unit-tested — Astro component frontmatter isn't importable by the test runner.
*/

// Canonical set of term names that have a visual in TermVisual.astro. Single
// source of truth: both [slug].astro (stat + showcase validation) and
// TermVisual.astro (render conditional) import this, so they can't drift.
export const VISUAL_TERMS: ReadonlySet<string> = new Set([
  // Anatomy
  'Ad Copy', 'Storyboard', 'UTM Parameter', 'Landing Page', 'Pod',
  // Format
  'Ad Format', 'TV Spot', 'Full-Page Ad', 'Spread', 'Classified', 'Bleed', 'Above the Fold (Print)',
  // Time
  'Daypart', 'Primetime', 'Hook',
  // Channels
  'Search Ads', 'Display Ads', 'Native Ads', 'Connected TV (CTV)', 'Out-of-Home (OOH)',
  // Targeting
  'Demographics', 'Geo-Targeting', 'Lookalike Audience', 'Cold vs. Warm Audience',
  // Metrics
  'Reach', 'Frequency', 'Impression',
  'Click-Through Rate (CTR)', 'Cost Per Click (CPC)', 'Cost Per Thousand (CPM)',
  'Conversion Rate', 'Return on Ad Spend (ROAS)', 'Cost Per Acquisition (CPA)',
  // Journey
  'Attribution', 'Last-Click Attribution', 'First-Click Attribution',
  'Retargeting (Remarketing)', 'Tracking Pixel', 'A/B Test',
  // Quality
  'Headline', 'Call to Action (CTA)', 'Social Proof',
]);

// Visual term set for the SEO Word List. Kept separate from the advertising
// set because term names can collide across lists ("Click-Through Rate (CTR)"
// exists in both) and each list ships its own, context-specific visual. The
// per-asset dispatch in TermVisual.astro reads the matching set via
// `visualTermsFor`.
export const VISUAL_TERMS_SEO: ReadonlySet<string> = new Set([
  // Fundamentals
  'SERP (Search Engine Results Page)', 'Crawler (Bot, Spider)', 'Indexing', 'AI Overview (SGE)',
  // On-page
  'Title Tag', 'H1', 'URL Slug', 'Alt Text', 'Internal Link', 'Anchor Text',
  // Technical
  'Sitemap (XML Sitemap)', 'Robots.txt', 'Canonical Tag', '301 Redirect',
  'Core Web Vitals', 'Mobile-First Indexing', 'Schema Markup (Structured Data)',
  // Keywords & intent
  'Long-Tail Keyword', 'Search Intent', 'Keyword Difficulty', 'Keyword Cannibalization',
  // Content
  'Topic Cluster', 'E-E-A-T', 'Thin Content',
  // Links
  'Backlink (Inbound Link)', 'Referring Domain', 'Domain Authority (DA)', 'Dofollow Link',
  // Local
  'Local Pack (Map Pack)', 'NAP (Name, Address, Phone)',
  // SERP features
  'Featured Snippet (Position Zero)', 'People Also Ask (PAA)', 'Knowledge Panel', 'Click-Through Rate (CTR)',
  // Measurement
  'Impressions', 'Pogo-Sticking',
  // Black hat
  'White Hat SEO', 'Keyword Stuffing', 'Cloaking',
]);

/** Returns the visual-term set for a given asset slug (advertising is the default). */
export function visualTermsFor(slug: string | null | undefined): ReadonlySet<string> {
  return slug === 'seo-word-list' ? VISUAL_TERMS_SEO : VISUAL_TERMS;
}

export type HeroSlideInput = { visual: string; term: string; note: string };
export type ResolvedHeroSlide<T> = { Visual: T; term: string; note: string };

/** Escapes the five HTML-significant characters for safe `set:html` output. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escapes HTML, then renders `*phrase*` as an accent `<em>`. */
export function emphasize(s: string): string {
  return escapeHtml(s).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Hero headline HTML: newline -> <br>. Falls back to the asset title. */
export function headlineHtml(
  heroHeadline: string | null | undefined,
  title: string
): string {
  return escapeHtml(heroHeadline || title).replace(/\r?\n/g, '<br />');
}

/** Hero subtitle HTML with accent emphasis and a term-count fallback. */
export function subtitleHtml(
  heroSubtitle: string | null | undefined,
  termCount: number
): string {
  return emphasize(heroSubtitle || `${termCount} terms, *clearly defined*.`);
}

/**
 * Maps CMS hero slides onto a component registry, dropping any slide whose
 * `visual` key has no registered component. The page then hides the hero
 * entirely when nothing resolves.
 */
export function resolveHeroSlides<T>(
  slides: HeroSlideInput[] | null | undefined,
  registry: Record<string, T>
): ResolvedHeroSlide<T>[] {
  return (slides ?? [])
    .map((s) => ({ Visual: registry[s.visual], term: s.term, note: s.note }))
    .filter((s): s is ResolvedHeroSlide<T> => Boolean(s.Visual));
}

/**
 * Validates the CMS showcase specimens against the terms that actually have a
 * visual. Returns the usable lead + up to two pair terms, and whether the
 * showcase section should render at all.
 */
export function resolveShowcase(
  lead: string | null | undefined,
  pair: string[] | null | undefined,
  visualTerms: ReadonlySet<string> = VISUAL_TERMS
): { leadTerm: string | null; pairTerms: string[]; show: boolean } {
  const leadTerm = lead && visualTerms.has(lead) ? lead : null;
  const pairTerms = (pair ?? []).filter((t) => visualTerms.has(t)).slice(0, 2);
  return { leadTerm, pairTerms, show: Boolean(leadTerm) || pairTerms.length > 0 };
}

/** Count of a list's terms that have a visual (drives the "illustrated" stat). */
export function countVisualTerms(
  terms: { term: string }[],
  visualTerms: ReadonlySet<string> = VISUAL_TERMS
): number {
  return terms.filter((t) => visualTerms.has(t.term)).length;
}

export const showcaseTitleOf = (showcaseTitle?: string | null): string =>
  showcaseTitle || 'Some words are easier to show than to say';

export const categoriesTitleOf = (
  categoriesTitle: string | null | undefined,
  groupCount: number
): string => categoriesTitle || `Browse all ${groupCount} categories`;

/* ── Pitch section copy ──────────────────────────────────────────────────
   The "why this exists" statement and the "who this is for" audience were
   originally hardcoded with advertising-flavored copy that bled onto every
   list. They're now CMS fields with the original advertising text as the
   fallback, so each asset can speak to its own reader. `*phrase*` -> accent
   <em>; the audience head/items are plain text. */

const DEFAULT_PITCH_STATEMENT =
  "Most glossaries explain a word using three more words you don't know either. *This one doesn't.*";

const DEFAULT_AUDIENCE_HEAD =
  'For anyone who ends up in the room without the vocabulary.';

const DEFAULT_AUDIENCE_ITEMS = [
  'The founder approving the budget',
  'The designer handed a brief',
  'Anyone who nodded along, then looked it up after',
];

/** Pitch "why this exists" statement HTML, with accent emphasis. */
export const pitchStatementHtml = (
  pitchStatement?: string | null
): string => emphasize(pitchStatement || DEFAULT_PITCH_STATEMENT);

/** "Who this is for" heading, with the advertising default as fallback. */
export const audienceHeadOf = (audienceHead?: string | null): string =>
  audienceHead || DEFAULT_AUDIENCE_HEAD;

/** "Who this is for" list items, with the advertising default as fallback. */
export const audienceItemsOf = (
  audienceItems?: (string | null | undefined)[] | null
): string[] => {
  const items = (audienceItems ?? []).map((s) => (s ?? '').trim()).filter(Boolean);
  return items.length > 0 ? items : DEFAULT_AUDIENCE_ITEMS;
};
