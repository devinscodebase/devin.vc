/* ── GTM Planner pure functions ──
 * Extracted from GtmPlanner.svelte for testability.
 * The Svelte component imports these instead of defining them inline.
 */

// ── Formatting ──

export function fmtCurrency(n) {
  if (n == null) return '\u2014';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function fmtNum(n, decimals = 1) {
  if (n == null) return '\u2014';
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

export function fmtPercent(n) {
  if (n == null) return '\u2014';
  return n.toFixed(1) + '%';
}

export function formatWithCommas(n) {
  if (n == null || n === '') return '';
  return Number(n).toLocaleString('en-US');
}

export function parseRawNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function abbreviateTarget(n) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

// ── Calculation engine ──

export function calculateGtmResults({
  revenueTarget,
  dealSize,
  isRecurring,
  salesCycle,
  closeRate,
  sqlToOpp,
  leadToSql,
  costPerLead,
  grossMargin,
  customerLifespan,
}) {
  const canCalculate = revenueTarget > 0 && dealSize > 0 && costPerLead > 0 &&
    (!isRecurring || customerLifespan > 0);
  if (!canCalculate) return null;

  // Core funnel
  const annualRevenue = revenueTarget;
  const effectiveDealValue = isRecurring ? dealSize * 12 : dealSize;
  const dealsPerYear = annualRevenue / effectiveDealValue;
  const dealsPerMonth = dealsPerYear / 12;
  const oppsPerMonth = dealsPerMonth / (closeRate / 100);
  const oppsPerWeek = oppsPerMonth / 4.33;
  const sqlsPerMonth = oppsPerMonth / (sqlToOpp / 100);
  const sqlsPerWeek = sqlsPerMonth / 4.33;
  const leadsPerMonth = sqlsPerMonth / (leadToSql / 100);
  const leadsPerWeek = leadsPerMonth / 4.33;
  const leadsPerDay = leadsPerMonth / 21.7;

  // Budget
  const monthlyBudget = leadsPerMonth * costPerLead;
  const annualBudget = monthlyBudget * 12;
  const spendPercent = (annualBudget / annualRevenue) * 100;

  // Unit economics
  const fullFunnelRate = (leadToSql / 100) * (sqlToOpp / 100) * (closeRate / 100);
  const cac = costPerLead / fullFunnelRate;
  const ltv = isRecurring
    ? dealSize * customerLifespan * (grossMargin / 100)
    : dealSize * (grossMargin / 100);
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;
  const cacDealPercent = (cac / effectiveDealValue) * 100;

  // LTV:CAC health
  let ltvCacHealth;
  if (ltvCacRatio < 3) ltvCacHealth = 'warning';
  else if (ltvCacRatio <= 5) ltvCacHealth = 'healthy';
  else ltvCacHealth = 'strong';

  // Spend health (% of revenue)
  let spendHealth;
  if (spendPercent > 30) spendHealth = 'warning';
  else if (spendPercent > 15) spendHealth = 'moderate';
  else spendHealth = 'efficient';

  // Pipeline
  const monthlyRevenueTarget = annualRevenue / 12;
  const pipelineCoverage = monthlyRevenueTarget * 3.5;
  const salesCycleMonths = salesCycle / 30;
  const rampUpMonths = salesCycleMonths + Math.min(salesCycleMonths * 0.5, 2);

  return {
    dealsPerYear, dealsPerMonth,
    oppsPerMonth, oppsPerWeek,
    sqlsPerMonth, sqlsPerWeek,
    leadsPerMonth, leadsPerWeek, leadsPerDay,
    fullFunnelRate,
    leadToSqlRate: leadToSql,
    sqlToOppRate: sqlToOpp,
    closeRateVal: closeRate,
    monthlyBudget, annualBudget, spendPercent, spendHealth, cac,
    costPerLead,
    ltv, ltvCacRatio, ltvCacHealth, cacDealPercent,
    cacWarning: cacDealPercent > 50,
    pipelineCoverage,
    timeToRevenue: salesCycleMonths,
    rampUp: rampUpMonths,
    effectiveDealValue,
  };
}
