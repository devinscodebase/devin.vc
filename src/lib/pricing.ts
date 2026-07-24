/*
  Quote pricing engine for /quote.

  Plain explanation of the formula, for whoever revises the numbers next:

  - Each SERVICE has a flat base price. That is what the work costs a
    typical client with no adjustments.
  - REVENUE_BANDS scale the base price up or down by a multiplier. A
    smaller business pays less for the same scope of work (0.85x under
    $500K/yr) and a larger one pays more (1.5x over $10M/yr), because the
    stakes, the number of stakeholders, and the volume of assets/pages/
    campaigns involved typically grow with the business.
  - BUNDLE_MULTIPLIER rewards buying more than one service at once: 2
    services is 0.95x, 3 is 0.92x, 4 is 0.88x, 5 is 0.85x, applied once
    across every selected line item (not stacked per service). This mirrors
    the real cost saving of not re-doing discovery/strategy work per
    engagement.
  - Strategy and research is not a line item. It is step one of every
    service here, so its cost is already inside each base price rather
    than sold separately.
  - Every line item is rounded to the nearest $10 so numbers don't look
    like a spreadsheet output. Project-type totals are then rounded to
    the nearest $50 and monthly-type totals to the nearest $25, matching
    how a human would actually quote a number.
  - Floors exist so a heavily discounted small quote never reads as
    implausibly cheap for real, custom work: $1,500 minimum for any
    project-type total, $500/mo minimum for any monthly-type total. The
    floor only applies once a service of that type is actually selected;
    selecting zero project-type services means projectTotal is legitimately
    0, not floored.

  This file is imported both server-side (src/pages/api/quote.ts, for a
  sanity re-derivation of client-submitted numbers) and client-side
  (bundled into the /quote page) so it must stay framework-free and have
  no side effects at import time.
*/

export type ServiceType = 'project' | 'monthly';

export interface Service {
  id: string;
  label: string;
  description: string;
  type: ServiceType;
  basePrice: number;
}

export const SERVICES: Service[] = [
  {
    id: 'website',
    label: 'Website Design',
    description: 'Coded from scratch, no page builders. You own the domain, the analytics, and the code.',
    type: 'project',
    basePrice: 6800,
  },
  {
    id: 'funnel',
    label: 'Funnel Building',
    description: 'The steps between the first click and the sale, built and measured.',
    type: 'project',
    basePrice: 3800,
  },
  {
    id: 'email',
    label: 'Email Marketing',
    description: 'Newsletters and follow-up for the customers you already have.',
    type: 'monthly',
    basePrice: 900,
  },
  {
    id: 'ads',
    label: 'Digital Advertising',
    description: 'Paid campaigns written and run, with revenue reported every month.',
    type: 'monthly',
    basePrice: 1200,
  },
  {
    id: 'brand',
    label: 'Brand Design',
    description: 'Logo, voice, copy, and design. You approve everything before it ships.',
    type: 'project',
    basePrice: 4200,
  },
];

export interface RevenueBand {
  id: string;
  label: string;
  multiplier: number;
}

export const REVENUE_BANDS: RevenueBand[] = [
  { id: 'under-500k', label: 'Under $500K a year', multiplier: 0.85 },
  { id: '500k-2m', label: '$500K to $2M a year', multiplier: 1.0 },
  { id: '2m-10m', label: '$2M to $10M a year', multiplier: 1.25 },
  { id: 'over-10m', label: 'More than $10M a year', multiplier: 1.5 },
];

// Discount applied once, based on TOTAL number of services selected (across
// both types combined) — not per service and not per type. Every count from 1
// to SERVICES.length needs a key: an unlisted count falls back to 1.0, which
// would make a larger bundle cost more per line than a smaller one.
export const BUNDLE_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 0.95,
  3: 0.92,
  4: 0.88,
  5: 0.85,
};

export interface QuoteLineItem {
  id: string;
  label: string;
  basePrice: number;
  adjustedPrice: number; // basePrice * revenueMultiplier * bundleMultiplier, rounded to nearest 10
}

export interface QuoteResult {
  projectTotal: number; // sum of adjusted project-type line items, rounded to nearest 50, floored at 1500 if > 0
  monthlyTotal: number; // sum of adjusted monthly-type line items, rounded to nearest 25, floored at 500 if > 0
  revenueMultiplier: number;
  bundleMultiplier: number;
  lineItems: QuoteLineItem[]; // one per selected service, in the same order as SERVICES
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

export function calculateQuote(selectedServiceIds: string[], revenueBandId: string): QuoteResult {
  const band = REVENUE_BANDS.find((b) => b.id === revenueBandId);
  if (!band) {
    throw new Error(`calculateQuote: unknown revenueBandId "${revenueBandId}"`);
  }

  const selectedCount = selectedServiceIds.length;
  const bundleMultiplier = selectedCount > 0 ? (BUNDLE_MULTIPLIER[selectedCount] ?? 1.0) : 1.0;
  const revenueMultiplier = band.multiplier;

  // Preserve SERVICES order regardless of the order ids were submitted in.
  const lineItems: QuoteLineItem[] = SERVICES.filter((s) => selectedServiceIds.includes(s.id)).map(
    (service) => ({
      id: service.id,
      label: service.label,
      basePrice: service.basePrice,
      adjustedPrice: roundTo(service.basePrice * revenueMultiplier * bundleMultiplier, 10),
    })
  );

  const projectSum = lineItems
    .filter((item) => SERVICES.find((s) => s.id === item.id)?.type === 'project')
    .reduce((sum, item) => sum + item.adjustedPrice, 0);

  const monthlySum = lineItems
    .filter((item) => SERVICES.find((s) => s.id === item.id)?.type === 'monthly')
    .reduce((sum, item) => sum + item.adjustedPrice, 0);

  let projectTotal = roundTo(projectSum, 50);
  if (projectTotal > 0 && projectTotal < 1500) projectTotal = 1500;

  let monthlyTotal = roundTo(monthlySum, 25);
  if (monthlyTotal > 0 && monthlyTotal < 500) monthlyTotal = 500;

  return {
    projectTotal,
    monthlyTotal,
    revenueMultiplier,
    bundleMultiplier,
    lineItems,
  };
}
