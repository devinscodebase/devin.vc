import { describe, test, expect } from 'bun:test';
import {
  fmtCurrency, fmtNum, fmtPercent, formatWithCommas,
  parseRawNumber, abbreviateTarget, calculateGtmResults
} from './gtm-planner-utils.js';

// ── Formatting helpers ──

describe('fmtCurrency', () => {
  test('formats USD with no decimals', () => {
    expect(fmtCurrency(1000)).toBe('$1,000');
  });

  test('formats large numbers', () => {
    expect(fmtCurrency(1_500_000)).toBe('$1,500,000');
  });

  test('returns em dash for null', () => {
    expect(fmtCurrency(null)).toBe('\u2014');
  });

  test('returns em dash for undefined', () => {
    expect(fmtCurrency(undefined)).toBe('\u2014');
  });

  test('formats zero', () => {
    expect(fmtCurrency(0)).toBe('$0');
  });
});

describe('fmtNum', () => {
  test('formats with default 1 decimal', () => {
    expect(fmtNum(3.456)).toBe('3.5');
  });

  test('formats with 0 decimals', () => {
    expect(fmtNum(1234.5, 0)).toBe('1,235');
  });

  test('drops trailing zeros', () => {
    expect(fmtNum(10.0, 1)).toBe('10');
  });

  test('returns em dash for null', () => {
    expect(fmtNum(null)).toBe('\u2014');
  });

  test('formats large numbers with commas', () => {
    expect(fmtNum(50000, 0)).toBe('50,000');
  });
});

describe('fmtPercent', () => {
  test('formats with one decimal and % sign', () => {
    expect(fmtPercent(25.678)).toBe('25.7%');
  });

  test('keeps trailing zero', () => {
    expect(fmtPercent(10)).toBe('10.0%');
  });

  test('returns em dash for null', () => {
    expect(fmtPercent(null)).toBe('\u2014');
  });
});

describe('formatWithCommas', () => {
  test('adds commas to large numbers', () => {
    expect(formatWithCommas(1000000)).toBe('1,000,000');
  });

  test('returns empty string for null', () => {
    expect(formatWithCommas(null)).toBe('');
  });

  test('returns empty string for empty string', () => {
    expect(formatWithCommas('')).toBe('');
  });

  test('handles small numbers', () => {
    expect(formatWithCommas(42)).toBe('42');
  });
});

describe('parseRawNumber', () => {
  test('parses plain number string', () => {
    expect(parseRawNumber('1234')).toBe(1234);
  });

  test('strips commas and dollar signs', () => {
    expect(parseRawNumber('$1,234,567')).toBe(1234567);
  });

  test('handles decimals', () => {
    expect(parseRawNumber('99.5')).toBe(99.5);
  });

  test('returns null for empty string', () => {
    expect(parseRawNumber('')).toBeNull();
  });

  test('returns null for null', () => {
    expect(parseRawNumber(null)).toBeNull();
  });

  test('returns null for non-numeric string', () => {
    expect(parseRawNumber('abc')).toBeNull();
  });
});

describe('abbreviateTarget', () => {
  test('abbreviates billions', () => {
    expect(abbreviateTarget(1_000_000_000)).toBe('$1B');
  });

  test('abbreviates billions with decimals', () => {
    expect(abbreviateTarget(2_500_000_000)).toBe('$2.5B');
  });

  test('abbreviates millions', () => {
    expect(abbreviateTarget(1_000_000)).toBe('$1M');
  });

  test('abbreviates millions with decimals', () => {
    expect(abbreviateTarget(11_100_000)).toBe('$11.1M');
  });

  test('abbreviates thousands', () => {
    expect(abbreviateTarget(500_000)).toBe('$500K');
  });

  test('abbreviates exact thousands', () => {
    expect(abbreviateTarget(100_000)).toBe('$100K');
  });

  test('small numbers pass through', () => {
    expect(abbreviateTarget(500)).toBe('$500');
  });
});

