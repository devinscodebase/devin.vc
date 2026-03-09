/* ── Retention Revenue Calculator — pure functions ──
 * Self-contained calculation engine and formatters.
 * The Svelte component imports these instead of defining them inline.
 */

// ── Formatting ──

export function fmtCurrency(n) {
  if (n == null) return '\u2014';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) {
    const b = n / 1_000_000_000;
    return '$' + (Number.isInteger(b) ? b.toFixed(0) : b.toFixed(1)) + 'B';
  }
  if (abs >= 1_000_000) {
    const m = n / 1_000_000;
    return '$' + (Number.isInteger(m) ? m.toFixed(0) : m.toFixed(1)) + 'M';
  }
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function fmtNum(n, decimals = 0) {
  if (n == null) return '\u2014';
  return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
}

export function fmtPercent(n) {
  if (n == null) return '\u2014';
  return n.toFixed(1) + '%';
}

export function parseRawNumber(str) {
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

export function formatWithCommas(n) {
  if (n == null || n === '') return '';
  return Number(n).toLocaleString('en-US');
}

export function abbreviateTarget(n) {
  if (n == null) return '\u2014';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

export function roundToNearest5(n) {
  if (n == null) return 0;
  return Math.round(n / 5) * 5;
}

// ── Calculation engine ──

export function calculateRetentionResults({
  arr,
  customers,
  monthlyChurnRate,
  arpc,
  expansionRate = 0,
  grossMargin = 70,
  marketingSpend = 0,
  newCustomersMonth = 0,
  improvementPoints = 2,
}) {
  // Validation
  if (!arr || !customers || customers === 0 || !arpc) return null;

  const churnRate = monthlyChurnRate / 100;
  const expRate = expansionRate / 100;
  const monthlyRevenue = arr / 12;

  // ── Churn Tax ──
  // Compounded monthly: sum of revenue lost each month as base shrinks
  let annualChurnRevenue = 0;
  let base = monthlyRevenue;
  for (let i = 0; i < 12; i++) {
    annualChurnRevenue += base * churnRate;
    base = base * (1 - churnRate);
  }

  const churnedCustomersMonth = customers * churnRate;
  const cac = newCustomersMonth > 0 ? marketingSpend / newCustomersMonth : null;
  const replacementCostMonth = cac != null ? churnedCustomersMonth * cac : null;
  const replacementCostYear = replacementCostMonth != null ? replacementCostMonth * 12 : null;
  const totalMarketingYear = marketingSpend * 12;
  const replacementPercent = (replacementCostYear != null && totalMarketingYear > 0)
    ? (replacementCostYear / totalMarketingYear) * 100
    : null;

  const netNewRevenueMonth = (newCustomersMonth * arpc) - (churnedCustomersMonth * arpc);
  let netNewRevenueHealth;
  if (netNewRevenueMonth > arpc) netNewRevenueHealth = 'growing';
  else if (netNewRevenueMonth >= -arpc) netNewRevenueHealth = 'treading';
  else netNewRevenueHealth = 'shrinking';

  // ── Retention Scores ──
  // GRR: percentage of existing revenue retained over 12 months (no expansion)
  const grr = Math.pow(1 - churnRate, 12) * 100;
  // NRR: net retention including expansion
  // Mathematically: each month revenue *= (1 - churnRate + expansionRate), compounded 12x
  // The additive form (1 - churnRate + expansionRate) before exponentiation
  // is equivalent to compounding the net monthly rate.
  const nrr = Math.pow((1 - churnRate) + expRate, 12) * 100;

  let grrHealth;
  if (grr < 80) grrHealth = 'critical';
  else if (grr < 90) grrHealth = 'needs_work';
  else grrHealth = 'healthy';

  let nrrHealth;
  if (nrr < 90) nrrHealth = 'contraction';
  else if (nrr < 100) nrrHealth = 'stable';
  else if (nrr < 110) nrrHealth = 'healthy';
  else nrrHealth = 'elite';

  // ── Improvement Scenario ──
  // Auto-adjust: if current churn <= 2.5%, default to 1 point so improved never < 0.5%
  const effectiveImprovementPoints = monthlyChurnRate <= 2.5
    ? Math.min(improvementPoints, monthlyChurnRate - 0.5)
    : improvementPoints;
  const clampedImprovement = Math.max(0, effectiveImprovementPoints);
  const improvedChurnRate = Math.max(0.5, monthlyChurnRate - clampedImprovement) / 100;

  // Project ARR over N months with acquisition + expansion - churn
  function projectArr(months, churn) {
    let currentArr = arr;
    const monthlyAcquisitionRevenue = newCustomersMonth * arpc;
    for (let m = 0; m < months; m++) {
      const monthRev = currentArr / 12;
      const lost = monthRev * churn;
      const expanded = monthRev * expRate;
      currentArr = currentArr - (lost * 12) + (expanded * 12) + (monthlyAcquisitionRevenue * 12);
    }
    return currentArr;
  }

  const projectedArr12Current = projectArr(12, churnRate);
  const projectedArr36Current = projectArr(36, churnRate);
  const projectedArr12Improved = projectArr(12, improvedChurnRate);
  const projectedArr36Improved = projectArr(36, improvedChurnRate);
  const revenueGap36 = projectedArr36Improved - projectedArr36Current;

  // How much extra marketing spend needed over 36 months to match improved retention via acquisition alone
  // The delta at month 36 = revenueGap36. Each new customer adds arpc*12 ARR/year.
  // Extra customers needed = revenueGap36 / (arpc * 12)
  // Spread over 36 months, each month needs extraCustomers/36 additional customers
  // Cost = extra customers * cac
  const acquisitionCostToMatch = (cac != null && arpc > 0)
    ? (revenueGap36 / (arpc * 12)) * cac
    : null;

  // ── Trajectory Data (37 points: months 0-36) ──
  const trajectoryData = [];
  let currentPathArr = arr;
  let improvedPathArr = arr;
  let acquisitionPathArr = arr;
  let cumulativeExtraCost = 0;

  // For acquisition-only line: extra new customers per month to match improved endpoint
  const totalExtraCustomersNeeded = arpc > 0 ? revenueGap36 / (arpc * 12) : 0;
  const extraCustomersPerMonth = totalExtraCustomersNeeded / 36;
  const extraAcquisitionRevenuePerMonth = extraCustomersPerMonth * arpc;
  const extraCostPerMonth = cac != null ? extraCustomersPerMonth * cac : 0;

  for (let m = 0; m <= 36; m++) {
    trajectoryData.push({
      month: m,
      currentArr: currentPathArr,
      improvedArr: improvedPathArr,
      acquisitionArr: acquisitionPathArr,
    });

    if (m < 36) {
      const monthlyAcqRev = newCustomersMonth * arpc;

      // Current path
      const curMonthRev = currentPathArr / 12;
      currentPathArr = currentPathArr
        - (curMonthRev * churnRate * 12)
        + (curMonthRev * expRate * 12)
        + (monthlyAcqRev * 12);

      // Improved path
      const impMonthRev = improvedPathArr / 12;
      improvedPathArr = improvedPathArr
        - (impMonthRev * improvedChurnRate * 12)
        + (impMonthRev * expRate * 12)
        + (monthlyAcqRev * 12);

      // Acquisition-only path: same churn as current, but extra acquisition to match improved
      const acqMonthRev = acquisitionPathArr / 12;
      acquisitionPathArr = acquisitionPathArr
        - (acqMonthRev * churnRate * 12)
        + (acqMonthRev * expRate * 12)
        + ((monthlyAcqRev + extraAcquisitionRevenuePerMonth) * 12);
      cumulativeExtraCost += extraCostPerMonth;
    }
  }

  const cumulativeExtraAcquisitionCost = cumulativeExtraCost;

  // ── Unit Economics ──
  const netCustomersShrinking = newCustomersMonth < churnedCustomersMonth;
  let effectiveCac = null;
  if (!netCustomersShrinking && (newCustomersMonth - churnedCustomersMonth) > 0 && cac != null) {
    effectiveCac = marketingSpend / (newCustomersMonth - churnedCustomersMonth);
  }

  const customerLifespanMonths = churnRate > 0 ? 1 / churnRate : Infinity;
  const ltv = arpc * (grossMargin / 100) * customerLifespanMonths;
  const improvedLifespanMonths = improvedChurnRate > 0 ? 1 / improvedChurnRate : Infinity;
  const improvedLtv = arpc * (grossMargin / 100) * improvedLifespanMonths;

  const ltvCacRatio = cac != null && cac > 0 ? ltv / cac : null;
  const improvedLtvCacRatio = cac != null && cac > 0 ? improvedLtv / cac : null;

  let ltvCacHealth;
  if (ltvCacRatio == null) ltvCacHealth = null;
  else if (ltvCacRatio < 3) ltvCacHealth = 'warning';
  else if (ltvCacRatio <= 5) ltvCacHealth = 'healthy';
  else ltvCacHealth = 'strong';

  // ── Edge Case Flags ──
  const highChurnWarning = monthlyChurnRate > 10;
  const eliteNrrFlag = nrr > 130;
  const zeroExpansionFlag = expansionRate === 0;
  const zeroMarketingFlag = marketingSpend === 0 || newCustomersMonth === 0;

  // Quantified expansion gap for zero-expansion callout
  let expansionGapNrr = null;
  if (zeroExpansionFlag) {
    // What would NRR be with 1.5% monthly expansion?
    expansionGapNrr = Math.pow((1 - churnRate) + 0.015, 12) * 100;
  }

  return {
    // Churn Tax
    annualChurnRevenue,
    churnedCustomersMonth,
    cac,
    replacementCostMonth,
    replacementCostYear,
    replacementPercent,
    netNewRevenueMonth,
    netNewRevenueHealth,

    // Retention Scores
    grr,
    nrr,
    grrHealth,
    nrrHealth,

    // Improvement Scenario
    effectiveImprovementPoints: clampedImprovement,
    improvedChurnRate: improvedChurnRate * 100,
    projectedArr12Current,
    projectedArr36Current,
    projectedArr12Improved,
    projectedArr36Improved,
    revenueGap36,
    acquisitionCostToMatch,
    cumulativeExtraAcquisitionCost,

    // Trajectory
    trajectoryData,

    // Unit Economics
    effectiveCac,
    netCustomersShrinking,
    customerLifespanMonths,
    ltv,
    improvedLifespanMonths,
    improvedLtv,
    ltvCacRatio,
    improvedLtvCacRatio,
    ltvCacHealth,

    // Edge Case Flags
    highChurnWarning,
    eliteNrrFlag,
    zeroExpansionFlag,
    zeroMarketingFlag,
    expansionGapNrr,
  };
}
