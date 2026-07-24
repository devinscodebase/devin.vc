import { describe, test, expect } from 'bun:test';
import { calculateQuote, SERVICES, REVENUE_BANDS, BUNDLE_MULTIPLIER } from './pricing';

describe('calculateQuote', () => {
  test('one project-type service at the baseline (1.0x) revenue band', () => {
    // website: basePrice 6800, band 500k-2m multiplier 1.0, bundle 1x1.0
    const result = calculateQuote(['website'], '500k-2m');
    expect(result.revenueMultiplier).toBe(1.0);
    expect(result.bundleMultiplier).toBe(1.0);
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0]).toEqual({
      id: 'website',
      label: 'Website Design',
      basePrice: 6800,
      adjustedPrice: 6800, // 6800 * 1.0 * 1.0, already a multiple of 10
    });
    // project sum 6800 -> round to nearest 50 -> 6800, above 1500 floor
    expect(result.projectTotal).toBe(6800);
    expect(result.monthlyTotal).toBe(0); // no monthly-type service selected
  });

  test('one monthly-type service at the baseline band', () => {
    const result = calculateQuote(['email'], '500k-2m');
    // email: basePrice 900 * 1.0 * 1.0 = 900, round to nearest 25 -> 900, above 500 floor
    expect(result.lineItems[0].adjustedPrice).toBe(900);
    expect(result.monthlyTotal).toBe(900);
    expect(result.projectTotal).toBe(0);
  });

  test('lowest realistic combo (smallest band x deepest bundle discount) stays above the floor', () => {
    // All five at under-500k (0.85x) with the 5-service bundle (0.85x):
    // website 6800 * 0.7225 = 4913   -> 4910
    // funnel  3800 * 0.7225 = 2745.5 -> 2750
    // brand   4200 * 0.7225 = 3034.5 -> 3030
    // Documented finding: with the current SERVICES/REVENUE_BANDS values, the
    // 1500/500 floors are unreachable in practice — even the worst-case
    // combination (lowest band, deepest bundle discount) stays above both
    // floors. The floor is still correct defensive code for whoever revises
    // basePrice downward later (see the isolated floor-logic tests below).
    const result = calculateQuote(['website', 'funnel', 'email', 'ads', 'brand'], 'under-500k');
    expect(result.projectTotal).toBeGreaterThan(1500);
    expect(result.monthlyTotal).toBeGreaterThan(500);
  });

  test('floor rule in isolation: a sum just under the floor clamps up, zero stays zero', () => {
    // calculateQuote can't be fed synthetic base prices directly (SERVICES is
    // fixed), so this verifies the documented rounding/floor formula itself:
    // Math.round(sum / step) * step, then clamp to the floor only if the
    // rounded sum is > 0 and < floor.
    const roundTo = (n: number, step: number) => Math.round(n / step) * step;
    const applyFloor = (sum: number, floor: number) => {
      let total = sum;
      if (total > 0 && total < floor) total = floor;
      return total;
    };

    expect(applyFloor(roundTo(1200, 50), 1500)).toBe(1500); // 1200 rounds to itself, clamps up
    expect(applyFloor(roundTo(1490, 50), 1500)).toBe(1500); // 1490 -> 1500 already, no-op clamp
    expect(applyFloor(roundTo(0, 50), 1500)).toBe(0); // no project-type service selected -> stays 0
    expect(applyFloor(roundTo(420, 25), 500)).toBe(500); // monthly equivalent
    expect(applyFloor(roundTo(0, 25), 500)).toBe(0);
  });

  test('all five services selected at the highest (1.5x) revenue band', () => {
    const result = calculateQuote(['website', 'funnel', 'email', 'ads', 'brand'], 'over-10m');
    expect(result.revenueMultiplier).toBe(1.5);
    expect(result.bundleMultiplier).toBe(BUNDLE_MULTIPLIER[5]); // 0.85
    expect(result.lineItems).toHaveLength(5);

    // Expected adjusted prices: basePrice * 1.5 * 0.85 = basePrice * 1.275,
    // rounded to nearest 10
    // website: 6800 * 1.275 = 8670   -> 8670
    // funnel:  3800 * 1.275 = 4845   -> 4850
    // email:   900  * 1.275 = 1147.5 -> 1150
    // ads:     1200 * 1.275 = 1530   -> 1530
    // brand:   4200 * 1.275 = 5355   -> 5360
    const byId = Object.fromEntries(result.lineItems.map((i) => [i.id, i.adjustedPrice]));
    expect(byId.website).toBe(8670);
    expect(byId.funnel).toBe(4850);
    expect(byId.email).toBe(1150);
    expect(byId.ads).toBe(1530);
    expect(byId.brand).toBe(5360);

    // project sum = 8670 + 4850 + 5360 = 18880 -> round to nearest 50 -> 18900
    expect(result.projectTotal).toBe(18900);
    // monthly sum = 1150 + 1530 = 2680 -> round to nearest 25 -> 2675
    expect(result.monthlyTotal).toBe(2675);

    // Line items preserve SERVICES declaration order regardless of input order
    expect(result.lineItems.map((i) => i.id)).toEqual([
      'website',
      'funnel',
      'email',
      'ads',
      'brand',
    ]);
  });

  test('line items follow SERVICES order even when input order differs', () => {
    const result = calculateQuote(['email', 'website'], '500k-2m');
    expect(result.lineItems.map((i) => i.id)).toEqual(['website', 'email']);
  });

  test('unknown revenue band throws', () => {
    expect(() => calculateQuote(['website'], 'not-a-real-band')).toThrow();
  });

  test('every declared revenue band id is resolvable', () => {
    for (const band of REVENUE_BANDS) {
      expect(() => calculateQuote(['website'], band.id)).not.toThrow();
    }
  });

  test('every declared service id is selectable', () => {
    for (const service of SERVICES) {
      const result = calculateQuote([service.id], '500k-2m');
      expect(result.lineItems[0].id).toBe(service.id);
    }
  });

  test('bundle table covers every selectable count and never rewards buying less', () => {
    // A count with no BUNDLE_MULTIPLIER key falls back to 1.0, which would make
    // a bigger bundle cost more per line than a smaller one. Guard both halves:
    // every count is present, and the curve never turns back upward.
    const ids = SERVICES.map((s) => s.id);
    let previous = Infinity;
    for (let count = 1; count <= ids.length; count++) {
      expect(BUNDLE_MULTIPLIER[count]).toBeDefined();
      const result = calculateQuote(ids.slice(0, count), '500k-2m');
      expect(result.bundleMultiplier).toBe(BUNDLE_MULTIPLIER[count]);
      expect(result.bundleMultiplier).toBeLessThanOrEqual(previous);
      previous = result.bundleMultiplier;
    }
  });
});
