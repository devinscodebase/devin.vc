<script>
  /* ── Wizard state ── */
  let currentStep = $state(1);
  let direction = $state(1); // 1 = forward, -1 = back

  /* ── Inputs ── */
  let revenueTarget = $state(null);
  let dealSize = $state(null);
  let isRecurring = $state(false); // false = one-time, true = recurring
  let salesCycle = $state(90);
  let closeRate = $state(25);
  let sqlToOpp = $state(50);
  let leadToSql = $state(20);
  let costPerLead = $state(null);
  let grossMargin = $state(70);
  let customerLifespan = $state(null); // months, only for recurring

  /* ── Step definitions ── */
  let steps = $derived((() => {
    const base = [
      { id: 'revenue', label: 'What\'s your annual revenue target?', field: 'currency' },
      { id: 'deal', label: isRecurring ? 'What\'s your monthly contract value?' : 'What\'s your average deal size?', field: 'currency-toggle' },
      { id: 'cycle', label: 'How long is your average sales cycle?', field: 'days', default: 90, benchmark: 'Industry average: 90 days' },
      { id: 'close', label: 'What % of opportunities become closed deals?', field: 'percent', default: 25, benchmark: 'B2B average: 25%' },
      { id: 'sql-opp', label: 'What % of qualified leads become opportunities?', field: 'percent', default: 50, benchmark: 'Industry average: 50%' },
      { id: 'lead-sql', label: 'What % of leads become sales-qualified?', field: 'percent', default: 20, benchmark: 'Industry average: 20%' },
      { id: 'cpl', label: 'What\'s your average cost per lead?', field: 'currency' },
      { id: 'margin', label: 'What\'s your gross margin?', field: 'percent', default: 70, benchmark: 'B2B SaaS average: 70%' },
    ];
    if (isRecurring) {
      base.push({ id: 'lifespan', label: 'How long does a typical customer stay?', field: 'months' });
    }
    return base;
  })());

  let totalSteps = $derived(steps.length);
  let showResults = $state(false);

  /* ── Derived calculations ── */
  let canCalculate = $derived(
    revenueTarget > 0 && dealSize > 0 && costPerLead > 0 &&
    (!isRecurring || customerLifespan > 0)
  );

  let results = $derived((() => {
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

    // Pipeline
    const monthlyRevenueTarget = annualRevenue / 12;
    const pipelineCoverage = monthlyRevenueTarget * 3.5;
    const salesCycleMonths = salesCycle / 30;

    return {
      // Funnel
      dealsPerYear, dealsPerMonth,
      oppsPerMonth, oppsPerWeek,
      sqlsPerMonth, sqlsPerWeek,
      leadsPerMonth, leadsPerWeek, leadsPerDay,
      // Rates for display on funnel connectors
      leadToSqlRate: leadToSql,
      sqlToOppRate: sqlToOpp,
      closeRateVal: closeRate,
      // Budget
      monthlyBudget, annualBudget, spendPercent, cac,
      // Unit economics
      ltv, ltvCacRatio, ltvCacHealth, cacDealPercent,
      cacWarning: cacDealPercent > 50,
      // Pipeline
      pipelineCoverage,
      timeToRevenue: salesCycleMonths,
      rampUp: salesCycleMonths,
      // Meta
      effectiveDealValue,
    };
  })());

  /* ── Navigation ── */
  function next() {
    if (currentStep < totalSteps) {
      direction = 1;
      currentStep++;
    } else if (canCalculate) {
      showResults = true;
    }
  }

  function back() {
    if (showResults) {
      showResults = false;
    } else if (currentStep > 1) {
      direction = -1;
      currentStep--;
    }
  }

  function startOver() {
    revenueTarget = null;
    dealSize = null;
    isRecurring = false;
    salesCycle = 90;
    closeRate = 25;
    sqlToOpp = 50;
    leadToSql = 20;
    costPerLead = null;
    grossMargin = 70;
    customerLifespan = null;
    currentStep = 1;
    showResults = false;
    direction = 1;
  }

  /* ── Get/set current step value ── */
  function getValue(stepIndex) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'revenue': return revenueTarget;
      case 'deal': return dealSize;
      case 'cycle': return salesCycle;
      case 'close': return closeRate;
      case 'sql-opp': return sqlToOpp;
      case 'lead-sql': return leadToSql;
      case 'cpl': return costPerLead;
      case 'margin': return grossMargin;
      case 'lifespan': return customerLifespan;
    }
  }

  function setValue(stepIndex, val) {
    const step = steps[stepIndex];
    switch (step.id) {
      case 'revenue': revenueTarget = val; break;
      case 'deal': dealSize = val; break;
      case 'cycle': salesCycle = val; break;
      case 'close': closeRate = val; break;
      case 'sql-opp': sqlToOpp = val; break;
      case 'lead-sql': leadToSql = val; break;
      case 'cpl': costPerLead = val; break;
      case 'margin': grossMargin = val; break;
      case 'lifespan': customerLifespan = val; break;
    }
  }

  /* ── Formatting helpers ── */
  function fmtCurrency(n) {
    if (n == null) return '\u2014';
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  }

  function fmtNum(n, decimals = 1) {
    if (n == null) return '\u2014';
    return n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  }

  function fmtPercent(n) {
    if (n == null) return '\u2014';
    return n.toFixed(1) + '%';
  }

  /* ── Clipboard ── */
  let copied = $state(false);

  async function copyResults() {
    if (!results) return;
    const r = results;
    const dealLabel = isRecurring ? 'MCV' : 'deal size';
    const oneLiner = `GTM Plan: ${fmtCurrency(revenueTarget)} Revenue Target \u2014 ${fmtNum(r.dealsPerYear, 0)} deals/year at ${fmtCurrency(r.effectiveDealValue)} ${dealLabel} \u2014 ${fmtNum(r.leadsPerMonth, 0)} leads/month needed \u2014 ${fmtCurrency(r.monthlyBudget)}/mo marketing budget \u2014 LTV:CAC ${fmtNum(r.ltvCacRatio)}:1 (${r.ltvCacHealth})`;

    const full = `${oneLiner}

FUNNEL
  Leads: ${fmtNum(r.leadsPerMonth, 0)}/month | ${fmtNum(r.leadsPerWeek, 0)}/week | ${fmtNum(r.leadsPerDay, 1)}/day
  SQLs: ${fmtNum(r.sqlsPerMonth, 0)}/month | ${fmtNum(r.sqlsPerWeek, 1)}/week (${r.leadToSqlRate}% conversion)
  Opportunities: ${fmtNum(r.oppsPerMonth, 0)}/month | ${fmtNum(r.oppsPerWeek, 1)}/week (${r.sqlToOppRate}% conversion)
  Closed Deals: ${fmtNum(r.dealsPerMonth, 1)}/month (${r.closeRateVal}% close rate)

BUDGET
  Monthly: ${fmtCurrency(r.monthlyBudget)}
  Annual: ${fmtCurrency(r.annualBudget)}
  % of revenue target: ${fmtPercent(r.spendPercent)}
  Cost per acquisition: ${fmtCurrency(r.cac)}

UNIT ECONOMICS
  CAC: ${fmtCurrency(r.cac)}
  LTV: ${fmtCurrency(r.ltv)}
  LTV:CAC: ${fmtNum(r.ltvCacRatio)}:1 (${r.ltvCacHealth})${r.cacWarning ? `\n  \u26A0 CAC is ${fmtPercent(r.cacDealPercent)} of deal size` : ''}

PIPELINE
  Pipeline coverage needed: ${fmtCurrency(r.pipelineCoverage)} active at all times (3.5x)
  Time to first revenue: ~${fmtNum(r.timeToRevenue, 1)} months from first spend
  Steady-state pipeline: ~${fmtNum(r.rampUp, 1)} months to fully load

Generated at devin.vc/tools/gtm-planner`;

    await navigator.clipboard.writeText(full);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

{#if showResults && results}
  <div class="results-placeholder">
    <p>Results ready. Leads/month: {fmtNum(results.leadsPerMonth, 0)}</p>
    <button onclick={startOver}>Start over</button>
  </div>
{:else}
  <div class="wizard-placeholder">
    <p>Step {currentStep} of {totalSteps}: {steps[currentStep - 1].label}</p>
    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
      <button onclick={back} disabled={currentStep === 1}>Back</button>
      <button onclick={next}>Next</button>
    </div>
  </div>
{/if}