// ── Calculation engine ──

const defaultInputs = {
  revenueTarget: 1_000_000,
  dealSize: 10_000,
  isRecurring: false,
  salesCycle: 90,
  closeRate: 25,
  sqlToOpp: 50,
  leadToSql: 20,
  costPerLead: 100,
  grossMargin: 70,
  customerLifespan: null,
};

describe('calculateGtmResults', () => {
  test('returns null when revenueTarget is 0', () => {
    expect(calculateGtmResults({ ...defaultInputs, revenueTarget: 0 })).toBeNull();
  });

  test('returns null when dealSize is 0', () => {
    expect(calculateGtmResults({ ...defaultInputs, dealSize: 0 })).toBeNull();
  });

  test('returns null when costPerLead is 0', () => {
    expect(calculateGtmResults({ ...defaultInputs, costPerLead: 0 })).toBeNull();
  });

  test('returns null for recurring model without lifespan', () => {
    expect(calculateGtmResults({ ...defaultInputs, isRecurring: true, customerLifespan: 0 })).toBeNull();
  });

  test('calculates correct deals per year for one-time model', () => {
    const r = calculateGtmResults(defaultInputs);
    // $1M / $10K = 100 deals
    expect(r.dealsPerYear).toBe(100);
  });

  test('calculates correct deals per year for recurring model', () => {
    const r = calculateGtmResults({
      ...defaultInputs,
      isRecurring: true,
      dealSize: 1000, // $1000/mo MCV = $12,000/year effective
      customerLifespan: 24,
    });
    // $1M / $12,000 = 83.33 deals
    expect(r.dealsPerYear).toBeCloseTo(83.33, 1);
  });

  test('effective deal value is annualized for recurring', () => {
    const r = calculateGtmResults({
      ...defaultInputs,
      isRecurring: true,
      dealSize: 500,
      customerLifespan: 12,
    });
    expect(r.effectiveDealValue).toBe(6000); // 500 * 12
  });

  test('effective deal value equals dealSize for one-time', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.effectiveDealValue).toBe(10_000);
  });

  test('funnel math cascades correctly', () => {
    const r = calculateGtmResults(defaultInputs);
    // 100 deals/year = 8.33/month
    expect(r.dealsPerMonth).toBeCloseTo(8.33, 1);
    // 8.33 / 0.25 = 33.33 opps/month
    expect(r.oppsPerMonth).toBeCloseTo(33.33, 1);
    // 33.33 / 0.50 = 66.67 SQLs/month
    expect(r.sqlsPerMonth).toBeCloseTo(66.67, 1);
    // 66.67 / 0.20 = 333.33 leads/month
    expect(r.leadsPerMonth).toBeCloseTo(333.33, 1);
  });

  test('weekly numbers are monthly / 4.33', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.leadsPerWeek).toBeCloseTo(r.leadsPerMonth / 4.33, 2);
    expect(r.sqlsPerWeek).toBeCloseTo(r.sqlsPerMonth / 4.33, 2);
    expect(r.oppsPerWeek).toBeCloseTo(r.oppsPerMonth / 4.33, 2);
  });

  test('daily leads is monthly / 21.7', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.leadsPerDay).toBeCloseTo(r.leadsPerMonth / 21.7, 2);
  });

  test('monthly budget = leads * CPL', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.monthlyBudget).toBeCloseTo(r.leadsPerMonth * 100, 2);
  });

  test('annual budget = monthly * 12', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.annualBudget).toBeCloseTo(r.monthlyBudget * 12, 2);
  });

  test('spend percent is annual budget / revenue * 100', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.spendPercent).toBeCloseTo((r.annualBudget / 1_000_000) * 100, 2);
  });

  test('full funnel rate is product of conversion rates', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.fullFunnelRate).toBeCloseTo(0.20 * 0.50 * 0.25, 6);
  });

  test('CAC = CPL / full funnel rate', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.cac).toBeCloseTo(100 / (0.20 * 0.50 * 0.25), 2);
  });

  test('LTV for one-time = dealSize * margin', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.ltv).toBe(10_000 * 0.70);
  });

  test('LTV for recurring = MCV * lifespan * margin', () => {
    const r = calculateGtmResults({
      ...defaultInputs,
      isRecurring: true,
      dealSize: 1000,
      customerLifespan: 24,
      grossMargin: 80,
    });
    expect(r.ltv).toBe(1000 * 24 * 0.80);
  });

  test('LTV:CAC ratio is ltv / cac', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.ltvCacRatio).toBeCloseTo(r.ltv / r.cac, 4);
  });

  // ── Health classifications ──

  test('ltvCacHealth is warning when ratio < 3', () => {
    // High CPL to push CAC up and ratio down
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 2000 });
    expect(r.ltvCacHealth).toBe('warning');
  });

  test('ltvCacHealth is healthy when ratio between 3 and 5', () => {
    const r = calculateGtmResults(defaultInputs);
    // With defaults: LTV = 7000, CAC = 4000, ratio ~1.75 -> that's warning
    // Need to adjust to get 3-5 range
    const r2 = calculateGtmResults({ ...defaultInputs, costPerLead: 40 });
    expect(r2.ltvCacRatio).toBeGreaterThanOrEqual(3);
    expect(r2.ltvCacRatio).toBeLessThanOrEqual(5);
    expect(r2.ltvCacHealth).toBe('healthy');
  });

  test('ltvCacHealth is strong when ratio > 5', () => {
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 10 });
    expect(r.ltvCacRatio).toBeGreaterThan(5);
    expect(r.ltvCacHealth).toBe('strong');
  });

  test('spendHealth is warning when > 30%', () => {
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 500 });
    expect(r.spendPercent).toBeGreaterThan(30);
    expect(r.spendHealth).toBe('warning');
  });

  test('spendHealth is moderate when 15-30%', () => {
    // Need to find a CPL that gives 15-30% spend
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 50 });
    expect(r.spendPercent).toBeGreaterThan(15);
    expect(r.spendPercent).toBeLessThanOrEqual(30);
    expect(r.spendHealth).toBe('moderate');
  });

  test('spendHealth is efficient when <= 15%', () => {
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 10 });
    expect(r.spendPercent).toBeLessThanOrEqual(15);
    expect(r.spendHealth).toBe('efficient');
  });

  test('cacWarning is true when CAC > 50% of deal value', () => {
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 500 });
    expect(r.cacDealPercent).toBeGreaterThan(50);
    expect(r.cacWarning).toBe(true);
  });

  test('cacWarning is false when CAC <= 50% of deal value', () => {
    const r = calculateGtmResults({ ...defaultInputs, costPerLead: 10 });
    expect(r.cacWarning).toBe(false);
  });

  // ── Pipeline ──

  test('pipeline coverage is 3.5x monthly revenue', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.pipelineCoverage).toBeCloseTo((1_000_000 / 12) * 3.5, 2);
  });

  test('time to revenue is sales cycle in months', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.timeToRevenue).toBe(3); // 90 / 30
  });

  test('ramp up = cycle months + min(cycle*0.5, 2)', () => {
    const r = calculateGtmResults(defaultInputs);
    // 3 + min(1.5, 2) = 4.5
    expect(r.rampUp).toBe(4.5);
  });

  test('ramp up caps buffer at 2 months for long cycles', () => {
    const r = calculateGtmResults({ ...defaultInputs, salesCycle: 180 });
    // 6 + min(3, 2) = 8
    expect(r.rampUp).toBe(8);
  });

  // ── Passthrough rates ──

  test('passes through input rates for display', () => {
    const r = calculateGtmResults(defaultInputs);
    expect(r.leadToSqlRate).toBe(20);
    expect(r.sqlToOppRate).toBe(50);
    expect(r.closeRateVal).toBe(25);
    expect(r.costPerLead).toBe(100);
  });
});
