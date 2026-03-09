/* ── Marketing Efficiency Scorecard — pure functions ──
 * Self-contained scoring engine, constraint detection, and formatters.
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

export function fmtRatio(n) {
  if (n == null) return '\u2014';
  return n.toFixed(1) + ':1';
}

export function fmtMonths(n) {
  if (n == null) return '\u2014';
  const rounded = Math.round(n);
  return rounded === 1 ? '1 month' : `${rounded} months`;
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

// ── Constants ──

export const STAGES = {
  pre_revenue: { label: 'Pre-revenue', arrRange: '$0' },
  early: { label: 'Early', arrRange: '$0\u20131M ARR' },
  growth: { label: 'Growth', arrRange: '$1M\u201310M ARR' },
  scale: { label: 'Scale', arrRange: '$10M+ ARR' },
};

export const MODELS = {
  plg: { label: 'Self-serve / PLG' },
  sales_assisted: { label: 'Sales-assisted' },
  enterprise: { label: 'Enterprise sales' },
  hybrid: { label: 'Hybrid' },
};

export const BENCHMARKS = {
  cac: {
    early:  { strong: 500,  healthy: 1500, label: '< $500 strong, $500\u2013$1,500 healthy' },
    growth: { strong: 1000, healthy: 3000, label: '< $1,000 strong, $1,000\u2013$3,000 healthy' },
    scale:  { strong: 2000, healthy: 5000, label: '< $2,000 strong, $2,000\u2013$5,000 healthy' },
  },
  churn: {
    early:  { healthy: 7, warning: 10, label: '< 7% healthy' },
    growth: { healthy: 4, warning: 7,  label: '< 4% healthy' },
    scale:  { healthy: 2, warning: 4,  label: '< 2% healthy' },
  },
  cacPayback: {
    all: { strong: 6, healthy: 12, warning: 18, label: '< 12 months healthy' },
  },
  ltvCac: {
    all: { critical: 2, warning: 3, healthy: 5, label: '3:1\u20135:1 healthy' },
  },
  marketingSpendPercent: {
    early:  { healthy: 30, warning: 50, label: '15\u201330% typical' },
    growth: { healthy: 20, warning: 25, label: '10\u201320% healthy' },
    scale:  { healthy: 15, warning: 20, label: '5\u201315% healthy' },
  },
  nrr: {
    all: { contraction: 90, stable: 100, healthy: 110, label: '100\u2013110% healthy' },
  },
  pipelineCoverage: {
    all: { critical: 2, warning: 3, healthy: 4, label: '3\u20134x healthy' },
  },
  mer: {
    all: { warning: 3, healthy: 5, label: '3:1\u20135:1 healthy' },
  },
  conversionRate: {
    all: { critical: 1, warning: 2, healthy: 5, label: '2\u20135% healthy' },
  },
};

// ── Helpers ──

function getBenchmark(metric, stage) {
  const b = BENCHMARKS[metric];
  if (!b) return null;
  // Use stage-specific if available, otherwise use 'all'
  // Pre-revenue uses early benchmarks
  const effectiveStage = stage === 'pre_revenue' ? 'early' : stage;
  return b[effectiveStage] || b.all || null;
}

function getBenchmarkLabel(metric, stage) {
  const b = getBenchmark(metric, stage);
  if (!b) return '';
  const stageLabel = STAGES[stage]?.label || stage;
  return `${stageLabel} stage: ${b.label}`;
}

// ── Metric Scoring ──

function scoreCac(value, stage) {
  const b = getBenchmark('cac', stage);
  if (!b) return 'unscored';
  if (value <= b.strong) return 'strong';
  if (value <= b.healthy) return 'healthy';
  return 'warning';
}

function scoreChurn(value, stage) {
  const b = getBenchmark('churn', stage);
  if (!b) return 'unscored';
  if (value <= b.healthy) return 'healthy';
  if (value <= b.warning) return 'warning';
  return 'critical';
}

function scoreCacPayback(value) {
  const b = BENCHMARKS.cacPayback.all;
  if (value <= b.strong) return 'strong';
  if (value <= b.healthy) return 'healthy';
  if (value <= b.warning) return 'warning';
  return 'critical';
}

function scoreLtvCac(value) {
  const b = BENCHMARKS.ltvCac.all;
  if (value < b.critical) return 'critical';
  if (value < b.warning) return 'warning';
  if (value <= b.healthy) return 'healthy';
  return 'strong';
}

function scoreMarketingSpendPercent(value, stage) {
  const b = getBenchmark('marketingSpendPercent', stage);
  if (!b) return 'unscored';
  if (value <= b.healthy) return 'healthy';
  if (value <= b.warning) return 'warning';
  return 'critical';
}

function scoreNrr(value) {
  const b = BENCHMARKS.nrr.all;
  if (value < b.contraction) return 'contraction';
  if (value < b.stable) return 'stable';
  if (value < b.healthy) return 'healthy';
  return 'elite';
}

function scorePipelineCoverage(value) {
  const b = BENCHMARKS.pipelineCoverage.all;
  if (value < b.critical) return 'critical';
  if (value < b.warning) return 'warning';
  if (value < b.healthy) return 'healthy';
  return 'strong';
}

function scoreMer(value) {
  const b = BENCHMARKS.mer.all;
  if (value < b.warning) return 'warning';
  if (value < b.healthy) return 'healthy';
  return 'strong';
}

function scoreConversionRate(value) {
  const b = BENCHMARKS.conversionRate.all;
  if (value < b.critical) return 'critical';
  if (value < b.warning) return 'warning';
  if (value < b.healthy) return 'healthy';
  return 'strong';
}

// Map NRR health labels to standard health for constraint engine
function nrrHealthToStandard(nrrHealth) {
  if (nrrHealth === 'contraction') return 'critical';
  if (nrrHealth === 'stable') return 'warning';
  return 'healthy';
}

// ── Interpretation generators ──

function interpretCac(value, health, stage) {
  const stageLabel = STAGES[stage]?.label?.toLowerCase() || stage;
  if (health === 'strong') return `Your CAC (${fmtCurrency(value)}) is very efficient for ${stageLabel} stage.`;
  if (health === 'healthy') return `Your CAC (${fmtCurrency(value)}) is within healthy range for ${stageLabel} stage.`;
  return `Your CAC (${fmtCurrency(value)}) is elevated for ${stageLabel} stage. Look for efficiency gains in your funnel.`;
}

function interpretLtv(value) {
  return `Average customer generates ${fmtCurrency(value)} in gross profit over their lifetime.`;
}

function interpretLtvCac(value, health) {
  if (health === 'critical') return `At ${fmtRatio(value)}, each customer costs more than they return short-term. Fix unit economics before scaling.`;
  if (health === 'warning') return `At ${fmtRatio(value)}, unit economics are thin. Target 3:1 or higher.`;
  if (health === 'healthy') return `At ${fmtRatio(value)}, unit economics are solid. Room to invest more in acquisition.`;
  return `At ${fmtRatio(value)}, unit economics are excellent. You may be underinvesting in growth.`;
}

function interpretCacPayback(value, health) {
  if (health === 'strong') return `You recover acquisition cost in ${fmtMonths(value)}. Very efficient.`;
  if (health === 'healthy') return `CAC payback of ${fmtMonths(value)} is healthy but watch it as you scale.`;
  if (health === 'warning') return `At ${fmtMonths(value)}, cash flow is strained. Consider annual prepay or shorter sales cycles.`;
  return `CAC payback of ${fmtMonths(value)} limits growth velocity. Needs attention.`;
}

function interpretMarketingSpendPercent(value, health, stage) {
  const stageLabel = STAGES[stage]?.label?.toLowerCase() || stage;
  if (health === 'healthy') return `Marketing at ${fmtPercent(value)} of ARR is appropriate for ${stageLabel} stage.`;
  if (health === 'warning') return `At ${fmtPercent(value)} of ARR, marketing spend is above typical for ${stageLabel} stage.`;
  return `Marketing at ${fmtPercent(value)} of ARR is significantly above benchmarks. Verify ROI.`;
}

function interpretChurn(value, health, stage) {
  const stageLabel = STAGES[stage]?.label?.toLowerCase() || stage;
  if (health === 'healthy') return `Monthly churn of ${fmtPercent(value)} is healthy for ${stageLabel} stage.`;
  if (health === 'warning') return `Monthly churn of ${fmtPercent(value)} is above healthy range for ${stageLabel} stage.`;
  return `Monthly churn of ${fmtPercent(value)} is critical. Retention should be the top priority.`;
}

function interpretNrr(value, health) {
  if (health === 'contraction') return `NRR of ${fmtPercent(value)} means your customer base is shrinking. Expansion or churn reduction needed.`;
  if (health === 'stable') return `NRR of ${fmtPercent(value)} means you're treading water. Upsells could shift this.`;
  if (health === 'healthy') return `NRR of ${fmtPercent(value)} means existing customers are a growth engine.`;
  return `NRR of ${fmtPercent(value)} is elite. Your expansion motion is very strong.`;
}

function interpretMer(value, health) {
  if (health === 'warning') return `MER of ${fmtRatio(value)} is below efficient. Marketing spend isn't generating enough revenue.`;
  if (health === 'healthy') return `MER of ${fmtRatio(value)} is solid. Marketing spend is productive.`;
  return `MER of ${fmtRatio(value)} is strong. High revenue per marketing dollar.`;
}

function interpretPipelineCoverage(value, health) {
  if (health === 'critical') return `Pipeline coverage of ${fmtNum(value, 1)}x is dangerously low. You need more active opportunities.`;
  if (health === 'warning') return `Pipeline coverage of ${fmtNum(value, 1)}x is thin. Aim for 3x+ for reliable forecasting.`;
  if (health === 'healthy') return `Pipeline coverage of ${fmtNum(value, 1)}x is healthy for reliable revenue forecasting.`;
  return `Pipeline coverage of ${fmtNum(value, 1)}x is strong. Good cushion for deal slippage.`;
}

function interpretConversionRate(value, health) {
  if (health === 'critical') return `Converting ${fmtPercent(value)} of leads is very low. Audit lead quality and sales process.`;
  if (health === 'warning') return `Converting ${fmtPercent(value)} of leads is below average. Room for improvement.`;
  if (health === 'healthy') return `Converting ${fmtPercent(value)} of leads is solid for B2B SaaS.`;
  return `Converting ${fmtPercent(value)} of leads is excellent.`;
}

function interpretPipelineVelocity(value, health, monthlyRevenueTarget) {
  if (health === 'warning') return `Pipeline velocity (${fmtCurrency(value)}/mo) is below your monthly revenue need (${fmtCurrency(monthlyRevenueTarget)}).`;
  return `Pipeline velocity of ${fmtCurrency(value)}/mo is generating enough to sustain current revenue.`;
}

// ── Core Calculation ──

export function calculateScorecardResults({
  stage,
  model,
  arr,
  marketingSpend,
  newCustomersMonth,
  acv,
  monthlyChurnRate,
  expansionRate = 0,
  salesCycleLength = null,
  pipelineValue = null,
  monthlyLeadVolume = null,
  leadToCustomerRate = null,
}) {
  // Validation
  if (!stage || !model || !arr || !marketingSpend || !newCustomersMonth || !acv || monthlyChurnRate == null || expansionRate == null) return null;

  const isPreRevenue = stage === 'pre_revenue';
  const churnRate = monthlyChurnRate / 100;
  const expRate = expansionRate / 100;

  // ── Required Metrics ──

  // 1. CAC
  const cacValue = marketingSpend / newCustomersMonth;
  const cacHealth = scoreCac(cacValue, stage);
  const cacAsPercentOfAcv = (cacValue / acv) * 100;

  const cac = {
    value: cacValue,
    health: cacHealth,
    benchmark: getBenchmarkLabel('cac', stage),
    interpretation: interpretCac(cacValue, cacHealth, stage),
    scored: true,
    cacAsPercentOfAcv,
  };

  // 2. LTV — lifespan capped at 120 months
  const lifespanMonths = churnRate > 0 ? Math.min(1 / churnRate, 120) : 120;
  const ltvValue = (acv / 12) * lifespanMonths * 0.70;

  const ltv = {
    value: ltvValue,
    health: 'healthy', // LTV isn't scored on its own — it's context for LTV:CAC
    benchmark: '',
    interpretation: interpretLtv(ltvValue),
    scored: true,
    lifespanMonths,
  };

  // 3. LTV:CAC Ratio
  const ltvCacValue = ltvValue / cacValue;
  const ltvCacHealth = isPreRevenue ? 'unscored' : scoreLtvCac(ltvCacValue);

  const ltvCac = {
    value: ltvCacValue,
    health: ltvCacHealth,
    benchmark: isPreRevenue ? 'Pre-revenue: not scored' : getBenchmarkLabel('ltvCac', stage),
    interpretation: isPreRevenue ? 'Not scored at pre-revenue stage.' : interpretLtvCac(ltvCacValue, ltvCacHealth),
    scored: !isPreRevenue,
  };

  // 4. CAC Payback
  const cacPaybackValue = cacValue / (acv / 12);
  const cacPaybackHealth = isPreRevenue ? 'unscored' : scoreCacPayback(cacPaybackValue);

  const cacPayback = {
    value: cacPaybackValue,
    health: cacPaybackHealth,
    benchmark: isPreRevenue ? 'Pre-revenue: not scored' : getBenchmarkLabel('cacPayback', stage),
    interpretation: isPreRevenue ? 'Not scored at pre-revenue stage.' : interpretCacPayback(cacPaybackValue, cacPaybackHealth),
    scored: !isPreRevenue,
  };

  // 5. Marketing Spend % of ARR
  const marketingSpendPercentValue = (marketingSpend * 12) / arr * 100;
  const marketingSpendPercentHealth = isPreRevenue ? 'unscored' : scoreMarketingSpendPercent(marketingSpendPercentValue, stage);

  const marketingSpendPercent = {
    value: marketingSpendPercentValue,
    health: marketingSpendPercentHealth,
    benchmark: isPreRevenue ? 'Pre-revenue: high spend expected' : getBenchmarkLabel('marketingSpendPercent', stage),
    interpretation: isPreRevenue ? 'Pre-revenue marketing spend is expected to be high relative to revenue.' : interpretMarketingSpendPercent(marketingSpendPercentValue, marketingSpendPercentHealth, stage),
    scored: !isPreRevenue,
  };

  // 6. Monthly Churn
  const monthlyChurnHealth = scoreChurn(monthlyChurnRate, stage);

  const monthlyChurn = {
    value: monthlyChurnRate,
    health: monthlyChurnHealth,
    benchmark: getBenchmarkLabel('churn', stage),
    interpretation: interpretChurn(monthlyChurnRate, monthlyChurnHealth, stage),
    scored: true,
  };

  // 7. NRR
  // Mathematically: each month revenue *= (1 - churnRate + expansionRate), compounded 12x
  // The additive form (1 - churnRate + expansionRate) before exponentiation
  // is equivalent to compounding the net monthly rate.
  const nrrValue = Math.pow((1 - churnRate) + expRate, 12) * 100;
  const nrrHealth = scoreNrr(nrrValue);

  const nrr = {
    value: nrrValue,
    health: nrrHealth,
    benchmark: getBenchmarkLabel('nrr', stage),
    interpretation: interpretNrr(nrrValue, nrrHealth),
    scored: true,
  };

  // 8. MER (Marketing Efficiency Ratio)
  const merValue = arr / (marketingSpend * 12);
  const merHealth = isPreRevenue ? 'unscored' : scoreMer(merValue);

  const mer = {
    value: merValue,
    health: merHealth,
    benchmark: isPreRevenue ? 'Pre-revenue: not scored' : getBenchmarkLabel('mer', stage),
    interpretation: isPreRevenue ? 'Not scored at pre-revenue stage.' : interpretMer(merValue, merHealth),
    scored: !isPreRevenue,
  };

  // ── Optional Metrics ──

  // 9. Pipeline Coverage
  let pipelineCoverage;
  if (pipelineValue != null) {
    const monthlyTarget = arr / 12;
    const pcValue = monthlyTarget > 0 ? pipelineValue / monthlyTarget : 0;
    const pcHealth = scorePipelineCoverage(pcValue);
    pipelineCoverage = {
      value: pcValue,
      health: pcHealth,
      benchmark: getBenchmarkLabel('pipelineCoverage', stage),
      interpretation: interpretPipelineCoverage(pcValue, pcHealth),
      scored: true,
    };
  } else {
    pipelineCoverage = {
      value: null,
      health: 'unscored',
      benchmark: '',
      interpretation: '',
      scored: false,
      missingInput: 'pipeline value',
    };
  }

  // 10. Pipeline Velocity
  let pipelineVelocity;
  if (salesCycleLength != null && salesCycleLength > 0) {
    const pvValue = (newCustomersMonth * acv) / (salesCycleLength / 30);
    const monthlyRevenueTarget = arr / 12;
    const pvHealth = pvValue < monthlyRevenueTarget ? 'warning' : 'healthy';
    pipelineVelocity = {
      value: pvValue,
      health: pvHealth,
      benchmark: `Target: > ${fmtCurrency(monthlyRevenueTarget)}/mo`,
      interpretation: interpretPipelineVelocity(pvValue, pvHealth, monthlyRevenueTarget),
      scored: true,
    };
  } else {
    pipelineVelocity = {
      value: null,
      health: 'unscored',
      benchmark: '',
      interpretation: '',
      scored: false,
      missingInput: 'sales cycle length',
    };
  }

  // 11. Conversion Rate
  let conversionRate;
  if (leadToCustomerRate != null) {
    const crHealth = scoreConversionRate(leadToCustomerRate);
    conversionRate = {
      value: leadToCustomerRate,
      health: crHealth,
      benchmark: getBenchmarkLabel('conversionRate', stage),
      interpretation: interpretConversionRate(leadToCustomerRate, crHealth),
      scored: true,
    };
  } else {
    conversionRate = {
      value: null,
      health: 'unscored',
      benchmark: '',
      interpretation: '',
      scored: false,
      missingInput: 'lead-to-customer rate',
    };
  }

  // ── All Metrics ──
  const metrics = {
    cac,
    ltv,
    ltvCac,
    cacPayback,
    marketingSpendPercent,
    monthlyChurn,
    nrr,
    mer,
    pipelineCoverage,
    pipelineVelocity,
    conversionRate,
  };

  // ── Scoring summary ──
  const scoredMetrics = Object.values(metrics).filter(m => m.scored);
  const unscoredMetrics = Object.values(metrics).filter(m => !m.scored);
  const scoredMetricsCount = scoredMetrics.length;

  // ── Constraint, Watch List, Recommendations ──
  const constraint = identifyConstraint(metrics, stage, model, {
    arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, expansionRate, monthlyLeadVolume,
  });
  const watchList = identifyWatchItems(metrics, constraint);
  const recommendations = generateRecommendations(constraint, metrics, stage, {
    arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, expansionRate,
    salesCycleLength, monthlyLeadVolume, leadToCustomerRate,
  });
  const outliers = detectOutliers({
    arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, cacValue, ltvCacValue,
  });

  // ── Edge Case Flags ──
  const preRevenueMode = isPreRevenue;
  const incompleteAssessment = unscoredMetrics.length > 0;
  const allHealthy = scoredMetrics.every(m =>
    m.health === 'healthy' || m.health === 'strong' || m.health === 'elite'
  );

  return {
    metrics,
    constraint,
    watchList,
    recommendations,
    outliers,
    scoredMetricsCount,
    preRevenueMode,
    incompleteAssessment,
    allHealthy,
  };
}

// ── Constraint Engine ──

export function identifyConstraint(metrics, stage, model, inputs) {
  const { monthlyChurn, ltvCac, cacPayback, pipelineCoverage, nrr, marketingSpendPercent, conversionRate } = metrics;
  const { arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, expansionRate, monthlyLeadVolume } = inputs;

  // 1. Retention Crisis
  if (monthlyChurn.health === 'critical') {
    return {
      id: 'retention_crisis',
      name: 'Retention Crisis',
      severity: 'critical',
      verdict: `Your churn rate is bleeding revenue faster than you can replace it. At ${fmtPercent(monthlyChurnRate)} monthly, your average customer lasts only ${fmtMonths(metrics.ltv.lifespanMonths)}. Fix retention before spending another dollar on acquisition.`,
      relatedTool: { name: 'Retention Revenue Calculator', url: '/tools/retention-calculator', cta: 'See the real cost \u2192' },
    };
  }

  // 2. Unit Economics
  if (ltvCac.scored && ltvCac.health === 'critical') {
    const cacProblem = metrics.cac.health === 'warning';
    const ltvProblem = monthlyChurnRate > 5;
    const pricingProblem = metrics.cac.cacAsPercentOfAcv > 50;

    let detail = 'Every customer you acquire costs more than they return short-term.';
    if (pricingProblem) detail += ` Your CAC is ${Math.round(metrics.cac.cacAsPercentOfAcv)}% of your ACV, suggesting a pricing issue.`;
    else if (cacProblem) detail += ' Your CAC is elevated relative to peers. Focus on funnel efficiency.';
    else if (ltvProblem) detail += ' High churn is eating customer lifetime value. Improve retention first.';
    else detail += ' Either reduce CAC, raise prices, or improve retention.';

    return {
      id: 'unit_economics',
      name: 'Unit Economics',
      severity: 'critical',
      verdict: detail,
    };
  }

  // 3. Cash Flow Efficiency
  if (cacPayback.scored && cacPayback.health === 'critical' && (!ltvCac.scored || ltvCac.health !== 'critical')) {
    return {
      id: 'cash_flow_efficiency',
      name: 'Cash Flow Efficiency',
      severity: 'warning',
      verdict: `Your customers are profitable long-term, but it takes ${fmtMonths(cacPayback.value)} to recoup acquisition cost. This limits growth velocity without external capital.`,
    };
  }

  // 4. Pipeline Gap
  if (pipelineCoverage.scored && pipelineCoverage.health === 'critical') {
    const monthlyTarget = arr / 12;
    const gap = monthlyTarget * 3 - (pipelineCoverage.value * monthlyTarget);
    const gapPercent = ((3 - pipelineCoverage.value) / 3 * 100).toFixed(0);
    return {
      id: 'pipeline_gap',
      name: 'Pipeline Gap',
      severity: 'critical',
      verdict: `You need ${fmtCurrency(monthlyTarget * 3)} in active pipeline to reliably close ${fmtCurrency(monthlyTarget)}/month. You're at ${fmtCurrency(pipelineCoverage.value * monthlyTarget)}: that's a ${gapPercent}% gap.`,
      relatedTool: { name: 'GTM Budget Planner', url: '/tools/gtm-planner', cta: 'Build your funnel plan \u2192' },
    };
  }

  // 5. Expansion Gap
  if (nrr.value < 100 && monthlyChurn.health !== 'critical') {
    const hypotheticalNrr = Math.pow((1 - monthlyChurnRate / 100) + 0.01, 12) * 100;
    const additionalRevenue = arr * ((hypotheticalNrr - nrr.value) / 100);
    return {
      id: 'expansion_gap',
      name: 'Expansion Gap',
      severity: 'warning',
      verdict: `Your existing customers aren't growing. Even modest upsell activity (1% monthly) would shift NRR from ${fmtPercent(nrr.value)} to ${fmtPercent(hypotheticalNrr)}, adding ${fmtCurrency(additionalRevenue)} annually without acquiring a single new customer.`,
      relatedTool: { name: 'Retention Revenue Calculator', url: '/tools/retention-calculator', cta: 'Model the impact \u2192' },
    };
  }

  // 6. Growth Throttle
  if (ltvCac.scored && (ltvCac.health === 'healthy' || ltvCac.health === 'strong') && ltvCac.value > 5 &&
      marketingSpendPercent.scored && (marketingSpendPercent.health === 'healthy')) {
    const additionalCustomers = Math.round(marketingSpend * 0.25 / metrics.cac.value);
    const additionalSpend = marketingSpend * 0.25;
    return {
      id: 'growth_throttle',
      name: 'Growth Throttle',
      severity: 'opportunity',
      verdict: `Your unit economics are strong and your funnel converts well. You're underspending relative to your efficiency. Increasing spend by ${fmtCurrency(additionalSpend)}/month should yield ~${additionalCustomers} additional customers.`,
    };
  }

  // 7. Conversion Leak
  if (conversionRate.scored && (conversionRate.health === 'critical' || conversionRate.health === 'warning') && monthlyLeadVolume > 0) {
    const improvedRate = (conversionRate.value + 1) / 100;
    const currentCustomers = monthlyLeadVolume * (conversionRate.value / 100);
    const additionalCustomers = monthlyLeadVolume * improvedRate - currentCustomers;
    return {
      id: 'conversion_leak',
      name: 'Conversion Leak',
      severity: 'warning',
      verdict: `You're generating ${fmtNum(monthlyLeadVolume)} leads per month but only converting ${fmtPercent(conversionRate.value)}. Improving conversion by 1 point would add ~${Math.round(additionalCustomers)} customers/month without increasing spend.`,
    };
  }

  // 8. Optimization Mode (fallback)
  const scoredMetrics = Object.entries(metrics).filter(([, m]) => m.scored && m.health !== 'healthy' && m.health !== 'strong' && m.health !== 'elite' && m.health !== 'unscored');
  const weakest = findWeakestMetric(metrics);

  return {
    id: 'optimization_mode',
    name: 'Optimization Mode',
    severity: 'healthy',
    verdict: weakest
      ? `Your marketing engine is performing within benchmarks. The opportunity is incremental: ${weakest.label} (${weakest.formatted}) is your weakest metric. Improving it would yield the highest marginal return.`
      : 'Your marketing engine is performing well across all scored dimensions. Focus on incremental gains and testing new channels.',
  };
}

// ── Find Weakest Metric ──

function findWeakestMetric(metrics) {
  // Rank: strong > healthy/elite > warning > critical
  const healthRank = { strong: 4, elite: 4, healthy: 3, warning: 2, critical: 1, stable: 2, contraction: 1 };
  let weakest = null;
  let weakestRank = Infinity;

  const metricLabels = {
    cac: 'CAC', ltv: 'LTV', ltvCac: 'LTV:CAC', cacPayback: 'CAC Payback',
    marketingSpendPercent: 'Marketing Spend %', monthlyChurn: 'Monthly Churn',
    nrr: 'NRR', mer: 'MER', pipelineCoverage: 'Pipeline Coverage',
    pipelineVelocity: 'Pipeline Velocity', conversionRate: 'Conversion Rate',
  };

  const metricFormatters = {
    cac: m => fmtCurrency(m.value),
    ltv: m => fmtCurrency(m.value),
    ltvCac: m => fmtRatio(m.value),
    cacPayback: m => fmtMonths(m.value),
    marketingSpendPercent: m => fmtPercent(m.value),
    monthlyChurn: m => fmtPercent(m.value),
    nrr: m => fmtPercent(m.value),
    mer: m => fmtRatio(m.value),
    pipelineCoverage: m => fmtNum(m.value, 1) + 'x',
    pipelineVelocity: m => fmtCurrency(m.value),
    conversionRate: m => fmtPercent(m.value),
  };

  for (const [key, m] of Object.entries(metrics)) {
    if (!m.scored || m.health === 'unscored') continue;
    const rank = healthRank[m.health] ?? 3;
    if (rank < weakestRank) {
      weakestRank = rank;
      weakest = { key, label: metricLabels[key] || key, formatted: metricFormatters[key]?.(m) || String(m.value), health: m.health };
    }
  }

  return weakest;
}

// ── Watch List ──

export function identifyWatchItems(metrics, constraint) {
  const items = [];
  const constraintMetrics = getConstraintMetricKeys(constraint.id);

  const thresholds = {
    cac: (m, stage) => ({ threshold: getBenchmark('cac', 'growth')?.healthy, label: fmtCurrency(getBenchmark('cac', 'growth')?.healthy) }),
    cacPayback: () => ({ threshold: BENCHMARKS.cacPayback.all.healthy, label: `${BENCHMARKS.cacPayback.all.healthy} months` }),
    ltvCac: () => ({ threshold: BENCHMARKS.ltvCac.all.warning, label: fmtRatio(BENCHMARKS.ltvCac.all.warning) }),
    monthlyChurn: (m, stage) => {
      const b = getBenchmark('churn', stage || 'growth');
      return { threshold: b?.healthy, label: fmtPercent(b?.healthy) };
    },
    nrr: () => ({ threshold: BENCHMARKS.nrr.all.stable, label: fmtPercent(BENCHMARKS.nrr.all.stable) }),
    pipelineCoverage: () => ({ threshold: BENCHMARKS.pipelineCoverage.all.warning, label: `${BENCHMARKS.pipelineCoverage.all.warning}x` }),
    mer: () => ({ threshold: BENCHMARKS.mer.all.warning, label: fmtRatio(BENCHMARKS.mer.all.warning) }),
    conversionRate: () => ({ threshold: BENCHMARKS.conversionRate.all.warning, label: fmtPercent(BENCHMARKS.conversionRate.all.warning) }),
  };

  const metricLabels = {
    cac: 'CAC', cacPayback: 'CAC Payback', ltvCac: 'LTV:CAC',
    monthlyChurn: 'Monthly Churn', nrr: 'NRR', pipelineCoverage: 'Pipeline Coverage',
    mer: 'MER', conversionRate: 'Conversion Rate',
  };

  const metricFormatters = {
    cac: m => fmtCurrency(m.value),
    cacPayback: m => fmtMonths(m.value),
    ltvCac: m => fmtRatio(m.value),
    monthlyChurn: m => fmtPercent(m.value),
    nrr: m => fmtPercent(m.value),
    pipelineCoverage: m => fmtNum(m.value, 1) + 'x',
    mer: m => fmtRatio(m.value),
    conversionRate: m => fmtPercent(m.value),
  };

  for (const [key, m] of Object.entries(metrics)) {
    if (!m.scored || m.health === 'unscored') continue;
    if (constraintMetrics.includes(key)) continue;
    if (key === 'ltv') continue; // LTV isn't independently watchable

    const isWarning = m.health === 'warning' || m.health === 'critical' || m.health === 'contraction' || m.health === 'stable';
    const thresholdFn = thresholds[key];
    if (!thresholdFn) continue;

    const { threshold, label: thresholdLabel } = thresholdFn(m);
    if (threshold == null) continue;

    // Check if warning, OR healthy but within 15% of threshold
    let proximity = null;
    if (isWarning) {
      proximity = 0; // Already at or past threshold
    } else if (m.health === 'healthy' || m.health === 'healthy') {
      // Higher-is-better metrics: proximity = how close value is to dropping below threshold
      // Lower-is-better metrics: proximity = how close value is to exceeding threshold
      const lowerIsBetter = ['cac', 'cacPayback', 'monthlyChurn', 'marketingSpendPercent'].includes(key);
      if (lowerIsBetter) {
        const margin = (threshold - m.value) / threshold;
        if (margin <= 0.15) proximity = margin;
      } else {
        const margin = (m.value - threshold) / threshold;
        if (margin <= 0.15) proximity = margin;
      }
    }

    if (proximity != null) {
      items.push({
        metricName: metricLabels[key] || key,
        value: m.value,
        formattedValue: metricFormatters[key]?.(m) || String(m.value),
        threshold: thresholdLabel,
        message: `${metricLabels[key] || key} (${metricFormatters[key]?.(m) || m.value}) approaching ${isWarning ? '' : 'minimum '}healthy threshold (${thresholdLabel}).`,
        proximity: proximity ?? 0,
      });
    }
  }

  // Sort by proximity (closest to threshold first), take top 2
  items.sort((a, b) => a.proximity - b.proximity);
  return items.slice(0, 2);
}

function getConstraintMetricKeys(constraintId) {
  const map = {
    retention_crisis: ['monthlyChurn'],
    unit_economics: ['ltvCac', 'cac', 'ltv'],
    cash_flow_efficiency: ['cacPayback'],
    pipeline_gap: ['pipelineCoverage'],
    expansion_gap: ['nrr'],
    growth_throttle: ['marketingSpendPercent', 'ltvCac'],
    conversion_leak: ['conversionRate'],
    optimization_mode: [],
  };
  return map[constraintId] || [];
}

// ── Recommendations ──

export function generateRecommendations(constraint, metrics, stage, inputs) {
  const { arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, expansionRate, salesCycleLength, monthlyLeadVolume, leadToCustomerRate } = inputs;
  const recs = [];

  switch (constraint.id) {
    case 'retention_crisis': {
      const savedAnnually = arr * ((monthlyChurnRate - Math.max(monthlyChurnRate - 2, 1)) / 100) * 12 / monthlyChurnRate;
      const currentLifespan = metrics.ltv.lifespanMonths;
      const improvedLifespan = Math.min(1 / (Math.max(monthlyChurnRate - 2, 1) / 100), 120);
      recs.push({ text: `Reducing churn from ${fmtPercent(monthlyChurnRate)} to ${fmtPercent(Math.max(monthlyChurnRate - 2, 1))} would save approximately ${fmtCurrency(savedAnnually)} annually.`, numbers: { saved: savedAnnually } });
      recs.push({ text: `A 2-point churn improvement increases average customer lifespan from ${fmtMonths(currentLifespan)} to ${fmtMonths(improvedLifespan)}.`, numbers: { current: currentLifespan, improved: improvedLifespan } });
      recs.push({ text: 'Prioritize customer success and onboarding improvements before scaling acquisition spend.', numbers: {} });
      break;
    }
    case 'unit_economics': {
      const cacPercentOfAcv = Math.round(metrics.cac.cacAsPercentOfAcv);
      const acvIncrease = Math.round(((metrics.cac.value * 3) - acv) / acv * 100);
      recs.push({ text: `Your CAC (${fmtCurrency(metrics.cac.value)}) is ${cacPercentOfAcv}% of your ACV. Target below 33% for healthy unit economics.`, numbers: { cacPercent: cacPercentOfAcv } });
      if (acvIncrease > 0) {
        const targetAcv = metrics.cac.value * 3;
        const newLtvCac = (targetAcv / 12 * metrics.ltv.lifespanMonths * 0.70) / metrics.cac.value;
        recs.push({ text: `Increasing ACV by ${acvIncrease}% to ${fmtCurrency(targetAcv)} would shift LTV:CAC from ${fmtRatio(metrics.ltvCac.value)} to ${fmtRatio(newLtvCac)}.`, numbers: { increase: acvIncrease, newRatio: newLtvCac } });
      }
      recs.push({ text: 'Consider reducing CAC through better targeting, shorter sales cycles, or more efficient channels.', numbers: {} });
      break;
    }
    case 'cash_flow_efficiency': {
      if (salesCycleLength) {
        const shorterCycle = Math.round(salesCycleLength * 0.6);
        const improvedPayback = metrics.cacPayback.value * 0.6;
        recs.push({ text: `Shortening your sales cycle from ${salesCycleLength} to ${shorterCycle} days would reduce CAC payback from ${fmtMonths(metrics.cacPayback.value)} to ~${fmtMonths(improvedPayback)}.`, numbers: { current: salesCycleLength, improved: shorterCycle } });
      }
      recs.push({ text: 'Consider annual prepayment discounts (10-15% off for upfront payment) to accelerate cash recovery.', numbers: {} });
      recs.push({ text: `At your current payback of ${fmtMonths(metrics.cacPayback.value)}, each new customer is cash-negative for over a year. Prioritize strategies that reduce time-to-value.`, numbers: {} });
      break;
    }
    case 'pipeline_gap': {
      const monthlyTarget = arr / 12;
      const neededPipeline = monthlyTarget * 3;
      const currentPipeline = metrics.pipelineCoverage.value * monthlyTarget;
      const gap = neededPipeline - currentPipeline;
      if (leadToCustomerRate && monthlyLeadVolume) {
        const leadsNeeded = Math.round(gap / acv / (leadToCustomerRate / 100));
        recs.push({ text: `You need ${fmtNum(leadsNeeded)} additional leads per month at your current conversion rate to close the pipeline gap.`, numbers: { leads: leadsNeeded } });
        const improvedRate = leadToCustomerRate + 1;
        const newPipeline = monthlyLeadVolume * (improvedRate / 100) * acv;
        recs.push({ text: `Alternatively, improving conversion from ${fmtPercent(leadToCustomerRate)} to ${fmtPercent(improvedRate)} would increase pipeline generation by ${fmtCurrency(newPipeline - monthlyLeadVolume * (leadToCustomerRate / 100) * acv)}/month.`, numbers: {} });
      } else {
        recs.push({ text: `You need ${fmtCurrency(gap)} more in active pipeline to reach the 3x coverage benchmark.`, numbers: { gap } });
      }
      recs.push({ text: 'Focus on top-of-funnel volume and lead source diversification to build pipeline buffer.', numbers: {} });
      break;
    }
    case 'expansion_gap': {
      const onePercentNrr = Math.pow((1 - monthlyChurnRate / 100) + 0.01, 12) * 100;
      const additionalRevenue = arr * ((onePercentNrr - metrics.nrr.value) / 100);
      recs.push({ text: `Adding 1% monthly expansion revenue shifts NRR from ${fmtPercent(metrics.nrr.value)} to ${fmtPercent(onePercentNrr)}, adding ${fmtCurrency(additionalRevenue)} annually from existing customers.`, numbers: { nrr: onePercentNrr, revenue: additionalRevenue } });
      recs.push({ text: 'Focus on usage-based upsells, seat expansion triggers, or tier upgrades within your existing base.', numbers: {} });
      recs.push({ text: 'Even small expansion motions compound. A customer who expands 1% monthly generates 12.7% more revenue annually.', numbers: {} });
      break;
    }
    case 'growth_throttle': {
      const additionalSpend = marketingSpend * 0.25;
      const additionalCustomers = Math.round(additionalSpend / metrics.cac.value);
      const maxCac = metrics.ltv.value / 3;
      recs.push({ text: `Increasing monthly spend by ${fmtCurrency(additionalSpend)} should add ~${additionalCustomers} customers at your current CAC of ${fmtCurrency(metrics.cac.value)}.`, numbers: { spend: additionalSpend, customers: additionalCustomers } });
      recs.push({ text: `Your LTV:CAC (${fmtRatio(metrics.ltvCac.value)}) gives you room to accept a higher CAC up to ${fmtCurrency(maxCac)} while maintaining 3:1.`, numbers: { maxCac } });
      recs.push({ text: 'Consider testing a new acquisition channel with 10-15% of budget to find additional scale.', numbers: {} });
      break;
    }
    case 'conversion_leak': {
      const additionalCustomers = monthlyLeadVolume * (1 / 100); // 1 point improvement
      const additionalRevenue = additionalCustomers * acv;
      recs.push({ text: `A 1-point conversion improvement adds ~${Math.round(additionalCustomers)} customers/month = ${fmtCurrency(additionalRevenue)}/year in new revenue.`, numbers: { customers: additionalCustomers, revenue: additionalRevenue } });
      recs.push({ text: 'Audit your lead-to-SQL and SQL-to-opportunity handoffs. The drop is likely concentrated in one stage.', numbers: {} });
      recs.push({ text: 'Consider lead scoring to focus sales effort on higher-intent prospects.', numbers: {} });
      break;
    }
    case 'optimization_mode': {
      const weakest = findWeakestMetric(metrics);
      if (weakest) {
        recs.push({ text: `Your weakest metric is ${weakest.label} at ${weakest.formatted}. Improving it to the next benchmark tier would yield the highest marginal return.`, numbers: {} });
      }
      recs.push({ text: 'Consider testing a new acquisition channel with 10-15% of budget to find additional scale.', numbers: {} });
      recs.push({ text: 'At this stage, small improvements compound. Focus on the metric closest to its next threshold.', numbers: {} });
      break;
    }
  }

  return recs.slice(0, 3);
}

// ── Outlier Detection ──

export function detectOutliers({ arr, acv, marketingSpend, newCustomersMonth, monthlyChurnRate, cacValue, ltvCacValue }) {
  const warnings = [];

  if (cacValue > 50000) {
    warnings.push(`Your CAC (${fmtCurrency(cacValue)}) is unusually high. Double-check that your marketing spend and customer count are accurate.`);
  }

  if (monthlyChurnRate > 25) {
    warnings.push(`A ${fmtPercent(monthlyChurnRate)} monthly churn rate means average customer lifespan under 4 months. Verify this is correct.`);
  }

  if (acv > arr && arr > 0) {
    warnings.push(`Your ACV (${fmtCurrency(acv)}) exceeds your ARR (${fmtCurrency(arr)}). This may indicate a data entry issue.`);
  }

  // Sanity: implied customer count from ARR/ACV vs new customers
  if (acv > 0) {
    const impliedCustomers = arr / acv;
    if (newCustomersMonth > impliedCustomers * 2) {
      warnings.push(`You're adding ${fmtNum(newCustomersMonth)} customers/month but your ARR implies only ~${Math.round(impliedCustomers)} total customers. Verify your numbers.`);
    }
  }

  if (ltvCacValue > 20) {
    warnings.push(`Your LTV:CAC (${fmtRatio(ltvCacValue)}) is unusually high. This may indicate undercounted marketing costs or very optimistic churn assumptions.`);
  }

  return warnings;
}
